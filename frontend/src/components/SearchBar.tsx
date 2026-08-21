"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';

interface SearchResult {
  tmdb_id: number;
  title: string;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  year: number | null;
  in_library: boolean;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        fetch(`http://127.0.0.1:8000/api/search?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            setResults(data.results || []);
            setIsSearching(false);
            setIsOpen(true);
          })
          .catch(err => {
            console.error(err);
            setIsSearching(false);
          });
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = async (e: React.MouseEvent, result: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (result.in_library || addingIds.has(result.tmdb_id)) return;
    
    setAddingIds(prev => new Set(prev).add(result.tmdb_id));
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/library/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tmdb_id: result.tmdb_id, media_type: result.media_type })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResults(prev => prev.map(r => r.tmdb_id === result.tmdb_id ? { ...r, in_library: true } : r));
      }
    } catch(err) {
      console.error(err);
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(result.tmdb_id);
        return next;
      });
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, maxWidth: '500px', margin: '0 24px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg style={{ position: 'absolute', left: '12px', color: 'var(--colors-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search TMDB for movies or shows..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className={styles.searchInput}
        />
        {isSearching && (
          <div style={{ position: 'absolute', right: '12px' }}>
            <span className={styles.spinner}></span>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={`${styles.searchDropdown} hide-scrollbar`}>
          {results.map(r => (
            <div key={r.tmdb_id} className={styles.searchResultItem}>
              {r.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt={r.title} className={styles.searchResultPoster} />
              ) : (
                <div className={styles.searchResultPosterFallback}>No Image</div>
              )}
              
              <div className={styles.searchResultInfo}>
                <div className={styles.searchResultTitle}>{r.title}</div>
                <div className={styles.searchResultMeta}>
                  <span style={{ textTransform: 'uppercase' }}>{r.media_type === 'tv' ? 'Show' : 'Movie'}</span>
                  {r.year && <span> • {r.year}</span>}
                </div>
              </div>
              
              <button 
                className={`${styles.searchAddBtn} ${r.in_library ? styles.searchAddBtnAdded : ''}`}
                onClick={(e) => handleAdd(e, r)}
                disabled={r.in_library || addingIds.has(r.tmdb_id)}
              >
                {r.in_library ? 'In Library' : addingIds.has(r.tmdb_id) ? 'Adding...' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
