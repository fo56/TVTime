from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    show_count = db.query(models.Show).count()
    movie_count = db.query(models.Movie).count()
    episode_watches = db.query(models.Episode).filter(models.Episode.is_watched == True).count()
    
    movie_watches_result = db.query(func.sum(models.Movie.watched_count)).scalar()
    movie_watches = movie_watches_result if movie_watches_result else 0
    
    return {
        "shows": show_count,
        "movies": movie_count,
        "total_episodes_watched": episode_watches,
        "total_movies_watched": movie_watches
    }
