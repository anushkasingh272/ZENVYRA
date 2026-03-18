import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from sqlalchemy.orm import Session
import models

# In-memory mock vector store cache per user
_user_vector_stores = {}

class MockVectorStore:
    """Fallback when no OpenAI API key is provided, or for testing."""
    def __init__(self, data: str):
        self.data = data
        
    def similarity_search(self, query: str, k: int = 2):
        return [Document(page_content=self.data, metadata={"type": "fallback"})]

def build_user_vector_store(user_id: int, db: Session):
    """Chunks data logically and stores metadata for FAISS search"""
    if user_id in _user_vector_stores:
        return _user_vector_stores[user_id]
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    user_data = f"Bio: {user.bio} \nFull name: {user.full_name}\n"
    
    docs = []
    
    # Chunk user data
    docs.append(Document(page_content=user_data, metadata={"type": "profile", "user_id": user_id}))
    
    # Chunk skills
    skills = db.query(models.Skill).filter(models.Skill.user_id == user_id).all()
    for s in skills:
        docs.append(Document(page_content=f"Skill: {s.name}, Level: {s.level}", metadata={"type": "skill", "name": s.name}))
        
    # Chunk Projects
    projects = db.query(models.Project).filter(models.Project.user_id == user_id).all()
    for p in projects:
        docs.append(Document(page_content=f"Project: {p.title}\nDescription: {p.description}\nStack: {', '.join(p.tech_stack)}", 
                         metadata={"type": "project", "title": p.title}))
    
    openai_key = os.getenv("OPENAI_API_KEY", "dummy-key")
    if openai_key == "dummy-key":
        # Mock behavior
        _user_vector_stores[user_id] = MockVectorStore(user_data + str([d.page_content for d in docs]))
    else:
        try:
            embeddings = OpenAIEmbeddings()
            _user_vector_stores[user_id] = FAISS.from_documents(docs, embeddings)
        except Exception as e:
            # Fallback if OpenAI key is invalid
            _user_vector_stores[user_id] = MockVectorStore(user_data + str([d.page_content for d in docs]))
            
    return _user_vector_stores[user_id]
