export interface Show {
  id: number;
  title: string;
  tmdb_id: number | null;
  poster_path: string | null;
  overview: string | null;
  genres: string | null;
  year: number | null;
  total_episodes: number | null;
  language: string | null;
  country: string | null;
  status: string;
  is_favorite: boolean;
  watched_count: number;
}

export interface Episode {
  id: number;
  season_number: number | null;
  episode_number: number | null;
  name: string | null;
  is_watched: boolean;
  watched_at: string | null;
  air_date: string | null;
  is_special: boolean;
}

export interface ShowDetail extends Show {
  watched_episode_count: number;
  episodes: Episode[];
}

export interface Movie {
  id: number;
  title: string;
  tmdb_id: number | null;
  poster_path: string | null;
  overview: string | null;
  genres: string | null;
  year: number | null;
  language: string | null;
  country: string | null;
  is_watched: boolean;
  is_favorite: boolean;
  watched_count: number;
}

export interface MovieDetail extends Movie {
}
