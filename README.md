# Sonar: Stop Guessing. Start Knowing.

[![Event - 3rd Hackathon](https://img.shields.io/badge/Event-3rd%20Hackathon-blue)](https://...link-to-event...)
[![Track - SAP Corporate Challenge](https://img.shields.io/badge/Track-SAP%20Corporate%20Challenge-yellow)](https://...link-to-challenge...)

[cite_start]**Sonar** is an AI system that unlocks your team's hidden potential[cite: 3]. [cite_start]This project is a submission for the **3rd Hackathon** in the **SAP Corporate Challenge**[cite: 5].

---

## 🚀 The "Wasted Potential" Problem

[cite_start]Your best skills aren't on your CV[cite: 7]. [cite_start]They are "buried" in GitHub commits, "scattered" across project feedback, and "hidden" within LinkedIn posts[cite: 8].

For individuals, this is frustrating. [cite_start]For companies, it represents a massive waste of potential and millions in untapped productivity[cite: 9].

## 💡 The Solution: Meet Sonar

[cite_start]**Sonar** is an AI system that answers the question, "What am I *truly* good at?"[cite: 14].

[cite_start]It builds a dynamic, validated skill profile by connecting to the sources where real work happens, transforming scattered data into actionable intelligence[cite: 15].

## ✨ Core Features

[cite_start]Our system is built on an "Evidence Trail" that validates skills with proof[cite: 17].

1.  [cite_start]**Connect:** Users link data sources like **GitHub** (for real-time repository analysis [cite: 31][cite_start]) and upload **CVs** (for professional experience validation [cite: 33]).
2.  [cite_start]**Aggregate:** Our AI maps thousands of data points (e.g., "Project Management" and "project-mgmt") into a unified, standardized Skill Framework[cite: 22, 23].
3.  [cite_start]**Validate:** Instead of just listing "Python," Sonar provides a **Confidence Score** and an **Evidence Trail**, showing exactly how and where proficiency was demonstrated[cite: 26].
4.  [cite_start]**Job Matcher:** Instantly compares the validated skill profile against job requirements, identifying skill gaps and turning abstract potential into concrete career pathways[cite: 38].

## 🛠️ Tech Stack

* **Frontend:** Lovable.dev (generating React & Tailwind CSS)
* **Backend:** Python (FastAPI)
* **Data & AI:** Public GitHub API, PDF parsing, and a custom logic aggregation pipeline.

## 🏃‍♂️ How to Run (Local Setup)

### Backend (Python/FastAPI)

1.  Clone the repository:
    ```bash
    git clone [https://github.com/lucassgonz/sonar.git](https://github.com/lucassgonz/sonar.git)
    cd sonar/backend
    ```
2.  Create a virtual environment and install dependencies:
    ```bash
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The server will be running on `http://127.0.0.1:8000`

### Frontend (React/Lovable)

1.  Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm start
    ```
    The app will be accessible at `http://localhost:3000`

## 👥 The Team

* [cite_start]Abdul Rehman Afroze [cite: 4]
* [cite_start]Lucas Gonzaga [cite: 4]
* [cite_start]Imran Matin [cite: 4]
* [cite_start]Ayanfeoluwa [cite: 4]

---

## 📄 License

This project is licensed under the MIT License.
