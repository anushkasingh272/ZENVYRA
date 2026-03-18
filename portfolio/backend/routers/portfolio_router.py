from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
import io
import models, schemas
from database import get_db
from routers.auth_router import get_current_user
from typing import Dict, Any
from services.pdf_service import generate_resume_pdf

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

@router.get("/ping")
def ping():
    return {"ping": "pong"}

@router.get("/{username}/public")
def get_public_portfolio(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Log the view
    new_view = models.ProfileView(user_id=user.id)
    db.add(new_view)
    db.commit()

    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "bio": user.bio,
        "projects": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "tech_stack": p.tech_stack,
                "github_url": p.github_url,
                "demo_url": p.demo_url
            } for p in user.projects
        ],
        "skills": [
            {
                "id": s.id,
                "name": s.name,
                "level": s.level
            } for s in user.skills
        ]
    }

@router.get("/analytics/me")
def get_my_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    views = db.query(models.ProfileView).filter(models.ProfileView.user_id == current_user.id).order_by(desc(models.ProfileView.timestamp)).all()
    
    return {
        "total_views": len(views),
        "recent_views": [
            {"timestamp": v.timestamp, "duration": v.duration} for v in views[:10]
        ]
    }

@router.get("/{username}/resume")
def get_resume_pdf(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    pdf_content = generate_resume_pdf(user)
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={user.username}_resume.pdf",
            "Content-Length": str(len(pdf_content))
        }
    )
