from sqlalchemy.orm import Session
import models
import schemas

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, email=user.email, password_hash=user.password) 
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_learning_plan(db: Session, plan: schemas.LearningPlanCreate, user_id: int):
    db_plan = models.LearningPlan(user_id=user_id, goal=plan.goal, plan={}) 
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def update_progress(db: Session, progress: schemas.ProgressUpdate, user_id: int):
    db_progress = models.Progress(user_id=user_id, plan_id=progress.plan_id, activity=progress.activity, completed=progress.completed)
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress


def get_unfinished_plans_count(db: Session, user_id: int) -> int:
    return db.query(models.LearningPlan)\
             .filter(models.LearningPlan.user_id == user_id)\
             .filter(models.LearningPlan.completed == False)\
             .count()