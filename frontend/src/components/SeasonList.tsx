import React, { useState, useMemo } from 'react';
import { Episode, ShowDetail } from '@/types/media';

interface SeasonListProps {
  showId: number;
  episodes: Episode[];
  setDetails: React.Dispatch<React.SetStateAction<any>>;
}

export function SeasonList({ showId, episodes, setDetails }: SeasonListProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);

  const availableSeasons = useMemo(() => {
    return Array.from(new Set(episodes.filter(e => e.season_number !== null).map(e => e.season_number as number))).sort((a, b) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });
  }, [episodes]);

  // Set initial expanded season once when seasons load
  React.useEffect(() => {
    if (availableSeasons.length > 0 && expandedSeasons.length === 0) {
      setExpandedSeasons([availableSeasons[0]]);
    }
  }, [availableSeasons]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSeasonAccordion = (s: number) => {
    if (expandedSeasons.includes(s)) {
      setExpandedSeasons(expandedSeasons.filter(x => x !== s));
    } else {
      setExpandedSeasons([...expandedSeasons, s]);
    }
  };

  const toggleEpisodeWatched = async (episodeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/episodes/${episodeId}/watched`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDetails((prev: any) => {
          if (!prev) return prev;
          const showPrev = prev as ShowDetail;
          const updatedEpisodes = showPrev.episodes.map(ep => ep.id === episodeId ? { ...ep, is_watched: data.is_watched } : ep);
          const newWatchedCount = updatedEpisodes.filter(ep => ep.is_watched).length;
          return { ...showPrev, episodes: updatedEpisodes, watched_episode_count: newWatchedCount, status: data.show_status || showPrev.status };
        });
      }
    } catch(err) { console.error(err); }
  }

  const toggleSeasonWatched = async (seasonNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/shows/${showId}/seasons/${seasonNumber}/watched`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDetails((prev: any) => {
          if (!prev) return prev;
          const showPrev = prev as ShowDetail;
          const updatedEpisodes = showPrev.episodes.map(ep => ep.season_number === seasonNumber ? { ...ep, is_watched: data.is_watched } : ep);
          const newWatchedCount = updatedEpisodes.filter(ep => ep.is_watched).length;
          return { ...showPrev, episodes: updatedEpisodes, watched_episode_count: newWatchedCount, status: data.show_status || showPrev.status };
        });
      }
    } catch(err) { console.error(err); }
  }

  if (availableSeasons.length === 0) return null;

  return (
    <div style={{ marginTop: '48px' }}>
      <h3 className="t-headline" style={{ marginBottom: '24px' }}>Seasons</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {availableSeasons.map(seasonNumber => {
          const seasonEps = episodes.filter(ep => ep.season_number === seasonNumber);
          const isExpanded = expandedSeasons.includes(seasonNumber);
          const allWatched = seasonEps.length > 0 && seasonEps.every(ep => ep.is_watched);
          
          return (
            <div key={seasonNumber} style={{ backgroundColor: 'var(--colors-surface)', borderRadius: 'var(--rounded-md)', border: '1px solid var(--colors-hairline)', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleSeasonAccordion(seasonNumber)}
                style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: 'var(--colors-canvas)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h4 className="t-subhead" style={{ margin: 0 }}>
                    {seasonNumber === 0 ? "Specials" : `Season ${seasonNumber}`}
                  </h4>
                  <span style={{ color: 'var(--colors-text-muted)', fontSize: 'var(--typography-body-sm)' }}>
                    ({seasonEps.filter(e => e.is_watched).length} / {seasonEps.length} watched)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button 
                    onClick={(e) => toggleSeasonWatched(seasonNumber, e)}
                    title={allWatched ? "Mark Season Unwatched" : "Mark Season Watched"}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%', border: '2px solid',
                      borderColor: allWatched ? 'var(--colors-semantic-success)' : 'var(--colors-hairline)',
                      backgroundColor: allWatched ? 'var(--colors-semantic-success)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease', flexShrink: 0
                    }}
                  >
                     {allWatched && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--colors-text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--colors-hairline)' }}>
                  {seasonEps.map(ep => (
                    <div key={ep.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', backgroundColor: 'var(--colors-surface)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 'var(--typography-body)' }}>
                          {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                        </div>
                        <div style={{ color: 'var(--colors-text-muted)', fontSize: 'var(--typography-caption)', marginTop: '4px' }}>
                          {ep.air_date ? new Date(ep.air_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Air Date'}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => toggleEpisodeWatched(ep.id, e)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', flexShrink: 0, marginLeft: '16px',
                          borderColor: ep.is_watched ? 'var(--colors-semantic-success)' : 'var(--colors-hairline)',
                          backgroundColor: ep.is_watched ? 'var(--colors-semantic-success)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease'
                        }}
                      >
                         {ep.is_watched && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
