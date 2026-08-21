from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models
from app.schemas import ShowResponse, ShowDetailResponse

router = APIRouter(tags=["shows"])

def _update_show_status(show_id: int, db: Session):
    show = db.query(models.Show).filter_by(id=show_id).first()
    if not show: return
    
    total_eps = db.query(models.Episode).filter_by(show_id=show_id, is_special=False).count()
    watched_eps = db.query(models.Episode).filter_by(show_id=show_id, is_special=False, is_watched=True).count()
    
    if total_eps > 0 and watched_eps >= total_eps:
        show.status = 'up_to_date'
    elif show.status == 'up_to_date':
        show.status = 'continuing'
        
    db.commit()

@router.get("/shows", response_model=List[ShowResponse])
def get_shows(
    skip: int = 0,
    limit: int = Query(1000, le=5000),
    db: Session = Depends(get_db)
):
    shows = db.query(models.Show).order_by(models.Show.title).offset(skip).limit(limit).all()
    return shows

@router.get("/shows/{show_id}", response_model=ShowDetailResponse)
def get_show_detail(show_id: int, db: Session = Depends(get_db)):
    show = db.query(models.Show).filter(models.Show.id == show_id).first()
    if not show:
        return None
    
    episodes = db.query(models.Episode).filter(models.Episode.show_id == show_id).order_by(models.Episode.season_number, models.Episode.episode_number).all()
    
    watched_count = sum(1 for ep in episodes if ep.is_watched)
    
    base_data = ShowResponse.model_validate(show).model_dump()
    return ShowDetailResponse(**base_data, watched_episode_count=watched_count, episodes=episodes)

@router.post("/episodes/{episode_id}/watched")
def toggle_episode_watched(episode_id: int, db: Session = Depends(get_db)):
    episode = db.query(models.Episode).filter_by(id=episode_id).first()
    if episode:
        episode.is_watched = not episode.is_watched
        if episode.is_watched:
            episode.watched_count += 1
        db.commit()
        _update_show_status(episode.show_id, db)
        show = db.query(models.Show).filter_by(id=episode.show_id).first()
        return {"status": "success", "is_watched": episode.is_watched, "show_status": show.status if show else None}
    return {"status": "error", "message": "Episode not found"}

@router.post("/shows/{show_id}/seasons/{season_number}/watched")
def toggle_season_watched(show_id: int, season_number: int, db: Session = Depends(get_db)):
    episodes = db.query(models.Episode).filter_by(show_id=show_id, season_number=season_number).all()
    if not episodes:
        return {"status": "error", "message": "Season not found"}
    
    all_watched = all(ep.is_watched for ep in episodes)
    for ep in episodes:
        ep.is_watched = not all_watched
        if not all_watched:
            ep.watched_count += 1
    db.commit()
    _update_show_status(show_id, db)
    show = db.query(models.Show).filter_by(id=show_id).first()
    return {"status": "success", "is_watched": not all_watched, "show_status": show.status if show else None}

@router.post("/shows/{id}/favorite")
def toggle_show_favorite(id: int, db: Session = Depends(get_db)):
    show = db.query(models.Show).filter(models.Show.id == id).first()
    if show:
        show.is_favorite = not show.is_favorite
        db.commit()
        return {"status": "success", "is_favorite": show.is_favorite}
    return {"status": "error", "message": "Show not found"}

@router.post("/shows/{id}/rewatch")
def toggle_show_rewatch(id: int, db: Session = Depends(get_db)):
    show = db.query(models.Show).filter(models.Show.id == id).first()
    if show:
        if show.watched_count > 1:
            show.watched_count = 1
        else:
            show.watched_count = 2
        db.commit()
        return {"status": "success", "watched_count": show.watched_count}
    return {"status": "error", "message": "Show not found"}
