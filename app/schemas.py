from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class SearchAddRequest(BaseModel):
    tmdb_id: int
    media_type: str

class ShowResponse(BaseModel):
    id: int
    title: str
    tmdb_id: Optional[int] = None
    poster_path: Optional[str] = None
    overview: Optional[str] = None
    genres: Optional[str] = None
    year: Optional[int] = None
    total_episodes: Optional[int] = None
    language: Optional[str] = None
    country: Optional[str] = None
    status: str
    is_favorite: bool
    watched_count: int = 0

    class Config:
        from_attributes = True

class EpisodeResponse(BaseModel):
    id: int
    season_number: Optional[int] = None
    episode_number: Optional[int] = None
    name: Optional[str] = None
    is_watched: bool
    watched_at: Optional[datetime] = None
    air_date: Optional[datetime] = None
    is_special: bool

    class Config:
        from_attributes = True

class MovieResponse(BaseModel):
    id: int
    title: str
    tmdb_id: Optional[int] = None
    poster_path: Optional[str] = None
    overview: Optional[str] = None
    genres: Optional[str] = None
    year: Optional[int] = None
    language: Optional[str] = None
    country: Optional[str] = None
    is_watched: bool
    is_favorite: bool
    watched_count: int

    class Config:
        from_attributes = True

class ShowDetailResponse(ShowResponse):
    watched_episode_count: int
    episodes: List[EpisodeResponse]

class MovieDetailResponse(MovieResponse):
    pass
