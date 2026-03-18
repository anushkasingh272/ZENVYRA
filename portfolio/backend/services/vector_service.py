import os
import faiss
import numpy as np
import json
from services.embedding_service import get_embedding
from sqlalchemy.orm import Session
import models

VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "./faiss_store")

if not os.path.exists(VECTOR_DB_PATH):
    os.makedirs(VECTOR_DB_PATH)

_user_vector_stores = {}

class VectorService:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.index_path = os.path.join(VECTOR_DB_PATH, f"user_{user_id}.index")
        self.meta_path = os.path.join(VECTOR_DB_PATH, f"user_{user_id}_meta.json")
        self.dimension = 384 # all-MiniLM-L6-v2 dimension
        
        self.index = None
        self.metadata = []
        self._load_or_create()
        
    def _load_or_create(self):
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, 'r') as f:
                self.metadata = json.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []
            
    def store_documents(self, documents: list[dict]):
        if not documents:
            return
            
        texts = [doc["text"] for doc in documents]
        embeddings = []
        for text in texts:
            embeddings.append(get_embedding(text))
            
        embeddings_np = np.array(embeddings).astype('float32')
        
        # Reset index to avoid duplicates during recreation (for simplicity)
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(embeddings_np)
        
        self.metadata = []
        for doc in documents:
            self.metadata.append({"text": doc["text"], "meta": doc["metadata"]})
            
        self._save()
            
    def similarity_search(self, query: str, k: int = 3):
        if self.index is None or self.index.ntotal == 0:
            return []
            
        q_emb = np.array([get_embedding(query)]).astype('float32')
        distances, indices = self.index.search(q_emb, k)
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self.metadata):
                results.append(self.metadata[idx]["text"])
        return results
        
    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, 'w') as f:
            json.dump(self.metadata, f)

def build_user_vector_store(user_id: int, db: Session) -> VectorService:
    """Chunks data logically and stores metadata for FAISS search"""
    if user_id in _user_vector_stores:
        return _user_vector_stores[user_id]
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    user_data = f"Bio: {user.bio} \nFull name: {user.full_name}\n"
    
    docs = []
    
    # Chunk user data
    docs.append({"text": user_data, "metadata": {"type": "profile", "user_id": user_id}})
    
    # Chunk skills
    skills = db.query(models.Skill).filter(models.Skill.user_id == user_id).all()
    for s in skills:
        docs.append({"text": f"Skill: {s.name}, Level: {s.level}", "metadata": {"type": "skill", "name": s.name}})
        
    # Chunk Projects
    projects = db.query(models.Project).filter(models.Project.user_id == user_id).all()
    for p in projects:
        docs.append({"text": f"Project: {p.title}\nDescription: {p.description}\nStack: {', '.join(p.tech_stack)}", 
                         "metadata": {"type": "project", "title": p.title}})
    
    vector_service = VectorService(user_id)
    vector_service.store_documents(docs)
    
    _user_vector_stores[user_id] = vector_service
    return vector_service
