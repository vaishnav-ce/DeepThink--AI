# 👁️ DEEPTHINK

> "DEEPTHINK: A Multi-Modal Forensic Engine for the Detection of Generative Media."

DeepThink is an advanced, production-ready full-stack detection system built to identify AI-generated media (Deepfakes) across multiple modalities: **Images**, **Video**, and **Audio**.

![DeepThink Dashboard](./assets/dashboard-preview.png)

## 🧠 Core Features

1. **Multi-Modal Uploads**: 
   Inspect media formats ranging from `jpg`, `png` to `mp4` and `wav`/`mp3`.
   
2. **Real-time Technical Analysis**: 
   Leveraging a lightweight Python heuristic model (Laplacian variance, edge analysis, noise mapping), the system yields confidence scores immediately. 
   
3. **Interactive "Binary Pupil" UI**: 
   A sleek, neon-clad forensic terminal interface. While scanning, the AI's "pupil" surveys the file using a cyan laser. Passing results turn it Authentic Green, while detecting generative artifacts causes it to violently glitch Red.

4. **Forensic "Manipulation Heatmap"**: 
   For images, the system automatically runs an anomaly isolation pass across the noise domain, highlighting potential artifact borders directly under the technical analysis results. 
   
5. **Report Generation**: 
   Single-click PDF download capabilities capturing all metadata, confidence scores, reasons, and heatmaps for professional record-keeping. 

6. **Cloud Scan History (Firestore, Future Update)**: 
   Automatically ties historical uploads and their verdicts back to user accounts using Firebase Authentication and Firestore Database integration.

## ⚙️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite, Framer Motion, HTML2Canvas, jsPDF
- **Backend**: Node.js, Express, Axios, Firebase Admin
- **AI Service**: Python, Flask, OpenCV, NumPy
- **Auth & Database**: Google Firebase (Firestore + Auth)

## 🚀 Quick Start

Ensure you have Node.js and Python installed.

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/deepthink.git
cd deepthink
```

**2. Start the Python AI Service**
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors werkzeug opencv-python numpy
python app.py
```
*(Runs on Port 5001)*

**3. Start the Node.js Node Server**
```bash
cd server
npm install
PORT=5005 node index.js
```
*(Runs on Port 5005 - ensure you have placed `firebase-service-account.json` inside the config folder!)*

**4. Start the React UI**
```bash
cd client
npm install
npm run dev
```
*(Runs on Port 5173)*

Open `http://localhost:5173` in your browser. Upload, intercept, and detect generative media.
