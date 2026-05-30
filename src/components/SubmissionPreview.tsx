import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Save, X, FileText, CheckCircle2, Play, Square, Volume2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SubmissionPreviewProps {
  guestName: string;
  guestMessage: string;
  isHandwritten: boolean;
  handwritingDataUrl: string | null;
  photoDataUrl: string | null;
  voiceDataUrl?: string | null;
  onUpdateMessage: (newMessage: string) => void;
  onBackToCamera?: () => void;
  onDeleteVoice?: () => void;
  lang?: 'en' | 'ta';
}

export const SubmissionPreview: React.FC<SubmissionPreviewProps> = ({
  guestName,
  guestMessage,
  isHandwritten,
  handwritingDataUrl,
  photoDataUrl,
  voiceDataUrl = null,
  onUpdateMessage,
  onBackToCamera,
  onDeleteVoice,
  lang = 'en',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(isHandwritten ? '' : guestMessage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editError, setEditError] = useState('');
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const startEdit = () => {
    setIsEditing(true);
    setEditError('');
    if (isHandwritten) {
      setEditedText(''); // Clear if handwriting so they can replace with typed text
    } else {
      setEditedText(guestMessage);
    }
  };

  const saveEdit = () => {
    const trimmed = editedText.trim();
    if (trimmed.length < 8) {
      setEditError(lang === 'ta' ? 'வாழ்த்துக்கள் குறைந்தது 8 எழுத்துக்கள் கொண்டிருக்க வேண்டும்.' : 'Wishes must be at least 8 characters long.');
      return;
    }
    onUpdateMessage(trimmed);
    setIsEditing(false);
    setEditError('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditError('');
    setEditedText(isHandwritten ? '' : guestMessage);
  };

  // Playback system for preview
  const toggleVoicePlayback = () => {
    if (!voiceDataUrl) return;
    if (isPlaying) {
      audioPlaybackRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioPlaybackRef.current) {
        audioPlaybackRef.current = new Audio(voiceDataUrl);
        audioPlaybackRef.current.onended = () => setIsPlaying(false);
      } else {
        audioPlaybackRef.current.src = voiceDataUrl;
      }
      setIsPlaying(true);
      audioPlaybackRef.current.play().catch(e => {
        console.warn('Playback error inside preview:', e);
        setIsPlaying(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
      }
    };
  }, []);

  const tDear = lang === 'ta' ? 'அன்புள்ள ரூபா & அரவிந்த் அவர்களுக்கு,' : 'Dear Rupa & Aravind,';
  const tHandwritten = lang === 'ta' ? 'கையெழுத்து' : 'Handwritten';
  const tTyped = lang === 'ta' ? 'விசைப்பலகை' : 'Typed Ink';
  const tPlaceholder = lang === 'ta' ? 'உங்கள் வாழ்த்துக்களை இங்கு தட்டச்சு செய்யவும்...' : 'Type wishes...';
  const tCancel = lang === 'ta' ? 'ரத்து செய்க' : 'Cancel';
  const tSave = lang === 'ta' ? 'சேமி' : 'Save';
  const tWarmest = lang === 'ta' ? 'அன்பான வாழ்த்துக்களுடன்,' : 'Warmest wishes,';
  const tEditOpt = lang === 'ta' ? 'வாழ்த்தைத் திருத்து' : 'EDIT TEXT';
  const tSuccessBound = lang === 'ta' ? 'புகைப்படம் மடலுடன் இணைக்கப்பட்டது' : 'Portrait bound to letter successfully';
  const tRetakePhoto = lang === 'ta' ? 'புகைப்படத்தை மாற்று' : 'RETAKE PHOTO';
  const tVoiceHeader = lang === 'ta' ? 'உங்களது ஆடியோ வாழ்த்து' : 'Recorded Voice Blessing';
  const tPlay = lang === 'ta' ? 'வாழ்த்தைக் கேள்' : 'Play Blessing';
  const tStop = lang === 'ta' ? 'நிறுத்து' : 'Stop Blessing';

  return (
    <div className="flex flex-col gap-6 w-full max-w-[480px]">
      
      {/* 1. MASTER COLLAGE (Letter Page, Photo Frame, and Audio Ribbon) */}
      <div className="flex flex-col gap-4 bg-white/40 p-4 rounded-3xl border border-[#d8c7a8]/40 shadow-inner">
        
        {/* Wish Letter Segment */}
        <div className="relative bg-[#fffcf5] border border-[#d8c7a8] rounded-2xl p-5 shadow-[-4px_6px_20px_rgba(47,58,49,0.06)] overflow-hidden">
          {/* Subtle line background */}
          <div className="absolute inset-x-0 bottom-4 top-16 opacity-[0.05] bg-[repeating-linear-gradient(#2f3a31_0px,_#2f3a31_1px,_transparent_1px,_transparent_28px)] pointer-events-none px-5" />

          {/* Letter header */}
          <div className="flex items-center justify-between border-b border-[#7b9076]/15 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-serif italic text-[#7b9076]">
              <FileText className="w-3.5 h-3.5" />
              <span>{tDear}</span>
            </div>
            
            {/* Ink indicator */}
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#7b9076]/10 text-[#7b9076]">
              {isHandwritten ? tHandwritten : tTyped}
            </span>
          </div>

          {/* Content display */}
          <div className="min-h-[140px] flex flex-col justify-between py-1 relative z-15">
            {isEditing ? (
              /* Inline text editor */
              <div className="flex flex-col gap-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder={tPlaceholder}
                  maxLength={600}
                  className="w-full min-h-[100px] border border-[#b7b197] rounded-xl p-3 bg-white text-base leading-relaxed font-script font-medium text-[#2f3a31] outline-none shadow-xs focus:ring-1 focus:ring-[#7b9076]"
                />
                {editError && (
                  <p className="text-[11px] font-sans font-semibold text-rose-700 bg-rose-50 border border-rose-200/50 px-2.5 py-1.5 rounded-lg">
                    {editError}
                  </p>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider text-[#5f6a60] bg-neutral-100 hover:bg-neutral-200 uppercase duration-150 cursor-pointer"
                  >
                    {tCancel}
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider text-white bg-[#7b9076] hover:bg-[#5d7259] uppercase shadow-xs flex items-center gap-1 duration-150 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>{tSave}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Visual display text/canvas */
              <div className="flex-1 flex flex-col justify-center">
                {isHandwritten && handwritingDataUrl ? (
                  <div className="flex items-center justify-center p-2 bg-[#fffdf9]/50 rounded-lg max-h-[150px] overflow-hidden">
                    <img
                      src={handwritingDataUrl}
                      alt="Handwritten wishes vector stream"
                      className="max-h-[130px] object-contain drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.12)]"
                    />
                  </div>
                ) : (
                  <p className="font-script text-[#2f3a31] text-2xl leading-relaxed word-break break-word whitespace-pre-wrap select-text pl-2">
                    {guestMessage}
                  </p>
                )}
              </div>
            )}

            {/* Letter Signoff */}
            {!isEditing && (
              <div className="flex items-end justify-between border-t border-[#7b9076]/10 pt-2.5 mt-4">
                <p className="font-serif italic text-sm text-[#5f6a60]">
                  {tWarmest}{' '}
                  <span className="font-sans font-bold text-sm text-[#2f3a31] not-italic tracking-wide ml-1">
                    {guestName || (lang === 'ta' ? 'அன்பான நண்பர்' : 'Anonymous Friend')}
                  </span>
                </p>

                {/* Edit Toggle buttons */}
                <button
                  type="button"
                  onClick={startEdit}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#ede4d0]/60 hover:bg-[#ede4d0] border border-[#d8c7a8]/50 rounded-full text-[10px] font-sans font-bold tracking-wider text-[#5f6a60] hover:text-[#2f3a31] cursor-pointer"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  <span>{tEditOpt}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. AUDIO RECORDER BLESSING RIBBON (Only if recorded) */}
        {voiceDataUrl && (
          <div className="w-full bg-[#f4ebd9]/60 border border-[#d8c7a8]/50 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#7b9076]/20 text-[#7b9076] rounded-full">
                <Volume2 className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-sans font-extrabold uppercase text-[#2f3a31] tracking-wider">{tVoiceHeader}</span>
                <span className="text-[9px] text-[#5f6a60] italic">
                  {lang === 'ta' ? 'மணமக்கள் கேட்க தயார்' : 'Ready for the couple to play'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVoicePlayback}
                className={`py-1.5 px-4 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1 duration-150 cursor-pointer text-white ${
                  isPlaying ? 'bg-[#b87d5f]' : 'bg-[#7b9076] hover:bg-[#5d7259]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>{tStop}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>{tPlay}</span>
                  </>
                )}
              </button>

              {onDeleteVoice && (
                <button
                  type="button"
                  onClick={onDeleteVoice}
                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded-full hover:bg-neutral-100 transition-all cursor-pointer"
                  title={lang === 'ta' ? 'அழிக்க' : 'Delete Voice Note'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Guest Photo segment */}
        {photoDataUrl && (
          <div className="relative group rounded-2xl overflow-hidden aspect-4/3 border border-[#cfbba0] shadow-md bg-neutral-900">
            <img
              src={photoDataUrl}
              alt="Guest Portrait"
              className="w-full h-full object-cover"
            />
            {/* Elegant warm photo matte board overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 text-white text-xs font-sans tracking-wide font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block shadow-sm animate-pulse" />
              <span>{tSuccessBound}</span>
            </div>
            {onBackToCamera && (
              <button
                onClick={onBackToCamera}
                className="absolute top-3 right-3 px-3 py-1 bg-black/60 hover:bg-black/85 backdrop-blur-xs text-white text-[10px] font-sans font-bold tracking-wider rounded-full border border-white/20 transition-all cursor-pointer outline-none"
              >
                {tRetakePhoto}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
