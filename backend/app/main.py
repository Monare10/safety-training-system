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

# --- Auto-Seed Admin ---
from .database import SessionLocal
from .models import User, UserRole
from .auth import hash_password

@app.on_event("startup")
def create_initial_admin():
    db = SessionLocal()
    try:
        # Check if the admin already exists
        if not db.query(User).filter(User.email == "admin@site.com").first():
            admin = User(
                email="admin@site.com",
                full_name="Site Admin",
                hashed_password=hash_password("admin123"),
                role=UserRole.admin
            )
            db.add(admin)
            db.commit()
            print("✅ Auto-created admin user: admin@site.com / admin123")
    except Exception as e:
        print("❌ Error creating admin:", e)
    finally:
        db.close()