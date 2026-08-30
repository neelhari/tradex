import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  ScanFace, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const FaceRegistrationModal: React.FC = () => {
  const { 
    isFaceRegistrationModalOpen, 
    setIsFaceRegistrationModalOpen, 
    faceRegistrationEmployee,
    profile,
    registerFaceBiometric
  } = useApp();

  const targetEmpId = faceRegistrationEmployee?.id || profile.id;
  const targetEmpName = faceRegistrationEmployee?.name || profile.name;

  const [streamActive, setStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isFaceRegistrationModalOpen && !capturedPhoto) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isFaceRegistrationModalOpen, capturedPhoto]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
      } else {
        setCameraError('Webcam not supported on this browser device.');
      }
    } catch {
      setCameraError('Unable to access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && streamActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    } else {
      // Fallback synthetic photo if camera not accessible
      const syntheticPhoto = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`;
      setCapturedPhoto(syntheticPhoto);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleEnrollAndSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      registerFaceBiometric(targetEmpId, targetEmpName, capturedPhoto || '');
      setIsProcessing(false);
      setIsFaceRegistrationModalOpen(false);
      setCapturedPhoto(null);
    }, 800);
  };

  if (!isFaceRegistrationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#00C9A7] border border-teal-500/30 flex items-center justify-center">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Face Biometric Enrollment
                <span className="text-[10px] bg-teal-500/30 text-teal-300 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">AI Vision</span>
              </h3>
              <p className="text-xs text-slate-400">Register employee face for automatic daily attendance</p>
            </div>
          </div>
          <button 
            onClick={() => { stopCamera(); setIsFaceRegistrationModalOpen(false); }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 text-slate-800 text-xs sm:text-sm">
          
          {/* Target Employee Info Banner */}
          <div className="flex items-center justify-between p-3 bg-teal-50/60 border border-teal-200/80 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Target Profile</span>
              <h4 className="font-bold text-slate-800 text-sm">{targetEmpName}</h4>
            </div>
            <span className="text-[11px] font-mono font-bold bg-white border border-teal-300 text-teal-800 px-2.5 py-1 rounded-lg">
              {targetEmpId}
            </span>
          </div>

          {/* Camera Viewfinder / Photo Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 aspect-video flex items-center justify-center shadow-inner">
            
            {capturedPhoto ? (
              <div className="relative w-full h-full">
                <img 
                  src={capturedPhoto} 
                  alt="Captured Profile" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Face Registered
                </div>
              </div>
            ) : streamActive ? (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Facial scanning guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-44 h-44 border-2 border-dashed border-[#00C9A7]/80 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-bold text-teal-300 bg-slate-950/60 px-2 py-0.5 rounded-full">
                      Align Face in Circle
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 space-y-2">
                <ScanFace className="w-12 h-12 text-slate-500 mx-auto animate-bounce" />
                <p className="text-xs text-slate-300 font-medium">
                  {cameraError || 'Initializing Camera Feed...'}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600 text-[11px]">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Biometric Liveness Verification Instructions:
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
              <li>Ensure good frontal lighting with no heavy shadows.</li>
              <li>Look directly into the camera lens with a neutral expression.</li>
              <li>Captured biometric model will be used to verify daily attendance.</li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => { stopCamera(); setIsFaceRegistrationModalOpen(false); }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-xs"
          >
            Cancel
          </button>
          
          {capturedPhoto ? (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={handleRetake}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleEnrollAndSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-md transition-all text-xs flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enrolling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Confirm & Enroll Face ID
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={captureSnapshot}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all text-xs ml-auto"
            >
              <Camera className="w-4 h-4" />
              Capture Reference Photo
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
