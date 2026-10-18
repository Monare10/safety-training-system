from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from . import models  # noqa: F401 — ensures models load before create_all
from .routers import auth, training, quiz, admin, certificates

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Construction Safety Training API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(training.router)
app.include_router(quiz.router)
app.include_router(admin.router)
app.include_router(certificates.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}