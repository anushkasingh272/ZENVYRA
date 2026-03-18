import os
from sqlalchemy.orm import Session
from services.vector_service import build_user_vector_store
from services.gemini_service import generate_response
from services.redis_service import get_session_history, save_session_history
import models

def ask_chatbot(question: str, user_id: int, session_id: str, db: Session) -> str:
    # Step 1: Try to get FAISS context for this user
    docs = []
    try:
        vector_store = build_user_vector_store(user_id, db)
        if vector_store:
            docs = vector_store.similarity_search(question)
    except Exception as e:
        print(f"[Chatbot] FAISS search failed: {e} — falling back to direct Gemini call.")

    # Step 2: If no FAISS docs, load basic user info from DB
    user_context = ""
    if not docs:
        try:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if user:
                user_context = f"Candidate Name: {user.full_name}\nBio: {user.bio or 'Not provided'}\n"
                skills = db.query(models.Skill).filter(models.Skill.user_id == user_id).all()
                if skills:
                    user_context += "Skills: " + ", ".join(f"{s.name} ({s.level})" for s in skills) + "\n"
                projects = db.query(models.Project).filter(models.Project.user_id == user_id).all()
                for p in projects:
                    user_context += f"Project: {p.title} - {p.description} (Stack: {', '.join(p.tech_stack)})\n"
        except Exception as e:
            print(f"[Chatbot] Could not load user from DB: {e}")
    else:
        user_context = "\n".join(docs)

    # Step 3: Load session history from Redis
    history = get_session_history(session_id)

    # Step 4: Build prompt
    prompt = (
        "You are an AI assistant representing a professional candidate.\n"
        "Answer the recruiter's questions based on the candidate's profile information below.\n"
        "Be direct, professional, and concise.\n\n"
        f"=== Candidate Profile ===\n{user_context}\n"
    )

    if history:
        prompt += "\n=== Conversation History ===\n"
        for p in history[-4:]:
            prompt += f"Recruiter: {p['user']}\nAssistant: {p['ai']}\n"

    prompt += f"\n=== Recruiter's Question ===\n{question}\n\nAssistant:"

    print(f"[Chatbot] Sending prompt for user_id={user_id}, question='{question[:60]}...'")

    # Step 5: Call Gemini
    try:
        answer = generate_response(prompt)
        history.append({"user": question, "ai": answer})
        save_session_history(session_id, history)
        return answer
    except Exception as e:
        print(f"[Chatbot] generate_response failed: {e}")
        return f"Error generating response: {str(e)}"
