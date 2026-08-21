from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .db.database import get_db, engine
from .db import models
from .routers.movies import router as movies_router
from .routers.shows import router as shows_router
from .routers.dashboard import router as dashboard_router
from .routers.library import router as library_router
app = FastAPI(title="TVTime API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies_router, prefix="/api")
app.include_router(shows_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(library_router, prefix="/api")
@app.get("/")
def read_root():
    return {"message": "Welcome to TVTime API"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
