import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCheckInCapture } from '../../hooks/useCheckInCapture';
import { X, Camera, CheckCircle2, MapPin, AlertTriangle, LogOut } from 'lucide-react';

export const FaceIdScannerModal: React.FC = () => {
  const {
    isFaceIdModalOpen,
    setIsFaceIdModalOpen,
    profile,
    recordCheckIn,
    recordCheckOut,
  } = useApp();

  const { videoRef, isCameraOn, cameraError, startCamera, stopCamera, capture } = useCheckInCapture();

  const [phase, setPhase] = useState<'IDLE' | 'CAPTURING' | 'DONE'>('IDLE');
  const [note, setNote] = useState<string | null>(null);

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

  const handleCheckIn = async () => {
    setPhase('CAPTURING');
    setNote(null);

    const result = await capture();

    // A refused camera or location never blocks the check-in; it is recorded
    // as not shared so Admin can follow it up.
    await recordCheckIn({
      photo: result.photo,
      latitude: result.latitude,
      longitude: result.longitude,
    });

    setNote(result.locationError);
    setPhase('DONE');
    stopCamera();
    setTimeout(close, result.locationError ? 2600 : 1500);
  };

  const handleCheckOut = async () => {
    setPhase('CAPTURING');
    setNote(null);
    const result = await capture();
    await recordCheckOut({
      photo: result.photo,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setNote(result.locationError);
    setPhase('DONE');
    stopCamera();
    setTimeout(close, result.locationError ? 2600 : 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6FAF6] flex items-center justify-center text-[#00C9A7]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0A2540]">Check in</h3>
              <p className="text-xs text-slate-500">A photo and your location are recorded</p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live camera */}
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
            <div className="absolute inset-6 border-2 border-dashed border-[#00C9A7]/70 rounded-[28px] pointer-events-none" />
          )}

          {phase === 'DONE' && (
            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center gap-2 text-white">
              <CheckCircle2 className="w-10 h-10" />
              <span className="font-display font-black text-sm">Checked in</span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-center mb-4">
          <p className="text-xs font-semibold text-slate-600">
            {phase === 'IDLE' && 'Look at the camera, then tap Check in.'}
            {phase === 'CAPTURING' && 'Taking your photo and reading your location…'}
            {phase === 'DONE' && `Recorded for ${profile.name || 'you'}.`}
          </p>

          {note && (
            <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5 justify-center">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{note} Your check-in was still recorded.</span>
            </p>
          )}

          {phase === 'IDLE' && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
              <MapPin className="w-3 h-3" />
              <span>Your browser will ask permission for the camera and location.</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCheckIn}
            disabled={phase !== 'IDLE'}
            className="w-full py-3.5 rounded-2xl bg-[#00C9A7] hover:bg-[#00B4D8] disabled:bg-slate-200 disabled:text-slate-400 text-[#0A2540] font-black text-sm shadow-lg shadow-[#00C9A7]/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5" />
            <span>{phase === 'CAPTURING' ? 'Recording…' : 'Check in'}</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={phase !== 'IDLE'}
            className="w-full py-3 rounded-2xl border border-slate-200 disabled:opacity-50 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Check out instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
