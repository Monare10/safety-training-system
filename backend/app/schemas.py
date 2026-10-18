from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    job_role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    job_role: Optional[str] = None
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Courses ---
class QuestionOut(BaseModel):
    id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    # correct_option intentionally omitted for workers

class QuestionAdmin(QuestionOut):
    correct_option: str

class QuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str

class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    job_role: str
    video_url: str
    video_duration_sec: int
    pass_score: int
    quiz_duration_min: int
    class Config: from_attributes = True

class CourseDetail(CourseOut):
    questions: List[QuestionOut] = []

class CourseAdmin(CourseOut):
    questions: List[QuestionAdmin] = []

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    job_role: str
    video_url: str
    video_duration_sec: int
    pass_score: int = 80
    quiz_duration_min: int = 15
    questions: List[QuestionCreate] = []

# --- Enrollment / Progress ---
class EnrollmentOut(BaseModel):
    id: int
    course: CourseOut
    watched_seconds: float
    last_position: float
    video_completed: bool
    quiz_score: Optional[float]
    quiz_passed: bool
    quiz_attempts: int
    completed_at: Optional[datetime]
    class Config: from_attributes = True

class ProgressUpdate(BaseModel):
    watched_seconds: float
    last_position: float

class QuizSubmit(BaseModel):
    answers: dict[int, str]

class QuizResult(BaseModel):
    score: float
    passed: bool
    correct: int
    total: int
    certificate_issued: bool = False

# --- Certificates ---
class CertificateOut(BaseModel):
    id: int
    serial: str
    course_title: str
    issued_at: datetime
    expires_at: datetime
    score: float
    is_valid: bool