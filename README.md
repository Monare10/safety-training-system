# 🦺 Site Safety Training & Compliance System

A full-stack web application designed for **Monare Constructions** to manage mandatory role-based safety training, track video progress, administer timed assessments, and issue digital compliance certificates to workers.

## 🚀 Live Deployment
- **Frontend:**https://safety-training-system-two.vercel.app/register
- **Backend API:** [https://safety-training-system-xi4f.onrender.com/docs](https://safety-training-system-xi4f.onrender.com/docs) *(Replace with your actual Render URL)*

---

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for `Admin` and `Worker`.
- **Anti-Skip Video Training:** Custom HTML5 player integrated with the YouTube Iframe API. Workers cannot skip ahead; the backend validates progress in real-time.
- **Timed Assessments:** Auto-scored multiple-choice quizzes that unlock only after watching 90% of the training video.
- **Automated PDF Certificates:** Generates a branded, landscape A4 PDF certificate upon passing, complete with a unique serial number and a 1-year expiry date.
- **Admin Compliance Dashboard:** Real-time analytics on site eligibility, per-course completion rates, and alerts for expiring certificates.
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Material UI (MUI), React Router, Axios |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) & Passlib (bcrypt) |
| **PDF Gen** | ReportLab |
| **Deployment** | Vercel (Frontend), Render (Backend & DB) |

---

## 💻 Local Development Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Monare10/safety-training-system.git
cd safety-training-system
