import os
from sentence_transformers import SentenceTransformer

# Load model once to memory
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def get_embedding(text: str) -> list[float]:
    model = get_embedding_model()
    return model.encode(text).tolist()
