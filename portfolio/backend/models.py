from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True) # Adding username for public link
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    projects = relationship("Project", back_populates="user")
    skills = relationship("Skill", back_populates="user")
    profile_views = relationship("ProfileView", back_populates="user")
    repositories = relationship("Repository", back_populates="user")
    chat_history = relationship("ChatHistory", back_populates="user")

class ProfileView(Base):
    __tablename__ = "profile_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    duration = Column(Integer, nullable=True)

    user = relationship("User", back_populates="profile_views")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    tech_stack = Column(JSON)
    github_url = Column(String, nullable=True)
    demo_url = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Changed to user_id

    user = relationship("User", back_populates="projects") # Renamed from owner

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    level = Column(String) # e.g., Beginner, Intermediate, Advanced
    user_id = Column(Integer, ForeignKey("users.id")) # Changed to user_id
    
    user = relationship("User", back_populates="skills") # Renamed from owner

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    url = Column(String)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    language = Column(String, nullable=True)
    commits = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="repositories")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(Text)
    response = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chat_history")
