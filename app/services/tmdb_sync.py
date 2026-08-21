from app.db.database import SessionLocal
from app.db.models import Show, Movie, Episode
from datetime import datetime
import time
from .tmdb_client import get_session, fetch_genres, find_tmdb_id, TMDB_API_KEY

def sync_single_show(show, session, db, tv_genres=None):
    if tv_genres is None:
        tv_genres = fetch_genres(session, "tv")
    
    title_safe = show.title.encode('ascii', 'replace').decode('ascii') if show.title else "Unknown"
    
    if not show.tmdb_id:
        result = None
        if show.tvdb_id:
            res = find_tmdb_id(session, show.tvdb_id, "tvdb_id")
            if res and res.get("tv_results"): result = res["tv_results"][0]
        if not result and show.imdb_id:
            res = find_tmdb_id(session, show.imdb_id, "imdb_id")
            if res and res.get("tv_results"): result = res["tv_results"][0]
        if result:
            show.tmdb_id = result.get("id")
            db.commit()
        time.sleep(0.05)

    if show.tmdb_id:
        url = f"https://api.themoviedb.org/3/tv/{show.tmdb_id}"
        try:
            r = session.get(url, params={"api_key": TMDB_API_KEY})
            if r.status_code == 200:
                data = r.json()
                show.poster_path = data.get("poster_path", show.poster_path)
                show.overview = data.get("overview", show.overview)
                show.title = data.get("name", show.title)
                
                g_ids = [g["id"] for g in data.get("genres", [])]
                names = [tv_genres.get(gid) for gid in g_ids if tv_genres.get(gid)]
                show.genres = ", ".join(names) if names else show.genres
                
                first_air_date = data.get("first_air_date")
                if first_air_date:
                    try: show.year = int(first_air_date.split("-")[0])
                    except: pass
                
                show.total_episodes = data.get("number_of_episodes")
                show.language = data.get("original_language")
                countries = data.get("origin_country", [])
                show.country = ", ".join(countries) if countries else None
                db.commit()

                seasons = data.get("seasons", [])
                existing_eps = db.query(Episode).filter_by(show_id=show.id).all()
                ep_map = {(ep.season_number, ep.episode_number): ep for ep in existing_eps}
                
                for s in seasons:
                    s_num = s.get("season_number")
                    s_eps_in_db = [ep for ep in existing_eps if ep.season_number == s_num]
                    
                    if len(s_eps_in_db) == s.get("episode_count", 0):
                        if all(ep.air_date is not None for ep in s_eps_in_db):
                            continue
                            
                    s_url = f"https://api.themoviedb.org/3/tv/{show.tmdb_id}/season/{s_num}"
                    s_res = session.get(s_url, params={"api_key": TMDB_API_KEY})
                    if s_res.status_code == 200:
                        s_data = s_res.json()
                        for tmdb_ep in s_data.get("episodes", []):
                            ep_num = tmdb_ep.get("episode_number")
                            air_date_str = tmdb_ep.get("air_date")
                            air_date_val = None
                            if air_date_str:
                                try: air_date_val = datetime.strptime(air_date_str, "%Y-%m-%d")
                                except: pass
                                
                            if (s_num, ep_num) in ep_map:
                                ep = ep_map[(s_num, ep_num)]
                                ep.name = tmdb_ep.get("name", ep.name)
                                if air_date_val: ep.air_date = air_date_val
                            else:
                                new_ep = Episode(
                                    show_id=show.id, season_number=s_num, episode_number=ep_num,
                                    name=tmdb_ep.get("name"), air_date=air_date_val, is_watched=False
                                )
                                db.add(new_ep)
                                ep_map[(s_num, ep_num)] = new_ep
                        db.commit()
                    time.sleep(0.05)
                print(f"Fully Synced Show: {title_safe}")
        except Exception as e:
            print(f"Error fetching full details for {title_safe}: {e}")

def sync_single_movie(movie, session, db, movie_genres=None):
    if movie_genres is None:
        movie_genres = fetch_genres(session, "movie")
        
    title_safe = movie.title.encode('ascii', 'replace').decode('ascii') if movie.title else "Unknown"
    
    if not movie.tmdb_id:
        result = None
        if movie.imdb_id:
            res = find_tmdb_id(session, movie.imdb_id, "imdb_id")
            if res and res.get("movie_results"): result = res["movie_results"][0]
        if not result and movie.tvdb_id:
            res = find_tmdb_id(session, movie.tvdb_id, "tvdb_id")
            if res and res.get("movie_results"): result = res["movie_results"][0]
        if result:
            movie.tmdb_id = result.get("id")
            db.commit()
        time.sleep(0.05)

    if movie.tmdb_id:
        url = f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}"
        try:
            r = session.get(url, params={"api_key": TMDB_API_KEY})
            if r.status_code == 200:
                data = r.json()
                movie.poster_path = data.get("poster_path", movie.poster_path)
                movie.overview = data.get("overview", movie.overview)
                movie.title = data.get("title", movie.title)
                
                g_ids = [g["id"] for g in data.get("genres", [])]
                names = [movie_genres.get(gid) for gid in g_ids if movie_genres.get(gid)]
                movie.genres = ", ".join(names) if names else movie.genres
                
                release_date = data.get("release_date")
                if release_date:
                    try: movie.year = int(release_date.split("-")[0])
                    except: pass
                    
                movie.language = data.get("original_language")
                countries = data.get("origin_country", [])
                movie.country = ", ".join(countries) if countries else None
                db.commit()
                print(f"Synced Movie: {title_safe}")
        except Exception as e:
            print(f"Error fetching full details for Movie {title_safe}: {e}")

def sync_tmdb():
    if not TMDB_API_KEY:
        print("Error: TMDB_API_KEY not found in .env")
        return

    session = get_session()
    db = SessionLocal()

    print("Fetching genre maps...")
    tv_genres = fetch_genres(session, "tv")
    movie_genres = fetch_genres(session, "movie")

    shows = db.query(Show).all()
    print(f"Found {len(shows)} shows to sync...")
    for show in shows:
        sync_single_show(show, session, db, tv_genres)

    movies = db.query(Movie).all()
    print(f"Found {len(movies)} movies to sync...")
    for movie in movies:
        sync_single_movie(movie, session, db, movie_genres)
        time.sleep(0.05)

    db.close()
    print("TMDB Sync Complete.")

if __name__ == "__main__":
    sync_tmdb()
