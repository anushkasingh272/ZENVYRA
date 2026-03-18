import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

import models  # to load models before Base.metadata.create_all

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Personal Portfolio Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Portfolio Platform API"}

from routers import auth_router, projects_router, skills_router, ai_router, portfolio_router, repositories_router, github_router

app.include_router(auth_router.router)
app.include_router(projects_router.router)
app.include_router(skills_router.router)
app.include_router(ai_router.router)
app.include_router(portfolio_router.router)
app.include_router(repositories_router.router)
app.include_router(github_router.router)
