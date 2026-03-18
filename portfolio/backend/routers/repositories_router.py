from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import requests

import models, schemas
from database import get_db
from routers.auth_router import get_current_user

router = APIRouter(prefix="/repos", tags=["repositories"])

@router.post("/", response_model=schemas.RepositoryResponse)
def create_repository(repo: schemas.RepositoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_repo = models.Repository(**repo.dict(), user_id=current_user.id)
    db.add(db_repo)
    db.commit()
    db.refresh(db_repo)
    return db_repo

@router.get("/", response_model=List[schemas.RepositoryResponse])
def get_user_repositories(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Repository).filter(models.Repository.user_id == current_user.id).all()

@router.post("/analyze")
def analyze_repository(url: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # url is the github repo url, e.g., https://github.com/owner/repo
    if not url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
    parts = url.rstrip("/").split("/")
    if len(parts) < 5:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        
    owner, repo_name = parts[-2], parts[-1]
    
    headers = {}
    github_token = os.getenv("GITHUB_API_KEY")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
        
    # Get repo details
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}"
    response = requests.get(api_url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch repository data from GitHub")
        
    repo_data = response.json()
    
    # Analyze with Gemini via ai_router logic or internal service
    from services.ai_chat import generate_fallback_response # or use correct gemini service
    import google.generativeai as genai
    
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-pro")
    
    prompt = f"""
    Analyze the following GitHub repository:
    Name: {repo_data.get('name')}
    Description: {repo_data.get('description')}
    Language: {repo_data.get('language')}
    Stars: {repo_data.get('stargazers_count')}
    Forks: {repo_data.get('forks_count')}
    
    Provide insights on:
    - Project complexity
    - Tech stack
    - Code maturity
    - Impact
    
    Keep it concise and professional.
    """
    
    try:
        ai_response = model.generate_content(prompt)
        insights = ai_response.text
    except Exception as e:
        insights = "Analysis unavailable at this time."
        
    return {
        "name": repo_data.get("name"),
        "description": repo_data.get("description"),
        "url": url,
        "stars": repo_data.get("stargazers_count"),
        "forks": repo_data.get("forks_count"),
        "language": repo_data.get("language"),
        "insights": insights
    }
