from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from routers.auth_router import get_current_user
import models
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.portfolio_score import calculate_portfolio_score
from services.ai_chat import ask_chatbot
from services.gemini_service import generate_response

router = APIRouter(prefix="/ai", tags=["ai"])

class EnhanceRequest(BaseModel):
    text: str
    context: str = "project description"

class EnhanceResponse(BaseModel):
    enhanced_text: str

@router.post("/enhance", response_model=EnhanceResponse)
async def enhance_text(request: EnhanceRequest, current_user: models.User = Depends(get_current_user)):
    try:
        prompt = f"Rewrite this description professionally without adding technologies not mentioned:\n{request.text}"
        enhanced_text = generate_response(prompt)
        return EnhanceResponse(enhanced_text=enhanced_text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AnalyzeRequest(BaseModel):
    pass

@router.post("/analyze", response_model=schemas.PortfolioScoreResponse)
async def analyze_portfolio(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return calculate_portfolio_score(current_user, db)

class ChatRequest(BaseModel):
    question: str
    user_id: int
    session_id: str = "default_session"

@router.post("/chat")
async def recruiter_chat(request: ChatRequest, db: Session = Depends(get_db)):
    answer = ask_chatbot(request.question, request.user_id, request.session_id, db)
    return {"answer": answer}

