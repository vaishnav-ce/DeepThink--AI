# 👁️ DEEPTHINK

> "DEEPTHINK: A Multi-Modal Forensic Engine for the Detection of Generative Media."

DeepThink is an advanced, production-ready full-stack detection system built to identify AI-generated media (Deepfakes) across multiple modalities: **Images**, **Video**, and **Audio**. An AI-powered web application that analyzes uploaded images and predicts whether they are AI-generated or authentic.

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
- **Backend**: Node.js, Express, Axios, Firebase Admin( Future Update)
- **AI Service**: Python, Flask, OpenCV, NumPy, Hugging Face Transformers
- **Auth & Database**: Google Firebase (Firestore + Auth)[ FUTURE UPGRADE]
## Architecture

Frontend(Vercel)
↓
Node Backend(Render)
↓
Python AI Service(Render)

##  Current Status
The frontend and backend are fully deployed.
The AI service works locally. Public deployment of the transformer model requires more memory than Render's free tier provides.
This is a hosting limitation rather than an application bug.
## 🚀Future Improvements

- Video detection
- Audio detection
- Smaller inference model
- Higher-memory AI deployment
## Screenshots

<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230329.png?raw=true" alt="Screenshot" width="500">
<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230350.png?raw=true" alt="Screenshot" width="500">
<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230420.png?raw=true" alt="Screenshot" width="500">
