from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.mongodb import client
from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router
from app.routes.companies import router as companies_router
from app.routes.applications import router as applications_router
from app.routes.saved_jobs import router as saved_jobs_router
from app.routes.resume import router as resume_router
from app.routes.resume_analysis import router as resume_analysis_router
from app.routes.job_match import router as job_match_router
from app.routes.recommendations import router as recommendations_router
from app.utils.dependencies import get_current_admin
from fastapi import Depends
from app.routes.users import router as users_router
from app.routes.settings import router as settings_router

app = FastAPI(
    title="Job Search Platform with AI",
    description="Backend API for Job Search Platform with AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(companies_router)
app.include_router(applications_router)
app.include_router(saved_jobs_router)
app.include_router(resume_router)
app.include_router(resume_analysis_router)
app.include_router(job_match_router)
app.include_router(recommendations_router)
app.include_router(users_router)
app.include_router(settings_router)


@app.get("/")
def root():
    return {
        "message": "Job Search Platform with AI API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    try:
        client.admin.command("ping")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
        
        
        
        
@app.get("/admin/test")
def admin_test(
    current_admin: dict = Depends(get_current_admin)
):
    return {
        "message": "Admin access granted",
        "email": current_admin.get("email"),
        "role": current_admin.get("role")
    }