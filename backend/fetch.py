import requests
import json

# Replace with your ngrok URL
API_URL = "https://47da-34-13-139-96.ngrok-free.app/"

# Example: Match a job description to a resume
def match_job_to_resume(job_description, resume_text):
    response = requests.post(
        f"{API_URL}/match",
        json={
            "job_description": job_description,
            "resume_text": resume_text
        }
    )
    return response.json()
# Example: Add a new job to the database
def add_job(job_title, job_description, job_id=None):
    data = {
        "job_title": job_title,
        "job_description": job_description
    }
    if job_id:
        data["job_id"] = job_id
        
    response = requests.post(
        f"{API_URL}/add_job",
        json=data
    )
    return response.json()

# Example: Add a new resume to the database
def add_resume(resume_text, resume_id=None):
    data = {
        "resume_text": resume_text
    }
    if resume_id:
        data["resume_id"] = resume_id
        
    response = requests.post(
        f"{API_URL}/add_resume",
        json=data
    )
    return response.json()




# Test the API
job_description = "We are looking for a Python developer with experience in machine learning and NLP..."
resume_text = "Experienced software engineer with 5 years of Python development. Proficient in NLP and machine learning..."

# # Match job to resume
# match_result = match_job_to_resume(job_description, resume_text)
# print(json.dumps(match_result, indent=2))
# check adding resume to the database
# resume_result = add_resume(resume_text)
# print(json.dumps(resume_result, indent=2))
# check adding job to the database
job_result = add_job("Python Developer", job_description)
print(json.dumps(job_result, indent=2))