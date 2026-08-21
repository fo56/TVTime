import os
import requests
from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

def get_session():
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    return session

def fetch_genres(session, media_type):
    url = f"https://api.themoviedb.org/3/genre/{media_type}/list"
    params = {"api_key": TMDB_API_KEY, "language": "en-US"}
    response = session.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return {genre["id"]: genre["name"] for genre in data.get("genres", [])}

def find_tmdb_id(session, external_id, source):
    if not external_id: return None
    url = f"https://api.themoviedb.org/3/find/{external_id}"
    params = {"api_key": TMDB_API_KEY, "external_source": source}
    try:
        response = session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except:
        return None
