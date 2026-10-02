import re


def extract_skills(text: str) -> set[str]:
    skills = {
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "angular",
        "vue",
        "html",
        "css",
        "node.js",
        "node",
        "fastapi",
        "django",
        "flask",
        "mongodb",
        "mysql",
        "postgresql",
        "sql",
        "git",
        "github",
        "docker",
        "aws",
        "machine learning",
        "artificial intelligence",
        "data analysis",
        "pandas",
        "numpy",
        "figma",
    }

    text_lower = text.lower()

    return {
        skill
        for skill in skills
        if re.search(r"\b" + re.escape(skill) + r"\b", text_lower)
    }


def calculate_job_match(resume_text: str, job: dict) -> dict:
    resume_skills = extract_skills(resume_text)

    job_text = " ".join([
        job.get("title", ""),
        job.get("description", ""),
        " ".join(job.get("skills", []))
    ])

    job_skills = extract_skills(job_text)

    if job_skills:
        matched_skills = resume_skills.intersection(job_skills)
        missing_skills = job_skills - resume_skills

        match_score = round(
            (len(matched_skills) / len(job_skills)) * 100
        )
    else:
        matched_skills = set()
        missing_skills = set()
        match_score = 0

    return {
        "match_score": match_score,
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "resume_skills": sorted(resume_skills),
        "job_skills": sorted(job_skills),
    }