import React, { useRef, useEffect, useState } from 'react';
import { Camera, Mic, Square, Play, Trash2, Volume2, User, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnifiedMediaBoothProps {
  onCapturePhoto: (blob: Blob | null, dataUrl: string | null) => void;
  onCaptureVoice: (blob: Blob | null, dataUrl: string | null) => void;
  initialPhotoUrl: string | null;
  initialVoiceUrl: string | null;
  lang: 'en' | 'ta';
  isElderMode: boolean;
  onSetStatus: (msg: string) => void;
  // Shared ref-like callback to let parent trigger capture on submit
  triggerCaptureRef?: React.MutableRefObject<(() => boolean) | null>;
}

export const UnifiedMediaBooth: React.FC<UnifiedMediaBoothProps> = ({
  onCapturePhoto,
  onCaptureVoice,
  initialPhotoUrl,
  initialVoiceUrl,
  lang,
  isElderMode,
  onSetStatus,
  triggerCaptureRef,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Camera States
  const [hasCamPermission, setHasCamPermission] = useState<boolean | null>(null);
  const [isCamWarmingUp, setIsCamWarmingUp] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [flashActive, setFlashActive] = useState(false);

  // Audio States
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialVoiceUrl);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(12).fill(10)); // voice wave animation data
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Translation helpers
  const t = {
    en: {
      cameraTitle: "Live Guest Camera",
      cameraActive: "Camera active",
      cameraBlocked: "Camera Access Required",
      cameraDesc: "Please enable camera permission in your browser.",
      camWarm: "Opening camera lens...",
      btnCapture: "Snap Polaroid",
      btnRetake: "Retake Camera",
      btnTake: "Take Photo",
      smileBanner: "Smile! Camera captures on preview",
      voiceTitle: "Optional Voice Blessing (Elders)",
      voiceDesc: "Sing, speak, or say your wishes aloud!",
      btnRecord: "Record Voice",
      btnStop: "Finish Recording",
      playbackReady: "Voice Message Saved",
      btnDeleteVoice: "Delete Voice Note",
      micBlocked: "Mic blocked or unsupported in this browser",
      micListening: "Recording voice now...",
      pulseVoice: "PULSING...",
      photoLogged: "Selfie Ready"
    },
    ta: {
      cameraTitle: "நேரடி புன்னகை காமிரா",
      cameraActive: "காமிரா இயங்குகிறது",
      cameraBlocked: "காமிரா அனுமதி தேவை",
      cameraDesc: "உங்கள் உலாவியில் காமிரா அனுமதியை வழங்கவும்.",
      camWarm: "காமிரா திறக்கப்படுகிறது...",
      btnCapture: "போலராய்டு படம்",
      btnRetake: "காமிராவை மீண்டும் இயக்கு",
      btnTake: "படம் பிடி",
      smileBanner: "அழகாக புன்னகையுங்கள்",
      voiceTitle: "குரல் வாழ்த்துப் பதிவு (விருப்பத்திற்குரியது)",
      voiceDesc: "மணமக்களுக்கு குரல் மூலமாகவும் உங்களது வாழ்த்துகளைப் பதிவு செய்யப் பேசுங்கள்!",
      btnRecord: "பேசி வாழ்த்துக",
      btnStop: "பதிவை முடிக்குக",
      playbackReady: "குரல் வாழ்த்து தயாராக உள்ளது",
      btnDeleteVoice: "குரல் வாழ்த்தை நீக்குக",
      micBlocked: "மைக்போன் அனுமதி இல்லை அல்லது ஆதரிக்கப்படவில்லை",
      micListening: "உங்களது குரல் பதிவு செய்யப்படுகிறது...",
      pulseVoice: "ஒலி அலை...",
      photoLogged: "புகைப்படம் தயார்"
    }
  }[lang];

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream safely
  const startCamera = async () => {
    stopCamera();
    setIsCamWarmingUp(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play blocked:', e));
      }
      setHasCamPermission(true);
    } catch (err) {
      console.error('Camera connection error:', err);
      setHasCamPermission(false);
    } finally {
      setIsCamWarmingUp(false);
    }
  };

  // Capture current stream frame as image
  const capturePhoto = (): boolean => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return false;

    // Is video playing and readable?
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return false;

    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Mirror horizontal for natural front selfie
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset

    // Ambient warmer filter
    ctx.fillStyle = 'rgba(235, 195, 140, 0.08)'; // warm champagne tone
    ctx.fillRect(0, 0, width, height);

    try {
      // Capture
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoUrl(dataUrl);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCapturePhoto(blob, dataUrl);
        }
      }, 'image/jpeg', 0.85);

      onSetStatus(lang === 'ta' ? '✔ நேரடி காமிராவிலிருந்து நிழற்படம் பெறப்பட்டது!' : '✔ Portrait grabbed successfully from live view!');
      return true;
    } catch (e) {
      console.error('Capture error:', e);
      return false;
    }
  };

  // Expose capture function to parent ref
  useEffect(() => {
    if (triggerCaptureRef) {
      triggerCaptureRef.current = () => {
        // If we already have a static photoUrl, don't re-capture
        if (photoUrl) {
          return true;
        }
        // Capture live frame
        return capturePhoto();
      };
    }
    return () => {
      if (triggerCaptureRef) triggerCaptureRef.current = null;
    };
  }, [hasCamPermission, photoUrl, lang]);

  // Audio Recording System
  const startAudioRecording = async () => {
    audioChunksRef.current = [];
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Analyser for interactive visual bouncing wave
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audiCtx = new AudioCtx();
        audioContextRef.current = audiCtx;
        
        const source = audiCtx.createMediaStreamSource(audioStream);
        const analyser = audiCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          // Map to 12 bars values between 4px and 45px height
          const levels = [];
          for (let i = 0; i < 12; i++) {
            const rawVal = dataArray[i % bufferLength] || 10;
            const mappedVal = Math.max(6, Math.min(48, (rawVal / 255) * 45));
            levels.push(mappedVal);
          }
          setAudioLevel(levels);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      } catch (err) {
        console.warn('Audio WebVisualizer not supported or failed to init:', err);
      }

      // Initialize MediaRecorder
      const options = { mimeType: 'audio/webm' };
      let recorder;
      try {
        recorder = new MediaRecorder(audioStream, options);
      } catch (e) {
        // Fallback for Safari
        recorder = new MediaRecorder(audioStream);
      }

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const audUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audUrl);
        onCaptureVoice(audioBlob, audUrl);
        onSetStatus(lang === 'ta' ? '✔ குரல் வாழ்த்து வெற்றிகரமாகப் பதிவுசெய்யப்பட்டது!' : '✔ Voice note saved successfully!');

        // Stop microphrone stream tracks
        audioStream.getTracks().forEach(track => track.stop());
      };

      recorder.start(250); // Slice chunks every 250ms
      setIsRecordingAudio(true);
      setAudioUrl(null);
    } catch (err: any) {
      console.error('Audio recording failed:', err);
      onSetStatus(t.micBlocked);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.warn(e));
      }
    }
  };

  const deleteVoiceNote = () => {
    setAudioUrl(null);
    onCaptureVoice(null, null);
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }
    setIsPlayingAudio(false);
  };

  const playRecordedAudio = () => {
    if (!audioUrl) return;
    if (isPlayingAudio) {
      audioPlaybackRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioPlaybackRef.current) {
        audioPlaybackRef.current = new Audio(audioUrl);
        audioPlaybackRef.current.onended = () => setIsPlayingAudio(false);
      } else {
        audioPlaybackRef.current.src = audioUrl;
      }
      setIsPlayingAudio(true);
      audioPlaybackRef.current.play().catch(e => {
        console.warn('Playback error:', e);
        setIsPlayingAudio(false);
      });
    }
  };

  // Manage Camera on Mounting/Unmounting
  useEffect(() => {
    if (!photoUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [photoUrl]);

  return (
    <div className="w-full flex flex-col gap-4 border border-[#d8c7a8]/40 bg-[#fbf8f0] p-4 rounded-2xl shadow-sm">
      
      {/* SECTION 1: POLAROID CAMERA DOCK */}
      <div className="flex flex-col gap-2 items-center">
        <div className="w-[180px] sm:w-[200px] aspect-[3/4] bg-neutral-900 border-4 border-[#fffdf9] rounded-xl shadow-md overflow-hidden relative group">
          
          {/* Flash visual overlay */}
          {flashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-fade-out" />
          )}

          {photoUrl ? (
            /* PRINTED PHOTO */
            <div className="relative w-full h-full animate-fade-in select-none">
              <img 
                src={photoUrl} 
                alt="Live Snapshot" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-xs text-[9px] uppercase tracking-wider font-sans font-bold text-white text-center py-1 rounded-sm">
                {t.photoLogged}
              </div>
            </div>
          ) : hasCamPermission === false ? (
            /* CAMERA REJECTED */
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 text-neutral-400">
              <AlertCircle className="w-8 h-8 text-[#b87d5f] mb-1.5" />
              <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-neutral-300">{t.cameraBlocked}</span>
              <p className="text-[9px] text-neutral-500 mt-1">{t.cameraDesc}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-3 px-3 py-1 bg-[#ede4d0] hover:bg-[#d8c7a8] text-xs font-sans font-bold text-[#5f6a60] uppercase tracking-wide rounded-full duration-150"
              >
                Retry
              </button>
            </div>
          ) : (
            /* LIVE CONTAINER VIEW */
            <div className="relative w-full h-full">
              {isCamWarmingUp && (
                <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-1.5 z-20">
                  <RefreshCw className="w-4 h-4 text-[#7b9076] animate-spin" />
                  <span className="text-[9px] text-neutral-500">{t.camWarm}</span>
                </div>
              )}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {/* Overlay active grid guide */}
              <div className="absolute inset-0 pointer-events-none border border-white/5">
                <div className="absolute inset-y-0 left-1/2 w-[1px] border-l border-dashed border-white/10" />
                <div className="absolute inset-x-0 top-1/2 h-[1px] border-t border-dashed border-white/10" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-neutral-900/40 backdrop-blur-3xs py-1 rounded-sm text-[8px] text-white font-serif italic text-center animate-pulse">
                {t.smileBanner}
              </div>
            </div>
          )}
        </div>

        {/* Camera action keys */}
        <div className="flex gap-2 justify-center mt-1">
          {photoUrl ? (
            <button
              type="button"
              onClick={() => {
                setPhotoUrl(null);
                onCapturePhoto(null, null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#d8c7a8]/40 bg-[#ede4d0]/40 hover:bg-[#ede4d0] text-[10px] sm:text-xs font-sans font-bold uppercase text-[#5f6a60] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-[#7b9076]" />
              <span>{t.btnRetake}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={hasCamPermission === false || isCamWarmingUp}
              onClick={capturePhoto}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#7b9076] hover:bg-[#5d7259] text-white text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-full shadow-xs duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Camera className="w-3.5 h-3.5 whitespace-nowrap" />
              <span>{t.btnCapture}</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: SENIOR ELDER VOICE BLONDE MODULE */}
      <div className="border-t border-[#d8c7a8]/35 pt-3.5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#7b9076]" />
          <div className="flex flex-col text-left">
            <span className={`font-sans font-extrabold uppercase text-[#2f3a31] tracking-wide transition-all ${isElderMode ? 'text-xs' : 'text-[10px]'}`}>
              {t.voiceTitle}
            </span>
            <span className="text-[9px] font-sans text-[#5f6a60] italic leading-tight">
              {t.voiceDesc}
            </span>
          </div>
        </div>

        {/* Audio Recording UI Box */}
        <div className="w-full bg-[#f4ebd9]/45 border border-[#d8c7a8]/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 sm:p-4 min-h-[60px]">
          
          <AnimatePresence mode="wait">
            {isRecordingAudio ? (
              /* RECORDING ACTIVE: REAL SOUNDWAVE BOUNCING ANIMATION */
              <motion.div 
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 w-full py-1.5"
              >
                <div className="flex justify-center items-end gap-1.5 h-12 py-1">
                  {audioLevel.map((lvl, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 10 }}
                      animate={{ height: lvl }}
                      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                      className="w-1.5 sm:w-2 bg-[#b87d5f] rounded-full"
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-600 font-extrabold tracking-widest uppercase animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block shrink-0" />
                  <span>{t.micListening}</span>
                </div>

                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="px-6 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-sans font-bold tracking-wider uppercase rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>{t.btnStop}</span>
                </button>
              </motion.div>
            ) : audioUrl ? (
              /* PLAYBACK READY */
              <motion.div 
                key="playback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 w-full"
              >
                <div className="flex items-center gap-2 bg-[#7b9076]/10 px-4 py-2 rounded-lg border border-[#7b9076]/20">
                  <Volume2 className="w-4 h-4 text-[#7b9076]" />
                  <span className="text-[10px] font-sans font-semibold text-[#2f3a31] uppercase tracking-wider">{t.playbackReady}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={playRecordedAudio}
                    className={`flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-sans font-bold uppercase transition-all tracking-wide cursor-pointer ${
                      isPlayingAudio 
                        ? 'bg-[#b87d5f] text-white shadow-xs' 
                        : 'bg-[#7b9076] text-white shadow-sm hover:bg-[#5d7259]'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Blessing</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={deleteVoiceNote}
                    className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-full transition-all cursor-pointer"
                    title={t.btnDeleteVoice}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* IDLE STATE: START BUTTON */
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-center p-1"
              >
                <button
                  type="button"
                  onClick={startAudioRecording}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white text-[11px] font-sans font-bold tracking-wider uppercase shadow-xs scale-100 hover:scale-[1.02] active:scale-95 duration-100 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-white animate-pulse" />
                  <span>{t.btnRecord}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>

      {/* Hidden Snapshot Processing Node */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
