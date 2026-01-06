"""
Users Router
API endpoints for user profiles and family members
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from services.supabase_service import supabase_service

router = APIRouter()


# ==================== MODELS ====================

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None
    smoking_status: Optional[str] = None
    activity_level: Optional[str] = None
    known_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None


class FamilyMemberCreate(BaseModel):
    name: str
    relationship: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    is_default: Optional[bool] = False


# ==================== PROFILE ENDPOINTS ====================

@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        profile = await supabase_service.get_user_profile(user_id)
        if not profile:
            return {"profile": None, "message": "Profile not found"}
        return {"profile": profile}
    except Exception as e:
        print(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profile/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    """Create or update user profile"""
    try:
        data = profile.dict(exclude_none=True)
        print(f"Updating profile for user {user_id}: {data}")
        
        result = await supabase_service.create_or_update_profile(user_id, data)
        print(f"Profile update result: {result}")
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {"success": True, "profile": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==================== FAMILY ENDPOINTS ====================

@router.get("/family/{user_id}")
async def get_family_members(user_id: str):
    """Get all family members for a user"""
    try:
        members = await supabase_service.get_family_members(user_id)
        return {"members": members}
    except Exception as e:
        print(f"Error getting family: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/family/{user_id}")
async def create_family_member(user_id: str, member: FamilyMemberCreate):
    """Create a new family member"""
    try:
        data = member.dict(exclude_none=True)
        result = await supabase_service.create_family_member(user_id, data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {"success": True, "member": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/family/member/{member_id}")
async def update_family_member(member_id: str, member: FamilyMemberCreate):
    """Update a family member"""
    try:
        data = member.dict(exclude_none=True)
        result = await supabase_service.update_family_member(member_id, data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {"success": True, "member": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/family/member/{member_id}")
async def delete_family_member(member_id: str):
    """Delete a family member"""
    try:
        success = await supabase_service.delete_family_member(member_id)
        if not success:
            raise HTTPException(status_code=404, detail="Member not found")
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting family member: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== EMAIL VALIDATION ====================

@router.get("/validate-email/{email}")
async def validate_email(email: str):
    """Check if email exists in the system"""
    try:
        # For now, just check if profile exists with this email
        db = supabase_service.get_session()
        from models.db_models import UserProfile
        profile = db.query(UserProfile).filter(UserProfile.email == email.lower()).first()
        db.close()
        
        if profile:
            return {"exists": True, "user_id": profile.user_id}
        return {"exists": False}
    except Exception as e:
        print(f"Error validating email: {e}")
        return {"exists": False, "error": str(e)}
