import uuid
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db, SessionLocal
from app.db import models
from app.schemas import SearchAddRequest
from app.services.tmdb_client import get_session, fetch_genres, TMDB_API_KEY
from app.services.tmdb_sync import sync_single_show, sync_single_movie

router = APIRouter(tags=["library"])

def background_sync_item(tmdb_id: int, media_type: str):
    db = SessionLocal()
    session = get_session()
    try:
        if media_type == "movie":
            movie = db.query(models.Movie).filter_by(tmdb_id=tmdb_id).first()
            if movie: sync_single_movie(movie, session, db)
        else:
            show = db.query(models.Show).filter_by(tmdb_id=tmdb_id).first()
            if show: sync_single_show(show, session, db)
    except Exception as e:
        print(f"Background sync error: {e}")
    finally:
        db.close()

@router.get("/search")
def search_tmdb(q: str, db: Session = Depends(get_db)):
    if not TMDB_API_KEY:
        return {"results": []}
    
    session = get_session()
    url = "https://api.themoviedb.org/3/search/multi"
    params = {"api_key": TMDB_API_KEY, "query": q, "language": "en-US", "page": 1}
    
    try:
        response = session.get(url, params=params)
        if response.status_code != 200:
            return {"results": []}
            
        data = response.json()
        raw_results = data.get("results", [])
        
        filtered = [r for r in raw_results if r.get("media_type") in ["movie", "tv"]]
        
        results = []
        for r in filtered:
            tmdb_id = r.get("id")
            media_type = r.get("media_type")
            in_library = False
            
            if media_type == "movie":
                exists = db.query(models.Movie).filter_by(tmdb_id=tmdb_id).first()
                if exists: in_library = True
            else:
                exists = db.query(models.Show).filter_by(tmdb_id=tmdb_id).first()
                if exists: in_library = True
                
            year = None
            if r.get("release_date"):
                try: year = int(r.get("release_date").split("-")[0])
                except: pass
            elif r.get("first_air_date"):
                try: year = int(r.get("first_air_date").split("-")[0])
                except: pass

            results.append({
                "tmdb_id": tmdb_id,
                "title": r.get("title") or r.get("name"),
                "media_type": media_type,
                "poster_path": r.get("poster_path"),
                "year": year,
                "in_library": in_library
            })
            
        return {"results": results}
    except Exception as e:
        print(f"Search error: {e}")
        return {"results": []}

@router.post("/library/add")
def add_to_library(req: SearchAddRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if req.media_type == "movie":
        existing = db.query(models.Movie).filter_by(tmdb_id=req.tmdb_id).first()
        if not existing:
            new_movie = models.Movie(
                uuid=str(uuid.uuid4()),
                tmdb_id=req.tmdb_id,
                title="Loading...",
                is_watched=False,
                is_favorite=False,
                watched_count=0
            )
            db.add(new_movie)
            db.commit()
    elif req.media_type == "tv":
        existing = db.query(models.Show).filter_by(tmdb_id=req.tmdb_id).first()
        if not existing:
            new_show = models.Show(
                uuid=str(uuid.uuid4()),
                tmdb_id=req.tmdb_id,
                title="Loading...",
                status="Continuing",
                is_favorite=False
            )
            db.add(new_show)
            db.commit()
    else:
        return {"status": "error", "message": "Invalid media type"}
        
    background_tasks.add_task(background_sync_item, req.tmdb_id, req.media_type)
    
    return {"status": "success"}

@router.post("/library/refresh-failed")
def refresh_failed(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    failed_movies = db.query(models.Movie).filter(models.Movie.title == "Loading...").all()
    for m in failed_movies:
        if m.tmdb_id:
            background_tasks.add_task(background_sync_item, m.tmdb_id, "movie")
            
    failed_shows = db.query(models.Show).filter(models.Show.title == "Loading...").all()
    for s in failed_shows:
        if s.tmdb_id:
            background_tasks.add_task(background_sync_item, s.tmdb_id, "tv")
            
    return {"status": "success", "movies_queued": len(failed_movies), "shows_queued": len(failed_shows)}
