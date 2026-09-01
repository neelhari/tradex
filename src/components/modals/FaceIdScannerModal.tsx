import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCheckInCapture } from '../../hooks/useCheckInCapture';
import { X, Camera, CheckCircle2, MapPin, AlertTriangle, LogOut } from 'lucide-react';

export const FaceIdScannerModal: React.FC = () => {
  const {
    isFaceIdModalOpen,
    setIsFaceIdModalOpen,
    faceIdModalMode,
    profile,
    recordCheckIn,
    recordCheckOut,
  } = useApp();

  const { videoRef, isCameraOn, cameraError, startCamera, stopCamera, capture } = useCheckInCapture();

  const [phase, setPhase] = useState<'IDLE' | 'CAPTURING' | 'DONE'>('IDLE');
  const [note, setNote] = useState<string | null>(null);

  const isCheckOut = faceIdModalMode === 'CHECK_OUT';

  useEffect(() => {
    if (isFaceIdModalOpen) {
      setPhase('IDLE');
      setNote(null);
      void startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isFaceIdModalOpen, startCamera, stopCamera]);

  if (!isFaceIdModalOpen) return null;

  const close = () => {
    stopCamera();
    setIsFaceIdModalOpen(false);
  };

  const handleCapture = async () => {
    setPhase('CAPTURING');
    setNote(null);

    const result = await capture();

    if (isCheckOut) {
      await recordCheckOut({
        photo: result.photo,
        latitude: result.latitude,
        longitude: result.longitude,
      });
    } else {
      await recordCheckIn({
        photo: result.photo,
        latitude: result.latitude,
        longitude: result.longitude,
      });
    }

    setNote(result.locationError);
    setPhase('DONE');
    stopCamera();
    setTimeout(close, result.locationError ? 2400 : 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isCheckOut ? 'bg-rose-50 text-rose-600' : 'bg-[#E6FAF6] text-[#00C9A7]'}`}>
              {isCheckOut ? <LogOut className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-display font-black text-base text-[#0A2540]">
                {isCheckOut ? 'Face ID Punch Out' : 'Face ID Punch In'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isCheckOut ? 'Verify face to end your shift' : 'Verify face & GPS location to begin shift'}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live camera view */}
        <div className="my-5 relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraOn ? '' : 'opacity-0'}`}
          />

          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <Camera className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-300 font-semibold">
                {cameraError || 'Starting camera…'}
              </p>
              {cameraError && (
                <button
                  onClick={() => void startCamera()}
                  className="mt-1 text-[11px] font-bold text-[#00C9A7] underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {isCameraOn && phase === 'IDLE' && (
            <div className={`absolute inset-6 border-2 border-dashed ${isCheckOut ? 'border-rose-400/70' : 'border-[#00C9A7]/70'} rounded-[28px] pointer-events-none animate-pulse`} />
          )}

          {phase === 'DONE' && (
            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center gap-2 text-white animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12" />
              <span className="font-display font-black text-base">
                {isCheckOut ? 'Punched Out Successfully' : 'Punched In Successfully'}
              </span>
              <span className="text-xs text-emerald-100 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-center mb-4">
          <p className="text-xs font-semibold text-slate-600">
            {phase === 'IDLE' && `Look directly at the camera, then tap ${isCheckOut ? 'Punch Out' : 'Punch In'}.`}
            {phase === 'CAPTURING' && 'Verifying face and recording location…'}
            {phase === 'DONE' && `Attendance recorded for ${profile.name || 'you'}.`}
          </p>

          {note && (
            <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5 justify-center">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{note} Your punch was still recorded.</span>
            </p>
          )}

          {phase === 'IDLE' && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Geo-tagging and face photo sent securely to Admin.</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleCapture}
            disabled={phase !== 'IDLE'}
            className={`w-full py-3.5 rounded-2xl font-display font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 ${
              isCheckOut
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] shadow-[#00C9A7]/25'
            }`}
          >
            {isCheckOut ? <LogOut className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            <span>
              {phase === 'CAPTURING'
                ? 'Verifying…'
                : isCheckOut
                ? 'Scan Face & Punch Out'
                : 'Scan Face & Punch In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
