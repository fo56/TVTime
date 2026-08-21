import React from 'react';

export function MediaCard({
  title,
  poster_path,
  genres,
  year,
  onClick
}: {
  title: string;
  poster_path: string | null;
  genres: string | null;
  year?: number | null;
  onClick: () => void;
}) {
  const posterUrl = poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '';

  return (
    <div className="template-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      {posterUrl ? (
        <img src={posterUrl} alt={title} className="template-card-img" loading="lazy" />
      ) : (
        <div className="template-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--colors-hairline)' }}>
          <span className="t-caption">No Image</span>
        </div>
      )}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="template-card-meta" style={{ fontSize: '0.85rem', color: 'var(--colors-text-muted)', marginBottom: '8px' }}>
          {year ? `${year} • ` : ''}{genres?.split(',')[0] || 'Unknown'}
        </div>
        <div className="template-card-title" style={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.3 }}>{title}</div>
      </div>
    </div>
  );
}
