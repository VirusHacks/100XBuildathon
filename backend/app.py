import numpy as np
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS 
import os
app = Flask(__name__)
CORS(app) 
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def remove_bias(text):
    """
    A simple debiasing function that lowercases the text and replaces some gender-specific terms.
    This is a starting point; consider more robust methods for production use.
    """
    original_text = text
    text = text.lower()
    replacements = {
        " he ": " they ",
        " she ": " they ",
        " him ": " them ",
        " her ": " them ",
        " mr. ": " ",
        " mrs. ": " ",
        " ms. ": " "
    }
    for key, value in replacements.items():
        text = text.replace(key, value)
    
    # Logging for transparency
    # print("Original:", original_text)
    # print("Debiased:", text)
    return text

def get_embedding(text):
    """Fetch text embeddings from OpenAI API"""
    try:
        response = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return np.array(response.data[0].embedding)
    except Exception as e:
        print(f"Error in get_embedding: {e}")  # Debugging log
        return None

@app.route('/')
def welcome():
    return "Welcome to the AI Backend!"

@app.route('/match/welcome')
def match_welcome():
    return "Welcome to the AI Match Backend!"

@app.route('/match', methods=['POST'])
def match():
    data = request.get_json()

    if not data or 'job_description' not in data or 'resume_text' not in data:
        return jsonify({'error': 'Missing job_description or resume_text in request'}), 400

    job_description = data['job_description']
    resume_text = data['resume_text']
    
    # Remove bias from both job description and resume text
    job_description_clean = remove_bias(job_description)
    resume_text_clean = remove_bias(resume_text)
    
    # Generate embeddings from the debiased texts
    try:
        emb1 = get_embedding(job_description_clean)
        emb2 = get_embedding(resume_text_clean)
    except Exception as e:
        return jsonify({'error': f'Embedding generation failed: {str(e)}'}), 500

    # Compute cosine similarity
    similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
    
    return jsonify({'similarity_score': float(similarity)})

if __name__ == '__main__':
    app.run(debug=True)

