import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Camera, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const FaceIdScannerModal: React.FC = () => {
  const { isFaceIdModalOpen, setIsFaceIdModalOpen, profile, simulateFaceIdCheckIn, simulateFaceIdCheckOut } = useApp();
  const [scanningState, setScanningState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS'>('IDLE');
  const [stepText, setStepText] = useState('Align your face inside the frame');

  useEffect(() => {
    if (isFaceIdModalOpen) {
      setScanningState('IDLE');
      setStepText('Align your face inside the frame');
    }
  }, [isFaceIdModalOpen]);

  if (!isFaceIdModalOpen) return null;

  const handleStartScan = () => {
    setScanningState('SCANNING');
    setStepText('Checking liveness... Look straight');

    setTimeout(() => {
      setStepText('Matching biometric data with HR records...');
    }, 1200);

    setTimeout(() => {
      setScanningState('SUCCESS');
      setStepText('Face Verified Successfully!');
      simulateFaceIdCheckIn();
      setTimeout(() => {
        setIsFaceIdModalOpen(false);
      }, 1500);
    }, 2400);
  };

  const handleCheckOut = () => {
    simulateFaceIdCheckOut();
    setIsFaceIdModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6FAF6] flex items-center justify-center text-[#00C9A7]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0A2540]">Biometric Face Attendance</h3>
              <p className="text-xs text-slate-500">AI Liveness Detection • Secure Check-In</p>
            </div>
          </div>
          <button
            onClick={() => setIsFaceIdModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Simulator Box */}
        <div className="relative my-5 aspect-[4/3] bg-[#0A2540] rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-inner border-2 border-dashed border-[#00C9A7]/40">
          
          {/* Face Oval Guide */}
          <div className={`w-36 h-48 rounded-[50%] border-2 transition-all duration-300 flex items-center justify-center relative ${
            scanningState === 'SCANNING' ? 'border-[#00C9A7] shadow-[0_0_20px_#00C9A7]' :
            scanningState === 'SUCCESS' ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/40'
          }`}>
            {scanningState === 'IDLE' && (
              <div className="text-center text-white/70">
                <span className="text-3xl block mb-1">👤</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{profile.name}</span>
              </div>
            )}

            {scanningState === 'SCANNING' && (
              <div className="absolute inset-x-0 top-0 h-1 bg-[#00C9A7] shadow-[0_0_12px_#00C9A7] animate-bounce" />
            )}

            {scanningState === 'SUCCESS' && (
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-scale" />
            )}
          </div>

          {/* Prompt banner inside camera */}
          <div className="absolute bottom-3 inset-x-3 bg-black/60 backdrop-blur-md rounded-xl py-2 px-3 text-center">
            <span className="text-xs font-bold text-white tracking-wide">{stepText}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          {scanningState === 'IDLE' && (
            <>
              <button
                onClick={handleStartScan}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00C9A7] to-[#00B4D8] text-[#0A2540] font-display font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[#00C9A7]/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Face & Check-In</span>
              </button>

              {profile.faceIdStatus === 'VERIFIED_PRESENT' && (
                <button
                  onClick={handleCheckOut}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold text-xs transition-all"
                >
                  Clock Out / End Day Shift
                </button>
              )}
            </>
          )}

          {scanningState === 'SCANNING' && (
            <div className="py-3 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00C9A7]" />
              <span>Verifying biometric face landmarks...</span>
            </div>
          )}

          {scanningState === 'SUCCESS' && (
            <div className="py-3 text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Attendance Recorded for Today!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
