import os
import redis
import json
from typing import List, Dict

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_redis_client = None

def get_redis_client():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            # test connection
            _redis_client.ping()
        except Exception:
            _redis_client = None # Fallback in usage
    return _redis_client

# Simple local cache for fallback when Redis is unavailable
_fallback_memory = {}

def get_session_history(session_id: str) -> List[Dict]:
    client = get_redis_client()
    if not client:
        return _fallback_memory.get(session_id, [])
        
    try:
        data = client.get(f"chat_session:{session_id}")
        if data:
            return json.loads(data)
    except Exception:
        return _fallback_memory.get(session_id, [])
    return []

def save_session_history(session_id: str, history: List[Dict]):
    client = get_redis_client()
    if not client:
        _fallback_memory[session_id] = history
        return
        
    try:
        # Save with expiry of 2 hours
        client.setex(f"chat_session:{session_id}", 7200, json.dumps(history))
    except Exception:
        _fallback_memory[session_id] = history
