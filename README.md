# 🚀 HireX: The AI Hiring Copilot Built for Speed, Depth & Fairness

**HireX** is your intelligent hiring assistant that blends **hybrid semantic matching, multi-agent verification, explainability**, and **real-time automation**—all designed to reduce hiring time by **40%**, eliminate bias, and unlock **true candidate potential**.

From parsing resumes to scoring them against live job requirements and peers, **HireX thinks, verifies, and explains—like a recruiter, but faster and smarter.**

---

## ⚠️ Problem Landscape (As per HireAI)

Today's hiring processes are broken:

| ❌ Challenge | 💥 Pain |
|-------------|--------|
| 📄 **250+ resumes per role** | Talent gets ignored due to overload. |
| 🧠 **Keyword-based matching** | Lacks context—misses real skills. |
| 🚫 **Unverified claims** | No cross-checking = false positives. |
| ⚖️ **Bias in AI + humans** | Low diversity & unfair hiring. |
| 🤷‍♀️ **Opaque decisions** | Recruiters can’t trust AI scores. |
| ⏳ **Slow hiring** | $500/day loss per unfilled role. |

---

## ✅ How HireX Solves This — Better Than Anyone

### 💡 Our Unique Formula

We combine:
- ⚙️ **Hybrid Semantic Matching (Sentence-BERT + Cosine Similarity)**
- 🧠 **Multi-Agentic AI with Section-Wise Verification**
- 🔍 **Real-Time Web Validation (GitHub, LinkedIn, etc.)**
- 🧾 **Transparent Explainability Dashboard**
- 🚄 **System Design Optimized for 5-Second Response Time**

---

## 🧬 Core Workflow

### 🔎 1. Resume & JD Parsing
- Uses `Deep4GB NLP` to break resumes and job descriptions into **skills, experience, certifications, achievements**, etc.

### 🔁 2. Hybrid Semantic Matching
- Embeds both JD and resumes using `sentence-transformers/all-mpnet-base-v2`.
- Applies **bi-directional cosine similarity**:
  - **Resume ↔ JD Matching**
  - **JD ↔ Resume Relevance**
- Returns the **most semantically aligned candidates**, not just keyword matches.

### 🤖 3. Multi-Agentic AI Setup
- **Each resume section is assigned a specialized AI agent**.
- Agents score independently, then **communicate** to:
  - Cross-verify data
  - Challenge inconsistencies
  - Adjust scores collaboratively
- Results in **peer-reviewed, high-trust scoring**.

### 📏 4. Benchmarking & Ranking
- Candidates are ranked against:
  - JD-defined skill & experience thresholds
  - Industry averages
  - Other applicants for the role
- Final scores are **weighted**, **audited**, and **bias-corrected**.

### 🧠 5. PeopleGPT: Queryable Explainable AI
Ask:  
> “Why is Candidate X ranked higher than Y?”  
> “What validated evidence backs this skill?”  
> “What’s their strongest project?”

Our Explainability Dashboard uses **SHAP/LIME** to show **why each decision was made**, in simple terms.

---

## 🚄 5-Second Processing: Our Engineering Backbone

| 🧠 Component | ⚡ Design |
|-------------|----------|
| **Kafka** | Real-time resume stream ingestion |
| **Redis** | Low-latency caching & scoring |
| **Multithreading** | Parallelized resume section processing |
| **Microservices** | Modular AI + crawler agents |
| **Client-Side Caching** | Instantaneous dashboard UX |
| **Cloud Infra** | GPU-accelerated scoring at scale |

---

## 🎯 Our Advantages at a Glance

| 🔍 Feature | 🏆 Why It’s Better |
|-----------|------------------|
| **Hybrid Matching** | Goes beyond keywords → uses actual context |
| **Agentic AI** | Distributed, expert-like section processing |
| **Claim Validation** | Crawls web for GitHub, LinkedIn, portfolio checks |
| **Explainability** | Audit logs + recruiter Q&A with the AI |
| **Benchmarking** | Compares against job reqs, peers, and global norms |
| **5s Total Runtime** | Speed of automation, quality of human judgement |

---
## 🏗️ Project Structure  

📂 **HireX** (Root Directory)  
 ┣ 📂 **backend/** → Backend API for AI-based resume parsing, verification & ranking.  
 ┣ 📂 **frontend/** → Frontend dashboard for recruiters to interact with AI-driven insights.  
 ┗ 📄 **README.md** → You are here!  

---

## ⚙️ Installation & Setup  

### Prerequisites  
Ensure you have **Python 3.8+**, **Flask**, and required dependencies installed.  

### 🔧 Setup Instructions  

 **Clone the repository**  
```bash
git clone https://github.com/yourusername/HireX.git
cd HireX
```
 **Frontend**  
```bash
cd frontend/
npm install --legacy-peer-deps
npm run dev
```
 **Backend**  
```bash
cd ai-backend/
pip install -r requirements.txt
python app.py
```


## 📢 Future Enhancements  

🚀 **Multi-Language Resume Parsing** – Expanding to global hiring markets.  
🔍 **Deep Fake Detection** – AI-powered fraud detection for resume verification.  
⚡ **Enhanced Speed & Scaling** – Optimized for **1M+ resumes/month** processing.  

---

## 🤝 Contributing  

Contributions are welcome! Feel free to submit issues and pull requests.  

---

## 📜 License  

This project is licensed under the **MIT License**.  
