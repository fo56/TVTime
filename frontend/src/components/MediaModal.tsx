import React, { useEffect, useState } from 'react';
import { ShowDetail, MovieDetail } from '@/types/media';
import { SeasonList } from './SeasonList';
import { MediaDetailsHeader } from './MediaDetailsHeader';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'show' | 'movie';
  id: number | null;
}

export function MediaModal({ isOpen, onClose, type, id }: MediaModalProps) {
  const [details, setDetails] = useState<ShowDetail | MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && id !== null) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/${type}s/${id}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setDetails(null);
    }
  }, [isOpen, id, type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay-scrim" onClick={onClose}>
      <div className="modal-card hide-scrollbar" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        {loading ? (
          <p className="t-body">Loading details...</p>
        ) : details ? (
          <>
            <MediaDetailsHeader 
              details={details} 
              type={type} 
              id={id as number} 
              setDetails={setDetails} 
            />

            {type === 'show' && details && (details as ShowDetail).episodes && (
              <SeasonList 
                showId={id as number} 
                episodes={(details as ShowDetail).episodes} 
                setDetails={setDetails} 
              />
            )}
          </>
        ) : (
          <p className="t-body">Failed to load details.</p>
        )}
      </div>
    </div>
  );
}
