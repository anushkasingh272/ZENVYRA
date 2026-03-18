from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.github_service import analyze_github_repository

router = APIRouter(tags=["github"])

class GithubAnalysisRequest(BaseModel):
    repo_url: str

@router.post("/analyze-github")
def analyze_github(request: GithubAnalysisRequest):
    """
    Analyze a public GitHub repository URL.
    No auth required — usable from public profile pages too.
    """
    repo_url = request.repo_url.strip()
    if not repo_url:
        raise HTTPException(status_code=400, detail="repo_url must not be empty.")
    if not repo_url.startswith("https://github.com/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL. Must be a full GitHub URL starting with https://github.com/"
        )
    return analyze_github_repository(repo_url)
