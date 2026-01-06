"""
SQLAlchemy ORM Models
Database models for local PostgreSQL/SQLite
"""

from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, unique=True, index=True)
    email = Column(String)
    full_name = Column(String)
    avatar_url = Column(String)
    date_of_birth = Column(String)
    gender = Column(String)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    blood_type = Column(String)
    smoking_status = Column(String)
    activity_level = Column(String)
    known_conditions = Column(Text)  # JSON string for SQLite compatibility
    allergies = Column(Text)
    medications = Column(Text)
    role = Column(String, default="patient")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FamilyMember(Base):
    __tablename__ = "family_members"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    relationship = Column(String)
    date_of_birth = Column(String)
    gender = Column(String)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    blood_type = Column(String)
    known_conditions = Column(Text)
    email = Column(String)
    linked_user_id = Column(String)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, index=True)
    family_member_id = Column(String, ForeignKey("family_members.id"), nullable=True)
    file_url = Column(String)
    file_name = Column(String)
    patient_name = Column(String)
    patient_age = Column(Integer)
    patient_gender = Column(String)
    health_score = Column(Integer)
    summary = Column(Text)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    test_results = relationship("TestResult", back_populates="report", cascade="all, delete-orphan")


class TestResult(Base):
    __tablename__ = "test_results"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False, index=True)
    test_name = Column(String, nullable=False)
    observed_value = Column(String, nullable=False)
    unit = Column(String)
    reference_min = Column(Float)
    reference_max = Column(Float)
    status = Column(String)
    severity = Column(String)
    explanation = Column(Text)
    alert_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    report = relationship("Report", back_populates="test_results")


class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=True)
    test_name = Column(String)
    reminder_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    due_date = Column(String)
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
