"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { MediaCard } from '@/components/MediaCard';
import { MediaModal } from '@/components/MediaModal';
import Dropdown from '@/components/Dropdown';
import { useShows, FilterStatus, SortOption } from '@/hooks/useShows';

export default function ShowsPage() {
  const {
    loading, filteredShows,
    filter, setFilter,
    sort, setSort,
    genreFilter, setGenreFilter, allGenres,
    languageFilter, setLanguageFilter, allLanguages,
    countryFilter, setCountryFilter, allCountries
  } = useShows();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <main>
      <section className="container section-gap" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div style={{ minHeight: '80vh' }}>
          <h1 className="t-display-xl" style={{ marginBottom: '48px' }}>Shows.</h1>
          
          <div className="filter-bar" style={{ gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Watching', 'Up to Date', 'Haven\'t Started', 'Stopped', 'Favorites', 'Rewatches'].map(f => (
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
              <p className="t-eyebrow" style={{ marginBottom: 'var(--spacing-lg)' }}>Showing {filteredShows.length} titles</p>
              
              {/* Denser grid using inline style for 5/6 columns */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: 'var(--spacing-xs)' 
              }}>
                {filteredShows.map(show => (
                  <MediaCard 
                    key={show.id} 
                    title={show.title}
                    poster_path={show.poster_path}
                    genres={show.genres}
                    onClick={() => setSelectedId(show.id)} 
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
        type="show" 
        id={selectedId} 
      />
    </main>
  );
}
