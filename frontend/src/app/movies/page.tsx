"use client";

import React, { useState } from 'react';
import { MediaCard } from '@/components/MediaCard';
import { MediaModal } from '@/components/MediaModal';
import Dropdown from '@/components/Dropdown';
import { useMovies, FilterStatus, SortOption } from '@/hooks/useMovies';

export default function MoviesPage() {
  const {
    loading, filteredMovies,
    filter, setFilter,
    sort, setSort,
    genreFilter, setGenreFilter, allGenres,
    languageFilter, setLanguageFilter, allLanguages,
    countryFilter, setCountryFilter, allCountries
  } = useMovies();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <main>
      <section className="container section-gap" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div style={{ minHeight: '80vh' }}>
          <h1 className="t-display-xl" style={{ marginBottom: '48px' }}>Movies.</h1>
          
          <div className="filter-bar" style={{ gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Watched', 'Not Watched', 'Favorites', 'Rewatches'].map(f => (
                <button 
                  key={f}
                  className={`pricing-tab ${filter === f ? 'pricing-tab-selected' : ''}`}
                  onClick={() => setFilter(f as FilterStatus)}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div style={{ flex: 1 }}></div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Dropdown 
                value={genreFilter}
                options={allGenres}
                onChange={setGenreFilter}
              />

              <Dropdown 
                value={languageFilter}
                options={allLanguages}
                onChange={setLanguageFilter}
              />

              <Dropdown 
                value={countryFilter}
                options={allCountries}
                onChange={setCountryFilter}
              />

              <Dropdown 
                value={sort}
                options={['Recently Added', 'A-Z', 'Year (Newest)', 'Year (Oldest)']}
                onChange={(val) => setSort(val as SortOption)}
                prefix="Sort"
              />
            </div>
          </div>

          {loading ? (
            <p className="t-body">Loading your massive library...</p>
          ) : (
            <>
              <p className="t-eyebrow" style={{ marginBottom: 'var(--spacing-lg)' }}>Showing {filteredMovies.length} titles</p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: 'var(--spacing-xs)' 
              }}>
                {filteredMovies.map(movie => (
                  <MediaCard 
                    key={movie.id} 
                    title={movie.title}
                    poster_path={movie.poster_path}
                    genres={movie.genres}
                    year={movie.year}
                    onClick={() => setSelectedId(movie.id)} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <MediaModal 
        isOpen={selectedId !== null} 
        onClose={() => setSelectedId(null)} 
        type="movie" 
        id={selectedId} 
      />
    </main>
  );
}
