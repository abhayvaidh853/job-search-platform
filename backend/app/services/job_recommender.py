from app.services.job_matcher import calculate_job_match


def recommend_jobs(resume_text: str, jobs: list) -> list:
    recommendations = []

    for job in jobs:
        match = calculate_job_match(resume_text, job)

        recommendations.append({
            "job_id": str(job["_id"]),
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "location": job.get("location", ""),
            "job_type": job.get("job_type", ""),
            "work_mode": job.get("work_mode", ""),
            "experience": job.get("experience", ""),
            "salary": job.get("salary"),
            "skills": job.get("skills", []),
            "match_score": match["match_score"],
            "matched_skills": match["matched_skills"],
            "missing_skills": match["missing_skills"]
        })

    recommendations.sort(
        key=lambda job: job["match_score"],
        reverse=True
    )

    return recommendations