from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Show(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(Text, unique=True, index=True, nullable=False)
    tvdb_id = Column(Integer, unique=True, index=True, nullable=True)
    imdb_id = Column(Text, index=True, nullable=True)
    
    title = Column(Text, nullable=False)
    status = Column(Text, nullable=False) # e.g. up_to_date, stopped, continuing
    is_favorite = Column(Boolean, default=False)
    
    # Enriched from TMDB
    tmdb_id = Column(Integer, unique=True, index=True, nullable=True)
    poster_path = Column(Text, nullable=True)
    overview = Column(Text, nullable=True)
    genres = Column(Text, nullable=True)
    year = Column(Integer, nullable=True)
    total_episodes = Column(Integer, nullable=True)
    language = Column(Text, nullable=True)
    country = Column(Text, nullable=True)
    
    watched_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    episodes = relationship("Episode", back_populates="show")

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False)
    tvdb_id = Column(Integer, unique=True, index=True, nullable=True)
    
    season_number = Column(Integer, nullable=True)
    episode_number = Column(Integer, nullable=True)
    name = Column(Text, nullable=True)
    is_special = Column(Boolean, default=False)
    
    is_watched = Column(Boolean, default=False)
    watched_at = Column(DateTime(timezone=True), nullable=True)
    watched_count = Column(Integer, default=0)
    air_date = Column(DateTime(timezone=True), nullable=True)

    show = relationship("Show", back_populates="episodes")

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(Text, unique=True, index=True, nullable=False)
    tvdb_id = Column(Integer, unique=True, index=True, nullable=True)
    imdb_id = Column(Text, unique=True, index=True, nullable=True)
    
    title = Column(Text, nullable=False)
    year = Column(Integer, nullable=True)
    
    is_watched = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    watched_at = Column(DateTime(timezone=True), nullable=True)
    watched_count = Column(Integer, default=0)
    
    # Enriched from TMDB
    tmdb_id = Column(Integer, unique=True, index=True, nullable=True)
    poster_path = Column(Text, nullable=True)
    overview = Column(Text, nullable=True)
    genres = Column(Text, nullable=True)
    language = Column(Text, nullable=True)
    country = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
