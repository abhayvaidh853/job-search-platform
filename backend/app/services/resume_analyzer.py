import os
import re

from pypdf import PdfReader
from docx import Document


def extract_text_from_resume(file_path: str) -> str:
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text.strip()

    if extension == ".docx":
        document = Document(file_path)

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

        return text.strip()

    raise ValueError("Only PDF and DOCX files are supported")


def calculate_ats_score(text: str) -> int:
    score = 0

    text_lower = text.lower()

    sections = {
        "skills": [
            "skills",
            "technical skills",
            "key skills"
        ],
        "experience": [
            "experience",
            "work experience",
            "professional experience"
        ],
        "education": [
            "education",
            "academic",
            "qualification"
        ],
        "projects": [
            "projects",
            "project"
        ],
        "contact": [
            "@",
            "phone",
            "contact"
        ]
    }

    for keywords in sections.values():
        if any(keyword in text_lower for keyword in keywords):
            score += 15

    if len(text.split()) >= 300:
        score += 10

    if len(text.split()) >= 500:
        score += 5

    return min(score, 100)


def analyze_resume(file_path: str) -> dict:
    text = extract_text_from_resume(file_path)

    if not text:
        return {
            "ats_score": 0,
            "word_count": 0,
            "message": "Could not extract text from resume"
        }

    score = calculate_ats_score(text)

    return {
        "ats_score": score,
        "word_count": len(text.split()),
        "message": "Resume analyzed successfully"
    }