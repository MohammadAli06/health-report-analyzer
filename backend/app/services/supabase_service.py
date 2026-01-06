"""
Database Service
Handles all database operations using SQLAlchemy with SQLite
"""

import os
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models.db_models import Report, TestResult, UserProfile, FamilyMember, AIConversation, Reminder


class DatabaseService:
    def __init__(self):
        # Initialize database tables
        try:
            from models import db_models
            Base.metadata.create_all(bind=engine)
            print("✓ SQLite database ready")
        except Exception as e:
            print(f"Warning: Database initialization error: {e}")
    
    def get_session(self) -> Session:
        """Get a new database session"""
        return SessionLocal()
    
    # ==================== FILE UPLOAD ====================
    
    async def upload_file(self, file_bytes: bytes, file_name: str, content_type: str) -> Optional[str]:
        """Save file locally and return path"""
        try:
            # Create uploads directory if needed
            upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_path = os.path.join(upload_dir, f"{timestamp}_{file_name}")
            
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            
            return file_path
        except Exception as e:
            print(f"Error saving file: {e}")
            return f"local://uploads/{file_name}"
    
    # ==================== REPORTS ====================
    
    async def create_report(self, user_id: str, file_url: str, file_name: str) -> dict:
        """Create a new report record"""
        db = self.get_session()
        try:
            report = Report(
                user_id=user_id,
                file_url=file_url,
                file_name=file_name,
                status="pending"
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            
            print(f"✓ Created report {report.id} for user {user_id}")
            
            return {
                "id": report.id,
                "user_id": report.user_id,
                "file_url": report.file_url,
                "file_name": report.file_name,
                "status": report.status,
                "created_at": report.created_at.isoformat() if report.created_at else None
            }
        except Exception as e:
            db.rollback()
            print(f"Error creating report: {e}")
            import uuid
            return {"id": str(uuid.uuid4()), "user_id": user_id, "file_url": file_url, "status": "pending"}
        finally:
            db.close()
    
    async def update_report(self, report_id: str, data: dict) -> dict:
        """Update a report record"""
        db = self.get_session()
        try:
            report = db.query(Report).filter(Report.id == report_id).first()
            if report:
                for key, value in data.items():
                    if hasattr(report, key):
                        setattr(report, key, value)
                db.commit()
                db.refresh(report)
                print(f"✓ Updated report {report_id}")
            return {"id": report_id, **data}
        except Exception as e:
            db.rollback()
            print(f"Error updating report: {e}")
            return {"id": report_id, **data}
        finally:
            db.close()
    
    async def get_report(self, report_id: str) -> Optional[dict]:
        """Get a report by ID"""
        db = self.get_session()
        try:
            report = db.query(Report).filter(Report.id == report_id).first()
            if not report:
                return None
            
            return {
                "id": report.id,
                "user_id": report.user_id,
                "file_url": report.file_url,
                "file_name": report.file_name,
                "patient_name": report.patient_name,
                "patient_age": report.patient_age,
                "patient_gender": report.patient_gender,
                "health_score": report.health_score,
                "summary": report.summary,
                "status": report.status,
                "created_at": report.created_at.isoformat() if report.created_at else None
            }
        except Exception as e:
            print(f"Error getting report: {e}")
            return None
        finally:
            db.close()
    
    async def get_user_reports(self, user_id: str) -> List[dict]:
        """Get all reports for a user"""
        db = self.get_session()
        try:
            reports = db.query(Report).filter(Report.user_id == user_id).order_by(Report.created_at.desc()).all()
            
            return [
                {
                    "id": r.id,
                    "user_id": r.user_id,
                    "file_name": r.file_name,
                    "patient_name": r.patient_name,
                    "health_score": r.health_score,
                    "status": r.status,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                }
                for r in reports
            ]
        except Exception as e:
            print(f"Error getting user reports: {e}")
            return []
        finally:
            db.close()
    
    # ==================== TEST RESULTS ====================
    
    async def save_test_results(self, report_id: str, tests: list) -> List[dict]:
        """Save test results for a report"""
        db = self.get_session()
        try:
            saved_results = []
            for test in tests:
                test_result = TestResult(
                    report_id=report_id,
                    test_name=test.test_name,
                    observed_value=test.observed_value,
                    unit=test.unit,
                    reference_min=test.reference_range.min if test.reference_range else None,
                    reference_max=test.reference_range.max if test.reference_range else None,
                    status=test.status.value if test.status else None,
                    severity=test.severity.value if test.severity else None,
                    explanation=test.explanation,
                    alert_message=test.alert_message
                )
                db.add(test_result)
                saved_results.append(test_result)
            
            db.commit()
            print(f"✓ Saved {len(saved_results)} test results for report {report_id}")
            return [{"id": r.id} for r in saved_results]
        except Exception as e:
            db.rollback()
            print(f"Error saving test results: {e}")
            return []
        finally:
            db.close()
    
    async def get_test_results(self, report_id: str) -> List[dict]:
        """Get all test results for a report"""
        db = self.get_session()
        try:
            results = db.query(TestResult).filter(TestResult.report_id == report_id).all()
            
            return [
                {
                    "id": r.id,
                    "report_id": r.report_id,
                    "test_name": r.test_name,
                    "observed_value": r.observed_value,
                    "unit": r.unit,
                    "reference_min": r.reference_min,
                    "reference_max": r.reference_max,
                    "status": r.status,
                    "severity": r.severity,
                    "explanation": r.explanation,
                    "alert_message": r.alert_message
                }
                for r in results
            ]
        except Exception as e:
            print(f"Error getting test results: {e}")
            return []
        finally:
            db.close()
    
    # ==================== USER PROFILES ====================
    
    async def get_user_profile(self, user_id: str) -> Optional[dict]:
        """Get user profile by user_id"""
        db = self.get_session()
        try:
            profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
            if not profile:
                return None
            
            return {
                "id": profile.id,
                "user_id": profile.user_id,
                "email": profile.email,
                "full_name": profile.full_name,
                "date_of_birth": profile.date_of_birth,
                "gender": profile.gender,
                "height_cm": profile.height_cm,
                "weight_kg": profile.weight_kg,
                "blood_type": profile.blood_type,
                "smoking_status": profile.smoking_status,
                "activity_level": profile.activity_level,
                "known_conditions": profile.known_conditions,
                "allergies": profile.allergies,
                "medications": profile.medications
            }
        except Exception as e:
            print(f"Error getting profile: {e}")
            return None
        finally:
            db.close()
    
    async def create_or_update_profile(self, user_id: str, data: dict) -> dict:
        """Create or update a user profile"""
        db = self.get_session()
        try:
            profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
            
            if profile:
                # Update existing
                for key, value in data.items():
                    if hasattr(profile, key) and key != 'user_id':
                        setattr(profile, key, value)
                profile.updated_at = datetime.utcnow()
                print(f"✓ Updated profile for user {user_id}")
            else:
                # Create new
                profile = UserProfile(user_id=user_id, **data)
                db.add(profile)
                print(f"✓ Created profile for user {user_id}")
            
            db.commit()
            db.refresh(profile)
            
            return {
                "id": profile.id,
                "user_id": profile.user_id,
                "full_name": profile.full_name,
                "email": profile.email
            }
        except Exception as e:
            db.rollback()
            print(f"Error saving profile: {e}")
            return {"error": str(e)}
        finally:
            db.close()
    
    # ==================== FAMILY MEMBERS ====================
    
    async def get_family_members(self, owner_id: str) -> List[dict]:
        """Get all family members for a user"""
        db = self.get_session()
        try:
            members = db.query(FamilyMember).filter(FamilyMember.owner_id == owner_id).order_by(FamilyMember.is_default.desc()).all()
            
            return [
                {
                    "id": m.id,
                    "owner_id": m.owner_id,
                    "name": m.name,
                    "relationship": m.relationship,
                    "date_of_birth": m.date_of_birth,
                    "gender": m.gender,
                    "email": m.email,
                    "is_default": m.is_default
                }
                for m in members
            ]
        except Exception as e:
            print(f"Error getting family members: {e}")
            return []
        finally:
            db.close()
    
    async def create_family_member(self, owner_id: str, data: dict) -> dict:
        """Create a new family member"""
        db = self.get_session()
        try:
            member = FamilyMember(owner_id=owner_id, **data)
            db.add(member)
            db.commit()
            db.refresh(member)
            print(f"✓ Created family member {member.name}")
            
            return {"id": member.id, "name": member.name}
        except Exception as e:
            db.rollback()
            print(f"Error creating family member: {e}")
            return {"error": str(e)}
        finally:
            db.close()
    
    async def update_family_member(self, member_id: str, data: dict) -> dict:
        """Update a family member"""
        db = self.get_session()
        try:
            member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
            if member:
                for key, value in data.items():
                    if hasattr(member, key):
                        setattr(member, key, value)
                db.commit()
                print(f"✓ Updated family member {member_id}")
            return {"id": member_id, **data}
        except Exception as e:
            db.rollback()
            print(f"Error updating family member: {e}")
            return {"error": str(e)}
        finally:
            db.close()
    
    async def delete_family_member(self, member_id: str) -> bool:
        """Delete a family member"""
        db = self.get_session()
        try:
            member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
            if member:
                db.delete(member)
                db.commit()
                print(f"✓ Deleted family member {member_id}")
                return True
            return False
        except Exception as e:
            db.rollback()
            print(f"Error deleting family member: {e}")
            return False
        finally:
            db.close()
    
    # ==================== AI CONVERSATIONS ====================
    
    async def save_conversation(self, user_id: str, report_id: str, question: str, answer: str) -> dict:
        """Save an AI conversation"""
        db = self.get_session()
        try:
            conv = AIConversation(
                user_id=user_id,
                report_id=report_id,
                question=question,
                answer=answer
            )
            db.add(conv)
            db.commit()
            db.refresh(conv)
            print(f"✓ Saved AI conversation")
            
            return {"id": conv.id}
        except Exception as e:
            db.rollback()
            print(f"Error saving conversation: {e}")
            return {"error": str(e)}
        finally:
            db.close()


# Singleton instance (backwards compatible name)
supabase_service = DatabaseService()
