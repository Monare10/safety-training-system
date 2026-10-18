from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Enum
)
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    worker = "worker"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.worker, nullable=False)
    job_role = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    job_role = Column(String(100), nullable=False)
    video_url = Column(String(500), nullable=False)
    video_duration_sec = Column(Integer, nullable=False, default=0)
    pass_score = Column(Integer, default=80)
    quiz_duration_min = Column(Integer, default=15)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="course", cascade="all, delete")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_option = Column(String(1), nullable=False)

    course = relationship("Course", back_populates="questions")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    watched_seconds = Column(Float, default=0)
    last_position = Column(Float, default=0)
    video_completed = Column(Boolean, default=False)
    quiz_score = Column(Float, nullable=True)
    quiz_passed = Column(Boolean, default=False)
    quiz_attempts = Column(Integer, default=0)
    quiz_started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    serial = Column(String(64), unique=True, index=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    score = Column(Float, nullable=False)

    user = relationship("User", back_populates="certificates")
    course = relationship("Course")