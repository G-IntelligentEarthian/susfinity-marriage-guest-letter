import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (blob: Blob, dataUrl: string) => void;
  initialPhotoUrl: string | null;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  initialPhotoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [flashActive, setFlashActive] = useState(false);

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setIsWarmingUp(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
    } finally {
      setIsWarmingUp(false);
    }
  };

  useEffect(() => {
    if (!capturedPhotoUrl) {
      startCamera();
    }
    return () => stopCamera();
  }, [capturedPhotoUrl]);

  // Capture current stream frame
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    // Trigger flash animation
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror horizontal when capturing front camera
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, width, height);
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply a warm romantic ambient overlay filter directly onto the snapshot!
    ctx.fillStyle = 'rgba(235, 195, 140, 0.08)'; // Champagne warmth
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(123, 144, 118, 0.03)'; // Soft Sage tinge
    ctx.fillRect(0, 0, width, height);

    // Convert to blob and save
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCapturedPhotoUrl(url);
        onCapture(blob, url);
        stopCamera();
      }
    }, 'image/jpeg', 0.85);
  };

  // Retake photo
  const retake = () => {
    setCapturedPhotoUrl(null);
    onCapture(null as any, null as any); // Reset draft
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      
      {/* Visual Camera Booth Frame */}
      <div className="relative w-full aspect-3/4 max-w-[380px] bg-neutral-900 rounded-2xl overflow-hidden border-4 border-[#fffdf9] shadow-[-6px_10px_28px_rgba(47,58,49,0.15)] flex flex-col justify-center items-center">
        
        {/* Flash overlay animation */}
        <AnimatePresence>
          {flashActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
              style={{ mixBlendMode: 'overlay' }}
            />
          )}
        </AnimatePresence>

        {capturedPhotoUrl ? (
          /* PREVIEW STAGE */
          <div className="relative w-full h-full">
            <img 
              src={capturedPhotoUrl} 
              alt="Captured Portrait Preview" 
              className="w-full h-full object-cover"
            />
            {/* Stamp filter sticker */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xs text-[#7b9076] border border-[#7b9076]/30 text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Portrait Logged</span>
            </div>
          </div>
        ) : hasPermission === false ? (
          /* DENIED PERMISSION STAGE */
          <div className="p-6 text-center max-w-[280px]">
            <AlertCircle className="w-12 h-12 text-[#b87d5f] mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-white mb-2">Camera Blocked</h3>
            <p className="font-sans text-xs text-neutral-400 leading-relaxed">
              We need camera access to attach your selfie alongside your wish letter. 
              Please grant camera permission in your browser or iframe context.
            </p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-1.5 rounded-full border border-neutral-600 hover:border-white text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* ACTIVE STREAM STAGE */
          <div className="relative w-full h-full">
            {isWarmingUp && (
              <div className="absolute inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 text-[#7b9076] animate-spin" />
                <span className="font-sans text-xs text-neutral-400">Opening secure lens...</span>
              </div>
            )}
            <video
              ref={videoRef}
              playsInline
              autoplay
              muted
              className="w-full h-full object-cover scale-x-[-1]" // mirror for live view
            />
            {/* Guide grid lines for portrait */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none z-10">
              <div className="absolute inset-y-0 left-1/3 w-[1px] border-l border-white/10 border-dashed" />
              <div className="absolute inset-y-0 right-1/3 w-[1px] border-l border-white/10 border-dashed" />
              <div className="absolute inset-x-0 top-1/3 h-[1px] border-t border-white/10 border-dashed" />
              <div className="absolute inset-x-0 bottom-1/3 h-[1px] border-t border-white/10 border-dashed" />
            </div>

            {/* Live capture overlay pill */}
            <div className="absolute top-4 left-4 bg-[#7b9076] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white block" />
              <span>Camera Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls panel */}
      <div className="flex gap-4 w-full max-w-[340px]">
        {capturedPhotoUrl ? (
          <button
            type="button"
            onClick={retake}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-sans font-bold tracking-wider text-[#b87d5f] hover:bg-[#ede4d0] border border-[#b87d5f]/30 transition-all cursor-pointer outline-none"
          >
            <RefreshCw className="w-4 h-4 animate-reverse" />
            <span>RETAKE PHOTO</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={hasPermission === false || isWarmingUp}
            onClick={capturePhoto}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white text-xs font-bold tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed shadow-md scale-100 hover:scale-[1.02] active:scale-95 transition-all outline-none cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>CAPTURE PORTRAIT</span>
          </button>
        )}
      </div>
    </div>
  );
};
