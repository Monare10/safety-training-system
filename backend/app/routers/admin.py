from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Course, Question, Enrollment, Certificate
from ..schemas import CourseCreate, CourseDetail, UserOut, CourseAdmin
from ..deps import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"],
                   dependencies=[Depends(require_admin)])

# --- Courses CRUD ---
@router.get("/courses", response_model=list[CourseAdmin])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@router.post("/courses", response_model=CourseDetail)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"questions"})
    course = Course(**data)
    db.add(course); db.flush()
    for q in payload.questions:
        db.add(Question(course_id=course.id, **q.model_dump()))
    db.commit(); db.refresh(course)
    return course

@router.put("/courses/{course_id}", response_model=CourseDetail)
def update_course(course_id: int, payload: CourseCreate,
                  db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Not found")
    
    # Update course fields
    for k, v in payload.model_dump(exclude={"questions"}).items():
        setattr(course, k, v)
        
    # Delete existing questions
    db.query(Question).filter(Question.course_id == course_id).delete()
    
    # Re-create questions from payload
    for q in payload.questions:
        # exclude id to prevent conflicts on new inserts
        q_data = q.model_dump(exclude={"id"})
        db.add(Question(course_id=course_id, **q_data))
        
    db.commit()
    db.refresh(course)
    return course

@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Not found")
    db.delete(course); db.commit()
    return {"ok": True}

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# --- Compliance dashboard ---
@router.get("/compliance")
def compliance_dashboard(db: Session = Depends(get_db)):
    total_workers = db.query(func.count(User.id)).filter(
        User.role == "worker").scalar()
    total_courses = db.query(func.count(Course.id)).scalar()
    total_certs = db.query(func.count(Certificate.id)).scalar()
    valid_certs = db.query(func.count(Certificate.id)).filter(
        Certificate.expires_at > datetime.utcnow()).scalar()

    # Per-course compliance
    per_course = []
    for c in db.query(Course).all():
        workers_targeted = db.query(func.count(User.id)).filter(
            User.role == "worker", User.job_role == c.job_role).scalar() or 0
        completed = db.query(func.count(Enrollment.id)).filter(
            Enrollment.course_id == c.id,
            Enrollment.quiz_passed == True).scalar() or 0
        per_course.append({
            "course_id": c.id, "title": c.title, "job_role": c.job_role,
            "targeted": workers_targeted, "completed": completed,
            "rate": round(100 * completed / workers_targeted, 1)
                    if workers_targeted else 0.0,
        })

    # Site eligibility = worker has all required certs valid
    eligible = 0
    for w in db.query(User).filter(User.role == "worker").all():
        required = db.query(Course).filter(Course.job_role == w.job_role).all()
        if not required:
            continue
        valid = db.query(Certificate).filter(
            Certificate.user_id == w.id,
            Certificate.expires_at > datetime.utcnow()).all()
        valid_course_ids = {c.course_id for c in valid}
        if all(r.id in valid_course_ids for r in required):
            eligible += 1

    return {
        "total_workers": total_workers,
        "total_courses": total_courses,
        "total_certificates": total_certs,
        "valid_certificates": valid_certs,
        "eligible_workers": eligible,
        "per_course": per_course,
    }

@router.get("/expiring")
def expiring_certificates(days: int = 30, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    horizon = now + timedelta(days=days)
    certs = db.query(Certificate).filter(
        Certificate.expires_at > now,
        Certificate.expires_at <= horizon).all()
    return [{
        "serial": c.serial, "user": c.user.full_name, "email": c.user.email,
        "course": c.course.title, "expires_at": c.expires_at,
        "days_left": (c.expires_at - now).days,
    } for c in certs]

@router.get("/worker/{user_id}/status")
def worker_status(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Not found")
    now = datetime.utcnow()
    required = db.query(Course).filter(Course.job_role == user.job_role).all()
    certs = {c.course_id: c for c in db.query(Certificate).filter(
        Certificate.user_id == user_id).all()}
    details = []
    for r in required:
        c = certs.get(r.id)
        details.append({
            "course_id": r.id, "course": r.title,
            "certified": bool(c and c.expires_at > now),
            "expires_at": c.expires_at if c else None,
            "score": c.score if c else None,
        })
    eligible = bool(required) and all(d["certified"] for d in details)
    return {"user": UserOut.model_validate(user), "eligible": eligible,
            "courses": details}