from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    bio: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: str
    tech_stack: List[str]
    github_url: Optional[str] = None
    demo_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Skill Schemas
class SkillBase(BaseModel):
    name: str
    level: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Repository Schemas
class RepositoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: str
    stars: Optional[int] = 0
    forks: Optional[int] = 0
    language: Optional[str] = None
    commits: Optional[int] = 0

class RepositoryCreate(RepositoryBase):
    pass

class RepositoryResponse(RepositoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Profile View Schemas
class ProfileViewBase(BaseModel):
    user_id: int
    duration: Optional[int] = None

class ProfileViewCreate(ProfileViewBase):
    pass

class ProfileViewResponse(ProfileViewBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Portfolio Score Schemas
class PortfolioScoreBreakdown(BaseModel):
    skills: int
    projects: int
    experience: int
    resume: int

class PortfolioScoreResponse(BaseModel):
    score: int
    breakdown: PortfolioScoreBreakdown
    suggestions: List[str]
