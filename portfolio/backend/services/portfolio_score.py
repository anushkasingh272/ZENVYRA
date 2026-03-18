import models
from sqlalchemy.orm import Session
from schemas import PortfolioScoreResponse, PortfolioScoreBreakdown


def calculate_portfolio_score(user: models.User, db: Session) -> PortfolioScoreResponse:
    """
    Calculate a dynamic portfolio score based on actual user data.
    All scores are computed live — nothing is hardcoded.
    """

    # ── Skills Score ──────────────────────────────────────────────────
    num_skills = db.query(models.Skill).filter(models.Skill.user_id == user.id).count()
    if num_skills >= 10:
        skills_score = 100
    elif num_skills >= 6:
        skills_score = 90
    elif num_skills >= 3:
        skills_score = 75
    elif num_skills >= 1:
        skills_score = 55
    else:
        skills_score = 10

    # ── Projects Score ────────────────────────────────────────────────
    projects = db.query(models.Project).filter(models.Project.user_id == user.id).all()
    num_projects = len(projects)
    if num_projects >= 5:
        projects_score = 100
    elif num_projects >= 3:
        projects_score = 85
    elif num_projects >= 1:
        projects_score = 65
    else:
        projects_score = 10

    # Bonus for well-described projects
    for p in projects:
        if len(p.description) > 100:
            projects_score += 2
    projects_score = min(projects_score, 100)

    # ── Repos Score (experience proxy) ────────────────────────────────
    repos = db.query(models.Repository).filter(models.Repository.user_id == user.id).all()
    num_repos = len(repos)
    # Stars across all repos shows real-world impact
    total_stars = sum((r.stars or 0) for r in repos)

    if num_repos >= 5 or total_stars >= 50:
        experience_score = 95
    elif num_repos >= 3 or total_stars >= 10:
        experience_score = 80
    elif num_repos >= 1:
        experience_score = 60
    else:
        experience_score = 30

    # ── Profile Completion (resume proxy) ─────────────────────────────
    resume_score = 40  # base
    if user.bio and len(user.bio) >= 50:
        resume_score += 30
    elif user.bio and len(user.bio) >= 20:
        resume_score += 15
    if user.full_name:
        resume_score += 15
    if user.email:
        resume_score += 15
    resume_score = min(resume_score, 100)

    # ── Total ────────────────────────────────────────────────────────
    total_score = (skills_score + projects_score + experience_score + resume_score) // 4

    # ── Suggestions ───────────────────────────────────────────────────
    suggestions = []
    if skills_score < 75:
        remaining = max(0, 3 - num_skills)
        suggestions.append(f"Add {remaining} more skill{'s' if remaining != 1 else ''} to boost your Skills score.")
    if projects_score < 75:
        remaining = max(0, 3 - num_projects)
        suggestions.append(f"Add {remaining} more project{'s' if remaining != 1 else ''} with detailed descriptions.")
    if experience_score < 60:
        suggestions.append("Link your GitHub repositories to show real-world experience and open-source impact.")
    if resume_score < 60:
        suggestions.append("Expand your bio (50+ characters) to appear more complete to recruiters.")

    return PortfolioScoreResponse(
        score=total_score,
        breakdown=PortfolioScoreBreakdown(
            skills=skills_score,
            projects=projects_score,
            experience=experience_score,
            resume=resume_score
        ),
        suggestions=suggestions
    )
