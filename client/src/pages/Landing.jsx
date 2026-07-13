import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Image, FileAudio, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-dark-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark-800 to-dark-900 overflow-hidden relative">
      {/* Abstract Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-green/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px] animate-pulse-slow object-center delay-1000"></div>

      <div className="text-center z-10 px-4 mt-20 md:mt-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-sm font-semibold mb-8 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4" />
          <span>Advanced AI Detection Engine v2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-6 tracking-tight">
          Detect The <span className="text-neon-red neon-text-red">Fake</span>. <br />
          Protect The <span className="text-neon-blue neon-text-blue">Truth</span>.
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Upload images, video, or audio. Our sophisticated AI models analyze artifacts, 
          inconsistencies, and digital footprints to determine authenticity with military-grade precision.
        </p>

        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-neon-green text-dark-900 hover:bg-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,136,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]"
        >
          Start Scanning Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full px-4 mb-20 z-10">
        <FeatureCard 
          icon={<Image className="w-10 h-10 text-neon-blue inline-block mb-4" />}
          title="Image Artifact Analysis"
          description="Detects localized blurring, invisible edge inconsistencies, and manipulation artifacts typically left by GANs."
        />
        <FeatureCard 
          icon={<Video className="w-10 h-10 text-neon-red inline-block mb-4" />}
          title="Video Face Tracking"
          description="Analyzes face-mapping boundaries, pixel consistency, and temporal anomalies across frames."
        />
        <FeatureCard 
          icon={<FileAudio className="w-10 h-10 text-neon-green inline-block mb-4" />}
          title="Audio Deepfake Detection"
          description="Monitors spectrographic inconsistencies and digital voice cloning footprints in audio waveforms."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-card p-8 rounded-2xl text-center group hover:border-white/20 transition-all hover:transform hover:-translate-y-2">
      {icon}
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
