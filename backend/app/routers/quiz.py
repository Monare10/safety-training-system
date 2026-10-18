from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Course, Enrollment, Question, Certificate
from ..schemas import QuizSubmit, QuizResult, QuestionOut
from ..deps import get_current_user
from ..certificates import generate_serial

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

@router.get("/{course_id}/questions", response_model=list[QuestionOut])
def get_questions(course_id: int, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    enr = db.query(Enrollment).filter_by(user_id=user.id, course_id=course_id).first()
    if not enr or not enr.video_completed:
        raise HTTPException(403, "Complete the video first")
    return db.query(Question).filter(Question.course_id == course_id).all()

@router.post("/{course_id}/start")
def start_quiz(course_id: int, user: User = Depends(get_current_user),
               db: Session = Depends(get_db)):
    enr = db.query(Enrollment).filter_by(user_id=user.id, course_id=course_id).first()
    if not enr or not enr.video_completed:
        raise HTTPException(403, "Complete the video first")
    if enr.quiz_passed:
        raise HTTPException(400, "Already passed")
    enr.quiz_started_at = datetime.utcnow()
    db.commit()
    return {"started_at": enr.quiz_started_at,
            "duration_min": enr.course.quiz_duration_min}

@router.post("/{course_id}/submit", response_model=QuizResult)
def submit_quiz(course_id: int, payload: QuizSubmit,
                user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    enr = db.query(Enrollment).filter_by(user_id=user.id, course_id=course_id).first()
    if not enr or not enr.video_completed:
        raise HTTPException(403, "Complete the video first")
    if not enr.quiz_started_at:
        raise HTTPException(400, "Quiz not started")
    elapsed = datetime.utcnow() - enr.quiz_started_at
    if elapsed > timedelta(minutes=enr.course.quiz_duration_min):
        raise HTTPException(400, "Time expired")

    questions = db.query(Question).filter(Question.course_id == course_id).all()
    if not questions:
        raise HTTPException(400, "No questions configured")

    correct = 0
    for q in questions:
        given = payload.answers.get(q.id) or payload.answers.get(str(q.id))
        if given and given.upper() == q.correct_option.upper():
            correct += 1

    score = round(100 * correct / len(questions), 2)
    passed = score >= enr.course.pass_score

    enr.quiz_score = score
    enr.quiz_passed = passed
    enr.quiz_attempts += 1
    enr.quiz_started_at = None
    cert_issued = False

    if passed:
        enr.completed_at = datetime.utcnow()
        existing = db.query(Certificate).filter_by(
            user_id=user.id, course_id=course_id).first()
        if not existing:
            issued = datetime.utcnow()
            cert = Certificate(
                user_id=user.id, course_id=course_id,
                serial=generate_serial(),
                issued_at=issued,
                expires_at=issued + timedelta(days=365),
                score=score,
            )
            db.add(cert)
            cert_issued = True
    db.commit()

    return QuizResult(score=score, passed=passed, correct=correct,
                      total=len(questions), certificate_issued=cert_issued)