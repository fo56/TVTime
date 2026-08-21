import { useState, useEffect, useMemo } from 'react';
import { Movie } from '@/types/media';

export type FilterStatus = 'All' | 'Watched' | 'Not Watched' | 'Favorites' | 'Rewatches';
export type SortOption = 'Recently Added' | 'A-Z' | 'Year (Newest)' | 'Year (Oldest)';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [sort, setSort] = useState<SortOption>('Recently Added');
  const [genreFilter, setGenreFilter] = useState<string>('All Genres');
  const [languageFilter, setLanguageFilter] = useState<string>('All Languages');
  const [countryFilter, setCountryFilter] = useState<string>('All Countries');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/movies?limit=5000')
      .then(res => res.json())
      .then(data => {
        setMovies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(m => {
      if (m.genres) m.genres.split(', ').forEach(g => genres.add(g));
    });
    return ['All Genres', ...Array.from(genres).sort()];
  }, [movies]);

  const allLanguages = useMemo(() => {
    const languages = new Set<string>();
    movies.forEach(m => {
      if (m.language) m.language.split(', ').forEach(l => languages.add(l.toUpperCase()));
    });
    return ['All Languages', ...Array.from(languages).sort()];
  }, [movies]);

  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    movies.forEach(m => {
      if (m.country) m.country.split(', ').forEach(c => countries.add(c));
    });
    return ['All Countries', ...Array.from(countries).sort()];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let result = movies;
    
    if (filter !== 'All') {
      result = movies.filter(movie => {
        if (filter === 'Watched') return movie.is_watched;
        if (filter === 'Not Watched') return !movie.is_watched;
        if (filter === 'Favorites') return movie.is_favorite;
        if (filter === 'Rewatches') return movie.watched_count > 1;
        return true;
      });
    }

    if (genreFilter !== 'All Genres') {
      result = result.filter(m => m.genres && m.genres.includes(genreFilter));
    }

    if (languageFilter !== 'All Languages') {
      result = result.filter(m => m.language && m.language.toUpperCase().includes(languageFilter));
    }

    if (countryFilter !== 'All Countries') {
      result = result.filter(m => m.country && m.country.includes(countryFilter));
    }

    if (sort === 'Recently Added') {
      result = [...result].sort((a, b) => b.id - a.id);
    } else if (sort === 'A-Z') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'Year (Newest)') {
      result = [...result].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sort === 'Year (Oldest)') {
      result = [...result].sort((a, b) => {
        const yA = a.year || 9999;
        const yB = b.year || 9999;
        return yA - yB;
      });
    }

    return result;
  }, [movies, filter, sort, genreFilter, languageFilter, countryFilter]);

  return {
    loading, filteredMovies,
    filter, setFilter,
    sort, setSort,
    genreFilter, setGenreFilter, allGenres,
    languageFilter, setLanguageFilter, allLanguages,
    countryFilter, setCountryFilter, allCountries
  };
}
