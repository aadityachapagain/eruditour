from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
from jwt.exceptions import InvalidTokenError
import os

from models import Base, User, LearningPlan, ActivityLog
from schemas import (
    UserCreate, UserLogin, LearningPlanCreate, ProgressUpdate,
    UserResponse, LearningPlanResponse, ActivityLog as ActivityLogSchema,
    ProgressStats
)
from crud import (
    create_user, get_user_by_username, create_learning_plan,
    update_progress, get_unfinished_plans_count
)
from utils import generate_learning_plan
from database import SessionLocal, engine

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MAX_UNFINISHED_PLANS = 3

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
Base.metadata.create_all(bind=engine)
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    user = get_user_by_username(db, username=payload.get("sub"))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/register/", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

@app.post("/login/")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": db_user.username, "user_id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/generate-plan/", response_model=LearningPlanResponse)
async def generate_plan(
    plan: LearningPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if get_unfinished_plans_count(db, current_user.id) >= MAX_UNFINISHED_PLANS:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_UNFINISHED_PLANS} unfinished plans allowed"
        )

    learning_plan = create_learning_plan(db=db, plan=plan, user_id=current_user.id)
    learning_plan.plan = generate_learning_plan(goal=plan.goal)
    db.commit()
    return learning_plan

@app.get("/learning-plan/all", response_model=List[LearningPlanResponse])
async def get_all_learning_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None
):
    query = db.query(LearningPlan).filter(LearningPlan.user_id == current_user.id)
    if status:
        query = query.filter(LearningPlan.completed == (status == "completed"))
    return query.all()

@app.post("/activity/log")
async def log_activity(
    activity: ActivityLogSchema,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(LearningPlan).filter_by(id=activity.activity_id).first()
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Learning plan not found")

    db_activity = ActivityLog(
        user_id=current_user.id,
        plan_id=activity.activity_id,
        completed=activity.completed,
        completed_at=datetime.now() if activity.completed else None,
        notes=activity.notes
    )
    db.add(db_activity)
    
    if activity.completed:
        total_activities = len([item for sublist in plan.plan.values() for item in sublist])
        completed_activities = db.query(ActivityLog).filter(
            ActivityLog.plan_id == plan.id,
            ActivityLog.completed == True
        ).count() + 1
        
        plan.progress = (completed_activities / total_activities * 100)
        if plan.progress >= 100:
            plan.completed = True
            plan.completed_at = datetime.now()
    
    background_tasks.add_task(update_user_streak, current_user.id, db)
    db.commit()
    return {"status": "success"}

@app.get("/analytics/progress", response_model=ProgressStats)
async def get_progress_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plans = db.query(LearningPlan).filter_by(user_id=current_user.id).all()
    week_ago = datetime.now() - timedelta(days=7)
    
    daily_activity = (
        db.query(
            func.date(ActivityLog.completed_at).label('date'),
            func.count(ActivityLog.id).label('count')
        )
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.completed_at >= week_ago
        )
        .group_by(func.date(ActivityLog.completed_at))
        .all()
    )

    total_activities = sum(len([item for sublist in plan.plan.values() for item in sublist]) for plan in plans)
    completed_activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.completed == True
    ).count()

    return {
        "total_plans": len(plans),
        "completed_plans": sum(1 for p in plans if p.completed),
        "in_progress": sum(1 for p in plans if not p.completed),
        "weekly_activity": [{"date": day.date.isoformat(), "count": day.count} for day in daily_activity],
        "completion_rate": round((completed_activities / total_activities * 100) if total_activities else 0, 2),
        "streak_days": current_user.streak_days
    }

async def update_user_streak(user_id: int, db: Session):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        return
    
    today = datetime.now().date()
    last_activity = user.last_activity.date() if user.last_activity else None
    
    if last_activity == today - timedelta(days=1):
        user.streak_days += 1
    elif last_activity != today:
        user.streak_days = 1
    
    user.last_activity = datetime.now()
    db.commit()