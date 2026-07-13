import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertOctagon, Activity, FileText, Image as ImageIcon, Video, Mic, RefreshCw, X, Download } from 'lucide-react';
import BinaryPupil from '../components/BinaryPupilLogo';
import toast, { Toaster } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history/anonymous`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);
      
      const fileType = selectedFile.type;
      if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav']
    },
    maxFiles: 1
  });

  const clearSelection = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);
    const loadingToast = toast.loading('Initiating Neural Network...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', 'anonymous');

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      if (res.data.result === 'Deepfake') {
          toast.error('Deepfake Detected!', { id: loadingToast });
      } else {
          toast.success('Appears Authentic!', { id: loadingToast });
      }
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to analyze the file. Service might be down.');
      toast.error('Analysis failed', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const input = reportRef.current;
    if (!input) return;
    
    const pdfToast = toast.loading('Generating PDF...');
    try {
      // Small delay to ensure any images are fully loaded and CSS is settled
      await new Promise(resolve => setTimeout(resolve, 300));
      const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#0a0a0a', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DeepDetect_Report_${new Date().getTime()}.pdf`);
      toast.success('Report downloaded!', { id: pdfToast });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error('Failed to generate PDF', { id: pdfToast });
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <FileText className="w-8 h-8 text-gray-400" />;
    if (type.startsWith('image')) return <ImageIcon className="w-8 h-8 text-neon-blue" />;
    if (type.startsWith('video')) return <Video className="w-8 h-8 text-neon-red" />;
    if (type.startsWith('audio')) return <Mic className="w-8 h-8 text-neon-green" />;
    return <FileText className="w-8 h-8 text-gray-400" />;
  };

  const getStatus = () => {
    if (loading) return 'scanning';
    if (result) {
      return result.result === 'Deepfake' ? 'ai' : 'human';
    }
    return 'idle';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <div className="mb-8 flex items-center justify-between bg-dark-800/50 p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-widest mb-2">DEEP<span className="text-neon-blue neon-text-blue">THINK</span> <span className="text-gray-500 font-normal">TERMINAL</span></h1>
          <p className="text-gray-400 text-lg">A Multi-Modal Forensic Engine for the Detection of Generative Media.</p>
        </div>
        <div className="hidden md:block">
           <BinaryPupil status={getStatus()} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            {...getRootProps()} 
            className={`glass-card p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative ${
              isDragActive ? 'border-neon-blue bg-neon-blue/5' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="flex flex-col items-center">
                <button 
                  onClick={clearSelection}
                  className="absolute top-4 right-4 p-1 bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {preview ? (
                  <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-white/10">
                    {file.type.startsWith('image/') ? (
                      <img src={preview} alt="Preview" className="w-full h-auto object-cover" />
                    ) : (
                      <video src={preview} className="w-full h-auto object-cover" controls />
                    )}
                  </div>
                ) : (
                  <div className="p-8 bg-dark-700/50 rounded-full">
                    {getFileIcon(file.type)}
                  </div>
                )}
                <div className="mt-4 font-medium text-white">{file.name}</div>
                <div className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center">
                <UploadCloud className={`w-16 h-16 mb-4 ${isDragActive ? 'text-neon-blue animate-bounce' : 'text-gray-500'}`} />
                <p className="text-lg text-white font-medium">Drag & drop your file here</p>
                <p className="text-sm text-gray-400 mt-2">Supports Image (JPG, PNG), Video (MP4), Audio (WAV, MP3)</p>
                <div className="mt-6 px-4 py-2 bg-dark-700 rounded-lg text-sm text-white font-medium border border-white/5 hover:bg-dark-700/80">
                  Browse Files
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              !file || loading 
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed' 
                : 'bg-neon-blue text-dark-900 hover:bg-white shadow-[0_0_15px_rgba(0,229,255,0.4)] transform hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Processing via Neural Network...
              </>
            ) : (
              <>
                <Activity className="w-6 h-6" />
                Initiate Analysis
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Results Card */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div ref={reportRef} className="bg-dark-900 pb-2">
                <div className={`p-6 border-b border-white/5 ${result.result === 'Deepfake' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Scan Result
                      {result.result === 'Deepfake' ? (
                        <span className="px-3 py-1 bg-red-500/20 text-neon-red text-sm rounded-full border border-red-500/30 flex items-center shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                          <AlertOctagon className="w-4 h-4 mr-1" />
                          AI GENERATED
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/20 text-neon-green text-sm rounded-full border border-green-500/30 flex items-center shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          REAL MEDIA
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Confidence Score</span>
                      <span className="text-white font-bold">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <div className="h-3 w-full bg-dark-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${result.result === 'Deepfake' ? 'bg-neon-red shadow-[0_0_10px_rgba(255,0,85,0.8)]' : 'bg-neon-green shadow-[0_0_10px_rgba(0,255,136,0.8)]'}`}
                      ></motion.div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Analysis Description</h4>
                    <p className="text-gray-200 bg-dark-800 p-4 rounded-lg font-mono text-sm border border-white/5 whitespace-pre-line">
                      {result.result === 'Deepfake' 
                        ? `STATUS: Likely AI-Generated or Manipulated. TECHNICAL DETAILS: ${result.reason || "Synthetic features matched trained patterns."}` 
                        : `STATUS: Likely Authentic Real Media. TECHNICAL DETAILS: ${result.reason || "Analysis completed successfully. Features matched natural patterns."}`
                      }
                    </p>
                  </div>

                  {result.heatmap && file.type.startsWith('image/') && (
                    <div className="mt-6">
                      <h4 className="text-sm text-gray-400 mb-2">Manipulation Heatmap</h4>
                      <div className="rounded-lg overflow-hidden border border-white/5 bg-black flex justify-center">
                        <img src={result.heatmap} alt="AI Heatmap" className="w-full max-h-64 object-contain" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">Highlighted areas indicate detected synthetic noise anomalies</p>
                    </div>
                  )}
                </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-dark-800/30">
                  <button
                    onClick={downloadPDF}
                    className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-dark-700 text-white hover:bg-dark-600 transition-colors border border-white/10"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Section */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl h-full flex flex-col border border-white/5">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-blue" />
                Scan History
              </h3>
            </div>
            <div className="p-5 flex-1 overflow-y-auto max-h-[600px] space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No previous scans found.</p>
              ) : (
                history.map((item, idx) => (
                  <div key={item.id || idx} className="bg-dark-800/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300 truncate w-3/4" title={item.fileName}>
                        {item.fileName}
                      </span>
                      {item.result === 'Deepfake' ? (
                        <span className="w-2 h-2 rounded-full bg-neon-red shadow-[0_0_5px_rgba(255,0,85,0.8)]" title="Deepfake"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,136,0.8)]" title="Real"></span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>{Math.round(item.confidence * 100)}% Match</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
