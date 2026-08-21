import React from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { ShowDetail, MovieDetail } from '@/types/media';

interface MediaDetailsHeaderProps {
  details: ShowDetail | MovieDetail;
  type: 'show' | 'movie';
  id: number;
  setDetails: React.Dispatch<React.SetStateAction<ShowDetail | MovieDetail | null>>;
}

export function MediaDetailsHeader({ details, type, id, setDetails }: MediaDetailsHeaderProps) {
  const toggleMovieWatched = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type !== 'movie') return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/movies/${id}/watched`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDetails(prev => {
          if (!prev || type !== 'movie') return prev;
          const moviePrev = prev as MovieDetail;
          return { ...moviePrev, is_watched: data.is_watched, watched_count: data.is_watched ? moviePrev.watched_count + 1 : moviePrev.watched_count };
        });
      }
    } catch(err) { console.error(err); }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/${type}s/${id}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDetails(prev => prev ? { ...prev, is_favorite: data.is_favorite } : prev);
      }
    } catch (err) { console.error(err); }
  };

  const toggleRewatch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/${type}s/${id}/rewatch`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDetails(prev => {
          if (!prev) return prev;
          if (type === 'movie') {
            return { ...prev, watched_count: data.watched_count, is_watched: data.is_watched } as MovieDetail;
          } else {
            return { ...prev, watched_count: data.watched_count } as ShowDetail;
          }
        });
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {details.poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
          alt={details.title}
          style={{ width: '280px', flexShrink: 0, aspectRatio: '2 / 3', borderRadius: 'var(--rounded-md)', objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
        />
      )}
      <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="t-eyebrow" style={{ color: 'var(--colors-primary)', marginBottom: '12px' }}>
            {type.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span className="t-eyebrow" style={{ marginRight: '8px' }}>TAGS</span>
          <button 
            onClick={toggleFavorite}
            className={`pricing-tab ${details.is_favorite ? 'pricing-tab-selected' : ''}`}
            style={{ fontSize: '0.85rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Heart size={14} fill={details.is_favorite ? 'currentColor' : 'none'} />
            Favorite
          </button>
          <button 
            onClick={toggleRewatch}
            className={`pricing-tab ${(type === 'movie' ? (details as MovieDetail).watched_count : (details as ShowDetail).watched_count) > 1 ? 'pricing-tab-selected' : ''}`}
            style={{ fontSize: '0.85rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} />
            Rewatch
          </button>
        </div>

        <h2 className="t-headline" style={{ marginBottom: '20px', fontSize: '2rem' }}>{details.title}</h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span className="pricing-tab pricing-tab-selected" style={{ cursor: 'default', fontSize: '0.9rem', padding: '6px 12px' }}>
            {type === 'show' ? `Watched: ${(details as ShowDetail).watched_episode_count} / ${(details as ShowDetail).total_episodes || '?'}` : `Watches: ${(details as MovieDetail).watched_count}`}
          </span>
          {details.year && (
            <span className="pricing-tab" style={{ cursor: 'default', backgroundColor: 'var(--colors-surface-soft)', fontSize: '0.9rem', padding: '6px 12px' }}>
              Year: {details.year}
            </span>
          )}
          {details.language && (
            <span className="pricing-tab" style={{ cursor: 'default', backgroundColor: 'var(--colors-surface-soft)', fontSize: '0.9rem', padding: '6px 12px', textTransform: 'uppercase' }}>
              {details.language}
            </span>
          )}
          {details.country && (
            <span className="pricing-tab" style={{ cursor: 'default', backgroundColor: 'var(--colors-surface-soft)', fontSize: '0.9rem', padding: '6px 12px' }}>
              {details.country}
            </span>
          )}
          {details.is_favorite && (
            <span className="pricing-tab" style={{ cursor: 'default', backgroundColor: 'var(--colors-surface-soft)', fontSize: '0.9rem', padding: '6px 12px' }}>
              Favorited
            </span>
          )}
        </div>
        
        <p className="t-body" style={{ color: 'var(--colors-text-muted)', marginBottom: '32px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {details.overview || 'No overview available.'}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          {details.tmdb_id ? (
            <a
              href={`https://www.themoviedb.org/${type === 'show' ? 'tv' : 'movie'}/${details.tmdb_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="t-eyebrow"
              style={{ color: 'var(--colors-primary)', textDecoration: 'underline' }}
            >
              &larr; View on TMDB
            </a>
          ) : <div></div>}
          {type === 'movie' && (
            <button 
              onClick={toggleMovieWatched}
              title={(details as MovieDetail).is_watched ? "Mark Unwatched" : "Mark Watched"}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', border: '2px solid',
                borderColor: (details as MovieDetail).is_watched ? 'var(--colors-semantic-success)' : 'var(--colors-hairline)',
                backgroundColor: (details as MovieDetail).is_watched ? 'var(--colors-semantic-success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease', flexShrink: 0
              }}
            >
               {(details as MovieDetail).is_watched && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
