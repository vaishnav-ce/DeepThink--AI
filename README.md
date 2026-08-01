# 👁️ DeepThink AI

**A Full-Stack Forensic Media Analysis Platform for Exploring AI-Generated and Manipulated Media**

DeepThink AI is a full-stack forensic analysis project that explores how machine learning, computer vision, and digital forensics can be combined to analyze media for signals associated with AI-generated or manipulated content.

The project currently focuses primarily on image analysis, with a modular architecture designed to expand toward video and audio analysis.

## 🔗 Live Application

**Web App:** https://deep-think-ai-six.vercel.app/

> ⚠️ **Deployment Note:** The frontend and backend are publicly deployed. The transformer-based AI inference service works locally, but public deployment can be limited by the memory available on the current Render free-tier environment during model initialization.

## 🧠 Project Overview

Generative AI has made it increasingly easy to create highly realistic synthetic images, voices, and videos.

DeepThink AI explores this challenge from a forensic perspective by combining machine-learning inference with image-level analysis and visual evidence.

The goal is not to treat a single model prediction as absolute proof, but to provide technical signals and visual analysis that can assist media investigation.

## ✨ Core Features

### 📸 Image Analysis

- AI-generated image classification
- Vision Transformer (ViT) model experimentation
- Image preprocessing using Python and OpenCV
- Noise and edge analysis
- Error/forensic image analysis
- Dynamic forensic heatmap visualization
- Confidence-based analysis results

### 👁️ Binary Pupil Interface

A custom cyberpunk-inspired forensic interface built with React and Framer Motion.

The interface visually represents the analysis state:

```text
⚪ IDLE
   ↓
🔵 SCANNING
   ↓
🟢 AUTHENTIC / 🔴 AI DETECTED
```

The animated pupil, scanning effects, status transitions, and visual feedback were designed to make technical analysis more intuitive and engaging.

### 🔥 Forensic Heatmaps

Image analysis can generate visual heatmaps that highlight regions containing unusual image-level patterns.

These visualizations provide additional context instead of presenting only a classification label.

### 📄 PDF Forensic Reports

The frontend supports one-click PDF report generation containing:

- Detection information
- Confidence metrics
- Technical analysis
- Visual forensic evidence
- Heatmap results

### 🧪 ML Evaluation & Benchmarking

The AI service includes a custom evaluation utility for testing image detection models against a dataset.

The evaluation workflow can generate:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix
- CSV evaluation reports

Example artifacts included in the repository:

```text
ai-service/
├── evaluate_image_detector.py
├── evaluation_report.csv
└── confusion_matrix.png
```

## 🏗️ System Architecture

DeepThink AI follows a modular full-stack architecture:

```text
                 ┌──────────────────────────┐
                 │      React Frontend      │
                 │ React + Vite + Tailwind  │
                 │      + Framer Motion     │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │     Node.js Backend      │
                 │ Express + Multer + Axios │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │    Python AI Service     │
                 │ Flask + OpenCV + NumPy   │
                 │ PyTorch + Transformers   │
                 └──────────────────────────┘
```

### Deployment Architecture

```text
React Frontend
      │
      ▼
   Vercel
      │
      ▼
Node.js / Express API
      │
      ▼
   Render
      │
      ▼
Python AI Service
```

## ⚙️ Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Dropzone
- React Hot Toast
- Lucide React
- HTML2Canvas
- jsPDF

### Backend

- Node.js
- Express.js
- Multer
- Axios
- FormData
- CORS
- dotenv
- UUID

### AI & Computer Vision

- Python
- Flask
- OpenCV
- NumPy
- Pillow
- PyTorch
- Hugging Face Transformers

### Cloud / Infrastructure

- Vercel
- Render
- Firebase integration

## 🔬 Forensic Analysis Concepts

DeepThink AI explores multiple technical signals that can contribute to synthetic-media analysis.

### Vision Transformer Analysis

Images can be passed through a transformer-based image classification pipeline to estimate the likelihood of AI-generated content.

### Error / Noise Analysis

Image-level residual and noise characteristics can be examined to identify unusual processing patterns.

### Frequency Analysis

Frequency-domain characteristics can provide additional information about image texture and high-frequency details.

### Edge Analysis

Computer-vision techniques can be used to examine image edge characteristics and structural patterns.

### Heatmap Visualization

Analysis results can be transformed into visual heatmaps to make potentially unusual regions easier to inspect.

## 📊 Model Evaluation

The repository contains an evaluation script:

`ai-service/evaluate_image_detector.py`

The utility can evaluate a detector against a test dataset and generate performance metrics and visualization artifacts.

Example outputs:

- `evaluation_report.csv`
- `confusion_matrix.png`

This evaluation workflow was included to move beyond individual demonstrations and provide a way to measure model behaviour systematically.

> **Important:** AI-generated media detection is an evolving problem. Detection results should be treated as analytical indicators rather than definitive proof of authenticity or manipulation.

## 📸 Screenshots

### 🖥️ Application Interface

<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230329.png?raw=true" alt="Application Interface" width="700">

### 🔍 Detection Analysis

<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230350.png?raw=true" alt="Detection Analysis" width="700">

### 📊 Forensic Analysis

<img src="https://github.com/vaishnav-ce/DeepThink--AI/blob/main/Screenshot%202026-07-15%20230420.png?raw=true" alt="Forensic Analysis" width="700">

## 🚀 Live Demo

**Web Application:** https://deep-think-ai-six.vercel.app/

The frontend is publicly accessible. AI inference availability may be affected by the memory limitations of the current free-tier deployment environment.

## 📁 Repository Structure

```text
DeepThink-AI/
│
├── ai-service/
│   ├── app.py
│   ├── evaluate_image_detector.py
│   ├── evaluation_report.csv
│   ├── confusion_matrix.png
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── server/
│   ├── routes/
│   │   └── ai.js
│   ├── uploads/
│   ├── firebase.js
│   ├── index.js
│   ├── test_upload.js
│   └── package.json
│
└── README.md
```

## 🎯 Potential Applications

The concepts explored in DeepThink AI could be relevant to areas such as:

- 📰 Journalism & Fact-Checking
- 🔐 Cybersecurity
- 📞 AI Voice / Vishing Protection
- ⚖️ Digital Forensics
- 📱 Synthetic Media Analysis
- 🔎 Content Moderation

These represent potential applications rather than claims of production deployment.

## 🚧 Current Status

### Implemented / Explored

- ✅ Full-stack React frontend
- ✅ Node.js / Express backend
- ✅ Python AI service
- ✅ Image analysis pipeline
- ✅ Transformer-based image detection experimentation
- ✅ Forensic visualization
- ✅ PDF report generation
- ✅ ML evaluation scripts
- ✅ Confusion matrix generation
- ✅ Public frontend deployment
- ✅ Backend deployment

### In Development / Future Extensions

- 🔄 Video deepfake analysis
- 🔄 Audio / voice deepfake analysis
- 🔄 More efficient inference models
- 🔄 GPU-based inference
- 🔄 Higher-memory AI deployment
- 🔄 Larger and more diverse evaluation datasets
- 🔄 Improved model calibration
- 🔄 Expanded Firebase / Firestore functionality
- 🔄 Authentication and persistent scan history

## 💡 Key Engineering Challenges Explored

Building DeepThink AI involved working across several layers of software engineering:

- Full-stack application architecture
- REST API development
- Microservice communication
- File upload and processing pipelines
- Computer vision
- Machine-learning inference
- Model evaluation
- Data visualization
- PDF generation
- Cloud deployment
- Frontend animation and UX
- Deployment resource constraints

One of the major deployment lessons was that AI model size and runtime memory requirements can become infrastructure constraints even when the application itself works correctly in local development.

## ⚠️ Limitations & Disclaimer

DeepThink AI is an experimental forensic analysis project.

AI-generated media detection is an evolving field, and no single model or forensic technique should be considered universally reliable.

A detection result may occasionally be incorrect, including cases where AI-generated media is classified as authentic or authentic media receives a suspicious classification.

The project is therefore intended for research, experimentation, learning, and technical demonstration, rather than as a definitive authenticity verification system.

## 🔮 Future Vision

The long-term direction of DeepThink AI is to evolve the architecture into a broader multi-modal forensic engine capable of combining:

```text
Image
  +
Video
  +
Audio
  ↓
Multi-Modal Forensic Analysis
  ↓
Visual Evidence + Technical Signals
  ↓
Explainable Investigation Report
```

## 👨‍💻 Project Focus

DeepThink AI represents an exploration of how AI engineering, full-stack development, computer vision, digital forensics, and cloud deployment can work together in a single system.

Built to explore one question:

> 👁️ **When AI can generate almost anything, how can technology help us investigate what is real?**
