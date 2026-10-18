from app.database import SessionLocal, Base, engine
from app.models import User, UserRole, Course, Question
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def ensure_admin():
    if not db.query(User).filter(User.email == "admin@site.com").first():
        db.add(User(email="admin@site.com", full_name="Site Admin",
                    hashed_password=hash_password("admin123"),
                    role=UserRole.admin))
        print("Created admin: admin@site.com / admin123")

def ensure_demo_worker():
    if not db.query(User).filter(User.email == "worker@site.com").first():
        db.add(User(email="worker@site.com", full_name="John Worker",
                    hashed_password=hash_password("worker123"),
                    role=UserRole.worker, job_role="Electrician"))
        print("Created worker: worker@site.com / worker123")

def ensure_courses():
    if db.query(Course).count() > 0:
        return
    c1 = Course(
        title="Electrical Safety Awareness",
        description="Hazards, lockout/tagout, PPE for electrical work.",
        job_role="Electrician",
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        video_duration_sec=60,
        pass_score=80, quiz_duration_min=10,
    )
    db.add(c1); db.flush()
    qs = [
        ("What does LOTO stand for?",
         "Lock Out Tag Out", "Lift Only, Turn Over",
         "Long Overdue Task Order", "Loose Object Tracking Overview", "A"),
        ("Minimum PPE for electrical work includes:",
         "Rubber gloves & insulated tools", "Sunglasses only",
         "Only a hard hat", "No PPE needed", "A"),
        ("Before working on de-energized equipment you must:",
         "Verify zero energy state", "Assume it's safe",
         "Ask a coworker", "Wait 5 minutes", "A"),
        ("Arc flash is:",
         "A dangerous electrical explosion", "A type of welding",
         "A lighting system", "A cable connector", "A"),
        ("If you find damaged wiring you should:",
         "Report and tag out immediately", "Ignore it",
         "Fix it without PPE", "Use it anyway", "A"),
    ]
    for t, a, b, c, d, ans in qs:
        db.add(Question(course_id=c1.id, text=t, option_a=a, option_b=b,
                        option_c=c, option_d=d, correct_option=ans))

    c2 = Course(
        title="Working at Heights",
        description="Fall protection, scaffolding, and harness inspection.",
        job_role="Roofer",
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        video_duration_sec=60,
        pass_score=80, quiz_duration_min=10,
    )
    db.add(c2); db.flush()
    qs2 = [
        ("Fall protection is required at heights above:",
         "6 feet", "20 feet", "Only on roofs", "Never", "A"),
        ("A full-body harness should be inspected:",
         "Before every use", "Once a year",
         "Only when it looks bad", "Never", "A"),
        ("The anchor point must support:",
         "5000 lbs per worker", "200 lbs", "Any load", "The worker's weight", "A"),
        ("A lanyard should be attached:",
         "Above the D-ring", "Below the feet",
         "To a tool belt", "To a coworker", "A"),
        ("Scaffolding must be inspected by:",
         "A competent person", "Anyone", "Only the foreman", "OSHA", "A"),
    ]
    for t, a, b, c, d, ans in qs2:
        db.add(Question(course_id=c2.id, text=t, option_a=a, option_b=b,
                        option_c=c, option_d=d, correct_option=ans))

    c3 = Course(
        title="General Site Safety Induction",
        description="Site rules, hazard identification, emergency procedures.",
        job_role="General Laborer",
        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        video_duration_sec=60,
        pass_score=80, quiz_duration_min=10,
    )
    db.add(c3); db.flush()
    qs3 = [
        ("Hard hats must be worn:",
         "At all times on site", "Only when told",
         "Only indoors", "Never", "A"),
        ("The first thing to do in an emergency is:",
         "Alert others and call emergency services", "Run away",
         "Take a photo", "Finish your task", "A"),
        ("Near misses should be:",
         "Reported", "Ignored", "Kept secret", "Celebrated", "A"),
        ("Housekeeping means:",
         "Keeping the site clean and organized", "Cleaning only at end of day",
         "Only the janitor's job", "Optional", "A"),
        ("To prevent slips/trips you should:",
         "Clean spills and keep walkways clear", "Walk fast",
         "Wear shorts", "Ignore them", "A"),
    ]
    for t, a, b, c, d, ans in qs3:
        db.add(Question(course_id=c3.id, text=t, option_a=a, option_b=b,
                        option_c=c, option_d=d, correct_option=ans))

    print("Seeded 3 courses with 15 questions.")

if __name__ == "__main__":
    ensure_admin()
    ensure_demo_worker()
    ensure_courses()
    db.commit()
    db.close()
    print("Done.")