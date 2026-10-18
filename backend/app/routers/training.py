from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Course, Enrollment
from ..schemas import CourseDetail, EnrollmentOut, ProgressUpdate
from ..deps import get_current_user

router = APIRouter(prefix="/api/training", tags=["training"])

@router.get("/courses", response_model=list[CourseDetail])
def list_my_courses(user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    q = db.query(Course)
    if user.job_role:
        q = q.filter(Course.job_role == user.job_role)
    return q.all()

@router.post("/enroll/{course_id}", response_model=EnrollmentOut)
def enroll(course_id: int, user: User = Depends(get_current_user),
           db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    enr = db.query(Enrollment).filter_by(user_id=user.id, course_id=course_id).first()
    if not enr:
        enr = Enrollment(user_id=user.id, course_id=course_id)
        db.add(enr); db.commit(); db.refresh(enr)
    return enr

@router.get("/enrollments", response_model=list[EnrollmentOut])
def my_enrollments(user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    return db.query(Enrollment).filter(Enrollment.user_id == user.id).all()

@router.get("/enrollment/{course_id}", response_model=EnrollmentOut)
def get_enrollment(course_id: int, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    enr = db.query(Enrollment).filter_by(user_id=user.id, course_id=course_id).first()
    if not enr:
        raise HTTPException(404, "Not enrolled")
    return enr

@router.post("/progress/{course_id}", response_model=EnrollmentOut)
def update_progress(course_id: int, payload: ProgressUpdate,
                    user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    enr = db.query(Enrollment).filter_by(user_id=user.id, course_id=course_id).first()
    if not enr:
        raise HTTPException(404, "Not enrolled")

    delta = payload.last_position - enr.last_position
    if delta > 5:
        enr.last_position = payload.last_position
        db.commit(); db.refresh(enr)
        return enr

    if delta > 0:
        enr.watched_seconds = min(enr.watched_seconds + delta,
                                  enr.course.video_duration_sec)
    enr.last_position = payload.last_position

    if enr.watched_seconds >= enr.course.video_duration_sec * 0.9:
        enr.video_completed = True

    db.commit(); db.refresh(enr)
    return enr