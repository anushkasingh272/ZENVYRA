import os
import requests
import re
from fastapi import HTTPException
from dotenv import load_dotenv
from services.gemini_service import generate_response

load_dotenv()

GITHUB_API_KEY = os.getenv("GITHUB_API_KEY")

print("GitHub token loaded:", bool(GITHUB_API_KEY))

def extract_owner_repo(repo_url: str):
    """Extract owner and repository name from a GitHub URL."""
    pattern = r"github\.com/([^/]+)/([^/]+)"
    match = re.search(pattern, repo_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL provided.")
    
    owner = match.group(1)
    repo = match.group(2).replace(".git", "").strip("/")
    
    return owner, repo

def fetch_github_repository(repo_url: str):
    """Fetch repository data from GitHub API."""
    owner, repo = extract_owner_repo(repo_url)
    
    url = f"https://api.github.com/repos/{owner}/{repo}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    
    if GITHUB_API_KEY:
        headers["Authorization"] = f"token {GITHUB_API_KEY}"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Repository not found on GitHub.")
    elif response.status_code == 403 or response.status_code == 429:
        raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded or access forbidden.")
    elif response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"GitHub API Error: {response.text}")
        
    data = response.json()
    
    return {
        "name": data.get("name"),
        "description": data.get("description"),
        "language": data.get("language"),
        "stargazers_count": data.get("stargazers_count"),
        "forks_count": data.get("forks_count"),
        "open_issues_count": data.get("open_issues_count"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
        "topics": data.get("topics", []),
        "size": data.get("size")
    }

def analyze_github_repository(repo_url: str):
    """Fetch repository data and generate analysis using Gemini."""
    repo_data = fetch_github_repository(repo_url)
    
    prompt = f"""Analyze the following GitHub project and provide insights about the technology stack, project complexity, potential impact, and improvements.

Project Name: {repo_data['name']}
Description: {repo_data['description'] or 'No description provided.'}
Primary Language: {repo_data['language']}
Stars: {repo_data['stargazers_count']}
Forks: {repo_data['forks_count']}
Topics: {', '.join(repo_data['topics']) if repo_data['topics'] else 'None'}

Please output your analysis clearly with the following sections:
• Project Summary
• Tech Stack
• Complexity Level
• Strengths
• Suggested Improvements
"""
    
    analysis = generate_response(prompt)
    
    return {
        "repository": repo_data,
        "analysis": analysis
    }
