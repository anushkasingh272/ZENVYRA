from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth_router import get_current_user

router = APIRouter(prefix="/skills", tags=["skills"])

@router.post("/", response_model=schemas.SkillResponse)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_skill = models.Skill(**skill.dict(), user_id=current_user.id)
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.get("/", response_model=List[schemas.SkillResponse])
def get_user_skills(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Skill).filter(models.Skill.user_id == current_user.id).all()
