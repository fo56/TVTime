from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models
from app.schemas import MovieResponse, MovieDetailResponse

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("", response_model=List[MovieResponse])
def get_movies(
    skip: int = 0,
    limit: int = Query(1000, le=5000),
    db: Session = Depends(get_db)
):
    movies = db.query(models.Movie).order_by(models.Movie.title).offset(skip).limit(limit).all()
    return movies

@router.get("/{movie_id}", response_model=MovieDetailResponse)
def get_movie_detail(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        return None
        
    base_data = MovieResponse.model_validate(movie).model_dump()
    return MovieDetailResponse(**base_data)

@router.post("/{movie_id}/watched")
def toggle_movie_watched(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter_by(id=movie_id).first()
    if movie:
        movie.is_watched = not movie.is_watched
        if movie.is_watched:
            movie.watched_count += 1
        db.commit()
        return {"status": "success", "is_watched": movie.is_watched}
    return {"status": "error", "message": "Movie not found"}

@router.post("/{id}/favorite")
def toggle_movie_favorite(id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == id).first()
    if movie:
        movie.is_favorite = not movie.is_favorite
        db.commit()
        return {"status": "success", "is_favorite": movie.is_favorite}
    return {"status": "error", "message": "Movie not found"}

@router.post("/{id}/rewatch")
def toggle_movie_rewatch(id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == id).first()
    if movie:
        if movie.watched_count > 1:
            movie.watched_count = 1
        else:
            movie.watched_count = 2
            movie.is_watched = True
        db.commit()
        return {"status": "success", "watched_count": movie.watched_count, "is_watched": movie.is_watched}
    return {"status": "error", "message": "Movie not found"}
