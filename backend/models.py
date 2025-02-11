from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey, TIMESTAMP, Float, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    streak_days = Column(Integer, default=0)
    last_activity = Column(TIMESTAMP)
    
    learning_plans = relationship("LearningPlan", back_populates="user")
    activities = relationship("ActivityLog", back_populates="user")

class LearningPlan(Base):
    __tablename__ = "learning_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal = Column(String)
    plan = Column(JSON)
    progress = Column(Float, default=0.0)
    difficulty = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    completed = Column(Boolean, default=False)
    completed_at = Column(TIMESTAMP, nullable=True)
    
    user = relationship("User", back_populates="learning_plans")
    activities = relationship("ActivityLog", back_populates="learning_plan")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("learning_plans.id"))
    activity = Column(String)
    completed = Column(Boolean, default=False)
    completed_at = Column(TIMESTAMP, nullable=True)
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="activities")
    learning_plan = relationship("LearningPlan", back_populates="activities")