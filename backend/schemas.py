from pydantic import BaseModel, EmailStr
from typing import Dict, List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ProgressUpdate(BaseModel):
    plan_id: int
    activity: str
    completed: bool


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

class LearningPlanCreate(BaseModel):
    goal: str
    duration_days: Optional[int] = 30
    difficulty: Optional[str] = "intermediate"

class LearningPlanResponse(BaseModel):
    id: int
    goal: str
    plan: Dict[str, List[str]]
    progress: float
    created_at: datetime
    completed: bool

class ActivityLog(BaseModel):
    activity_id: int
    completed: bool
    notes: Optional[str]

class ProgressStats(BaseModel):
    total_plans: int
    completed_plans: int
    in_progress: int
    weekly_activity: List[Dict[str, str]]
    completion_rate: float
    streak_days: int
