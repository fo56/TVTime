# TVTime Local Backend

This is a local self-hosted backend alternative to TVTime, built with FastAPI and PostgreSQL, and designed to import and query your GDPR exports directly.

## Prerequisites

1. **Docker Desktop** installed and running (to host PostgreSQL).
2. **Python 3.12+** installed.
3. Your TVTime GDPR exports extracted to the `gdpr/` folder at the root of this repository.

## Setup Instructions

### 1. Environment Variables
Copy the provided `.env.example` file to create your own `.env`:
```bash
cp .env.example .env
```
Ensure that you add your TMDB API Key (`TMDB_API_KEY`) if you want to pull metadata like posters and overviews.

### 2. Start PostgreSQL
Start the database container using Docker Compose:
```bash
docker compose up -d
```
You can stop it anytime using `docker compose down`.

### 3. Initialize the Python Environment
Create and activate the virtual environment, then install dependencies:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 4. Reinitializing the Database (From Scratch)
If you want to clear your data and start fresh, or apply the database tables for the first time:
```powershell
# Inside your active virtual environment
alembic upgrade head
```
*(Note: To completely wipe the database and start over, you can drop the volume using `docker compose down -v` and repeat steps 2 and 4).*

### 5. Import Your GDPR Data
Once the database tables are created via Alembic, you can run the import scripts to hydrate your database:

**Import Shows, Episodes, Watch History, and Comments:**
```powershell
python -m scripts.import_gdpr
```

**Import Movies and cross-reference Watch History:**
```powershell
python -m scripts.import_movies
```

**Enrich Data via TMDB (requires API Key in .env):**
```powershell
python -m app.services.tmdb_sync
```

### 6. Start the Backend Server
To run the local FastAPI backend server:
```powershell
uvicorn app.main:app --reload
```
The server will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 7. Start the Frontend Application
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the Next.js app:
```powershell
cd frontend
npm install
npm run dev
```
The frontend will be available at [http://localhost:3000](http://localhost:3000).
You can explore the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).