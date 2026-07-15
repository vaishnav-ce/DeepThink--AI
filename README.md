# 👁️ DeepThink AI

> **DeepThink** is a multi-modal forensic engine for detecting AI-generated media.

DeepThink is a full-stack web application that analyzes uploaded **images**, **videos**, and **audio** and predicts whether media is likely authentic or AI-generated.

🔗 **Live demo:** https://deep-think-ai-six.vercel.app/

> Note: The public AI service can be unstable on free-tier Render due to memory limits.

---

## ✨ Features

- Multi-modal upload support (`jpg`, `png`, `webp`, `mp4`, `avi`, `mov`, `wav`, `mp3`)
- Real-time forensic analysis with confidence scores
- Interactive “Binary Pupil” scanning UI
- Image manipulation heatmap overlay
- PDF report export
- Optional upload history integration with Firebase/Firestore

---

## 🧱 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Multer, Axios
- **AI Service:** Python, Flask, OpenCV, NumPy, Torch, Transformers, Librosa
- **Auth/DB (optional):** Firebase Auth + Firestore

---

## 🏗️ Architecture

Frontend (Vercel)
↓
Node.js API (Render/local)
↓
Python AI Service (Render/local)

---

## 📁 Repository Structure

- `/client` — React frontend
- `/server` — Express API + upload/history routes
- `/ai-service` — Flask AI inference service

---

## 🚀 Quick Start (Local)

### 1) Prerequisites

- Node.js 18+
- npm
- Python 3.10+
- pip

### 2) Clone and install

```bash
git clone https://github.com/vaishnav-ce/DeepThink--AI.git
cd DeepThink--AI

cd client && npm install
cd ../server && npm install
cd ../ai-service && pip install -r requirements.txt
```

### 3) Environment setup

Create environment files:

- `/client/.env`
- `/server/.env`

Client (`/client/.env`) example:

```env
VITE_API_URL=http://localhost:5005/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Server (`/server/.env`) minimal example:

```env
PORT=5005
AI_SERVICE_URL=http://127.0.0.1:5001/analyze

# Optional Firebase Admin configuration
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=
```

### 4) Run services

Run each service in a separate terminal:

```bash
# Terminal 1
cd ai-service
python app.py

# Terminal 2
cd server
npm start

# Terminal 3
cd client
npm run dev
```

Frontend default URL: `http://localhost:5173`

---

## 🔌 API Endpoints

### Backend (`/server`)

- `GET /` — health check
- `POST /api/upload` — upload file for AI analysis
- `GET /api/history/:uid` — fetch user upload history

### AI Service (`/ai-service`)

- `GET /` — service status
- `POST /analyze` — analyze uploaded media file

---

## 🛠️ Troubleshooting

- **AI service fails on Render free tier:** model memory usage can exceed free limits.
- **Slow first request:** model warm-up may take time.
- **No Firestore history:** set Firebase Admin environment variables in `/server/.env`.

---

## 🗺️ Roadmap

- Improve production deployment for heavier models
- Expand and tune video/audio detection accuracy
- Optimize model size and startup latency

---

## 📸 Screenshots

<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230329.png?raw=true" alt="Screenshot 1" width="500">
<br>
<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230350.png?raw=true" alt="Screenshot 2" width="500">
<br>
<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230420.png?raw=true" alt="Screenshot 3" width="500">
