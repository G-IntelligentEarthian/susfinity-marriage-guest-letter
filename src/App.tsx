import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  BookOpen, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  ChevronRight, 
  AlertCircle,
  Database,
  Lock,
  MessageSquare
} from 'lucide-react';

import { Step, LetterDraft, GuestNote } from './types';
import { SusfinityLogo } from './components/SusfinityLogo';
import { Envelope } from './components/Envelope';
import { HandwritingCanvas } from './components/HandwritingCanvas';
import { CameraCapture } from './components/CameraCapture';
import { SubmissionPreview } from './components/SubmissionPreview';
import { getSupabase, localDb } from './supabaseClient';
import { Confetti } from './components/Confetti';

// Safe UUID helper for sandboxed contexts where crypto.randomUUID is absent (fixes standard iframe browser block)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Convert drawn handwritten canvas Base64 dataURL back into a raw blob for Supabase storage uploading
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default function App() {
  const [step, setStep] = useState<Step>('envelope');
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  // Core wishing draft data state
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const runDatabaseDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    setStatusMessage('Checking Supabase connection...');
    try {
      const supabaseConnector = getSupabase();
      if (!supabaseConnector) {
        throw new Error('Supabase URL or Key environment variables are missing');
      }
      
      const { count, error } = await supabaseConnector
        .from('guest_notes')
        .select('id', { head: true, count: 'exact' });
        
      if (error) {
        throw error;
      }
      
      setStatusMessage(`✔ Reachable! Count: ${count ?? 0} total letters in database.`);
    } catch (err: any) {
      console.error('Diagnostic check failed:', err);
      setStatusMessage(`❌ Reachable check failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  const [draft, setDraft] = useState<LetterDraft>({
    guestName: '',
    guestMessage: '',
    isHandwritten: true,
    handwritingDataUrl: null,
    photoBlob: null,
    photoDataUrl: null,
    timestamp: new Date().toISOString(),
  });

  const handleUpdateMessage = (newMessage: string) => {
    setDraft(prev => ({
      ...prev,
      guestMessage: newMessage,
      isHandwritten: false,
      handwritingDataUrl: null, // text edit replaces handwriting
    }));
  };

  const clearStatus = () => setStatusMessage('');

  // Form submission and envelope packing animation sequence
  const handleSubmitWishes = async () => {
    setIsSubmitting(true);
    setStatusMessage('Syncing wishes to database...');

    try {
      const supabaseConnector = getSupabase();
      
      if (supabaseConnector) {
        // 1. Prepare selfie storage file write
        let photo_url = '';
        if (draft.photoBlob) {
          const fileName = `${Date.now()}-${generateUUID()}.jpg`;
          const { error: uploadError } = await supabaseConnector.storage
            .from('guest-selfies')
            .upload(fileName, draft.photoBlob, { contentType: 'image/jpeg', upsert: false });
          
          if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
          
          const { data: photoData } = supabaseConnector.storage
            .from('guest-selfies')
            .getPublicUrl(fileName);
          photo_url = photoData.publicUrl;
        }

        // 2. Convert and upload drawing as handwriting if applicable
        let handwriting_url = '';
        if (draft.isHandwritten && draft.handwritingDataUrl) {
          try {
            const hBlob = dataUrlToBlob(draft.handwritingDataUrl);
            const fileName = `${Date.now()}-${generateUUID()}.png`;
            const { error: uploadError } = await supabaseConnector.storage
              .from('guest-selfies') // use same bucket for simplicity
              .upload(fileName, hBlob, { contentType: 'image/png', upsert: false });
            
            if (uploadError) throw new Error(`Handwriting upload failed: ${uploadError.message}`);

            const { data: hData } = supabaseConnector.storage
              .from('guest-selfies')
              .getPublicUrl(fileName);
            handwriting_url = hData.publicUrl;
          } catch (err: any) {
            console.error('Handwriting upload error:', err);
            setStatusMessage(`Drawing failed to upload: ${err.message}. Saving as local backup.`);
          }
        }

        const noteModel: GuestNote = {
          guest_name: draft.guestName.trim() || 'Anonymous Friend',
          message: draft.isHandwritten ? (handwriting_url || '[handwritten wishing]') : draft.guestMessage,
          is_handwritten: draft.isHandwritten,
          photo_url: photo_url,
          device_info: navigator.userAgent,
        };

        let { error: dbError } = await supabaseConnector.from('guest_notes').insert(noteModel);
        
        // Dynamic resilient fallback: if the 'is_handwritten' column does not exist in the database (Postgres code 42703 / undefined_column),
        // we automatically strip it and retry the insertion so the guest's wish is never lost!
        if (dbError && (dbError.code === '42703' || dbError.message?.toLowerCase().includes('is_handwritten') || dbError.message?.toLowerCase().includes('column'))) {
          console.warn('is_handwritten column is missing in the database schema. Retrying insertion without it...');
          const fallbackModel = { ...noteModel };
          delete fallbackModel.is_handwritten;
          const { error: retryError } = await supabaseConnector.from('guest_notes').insert(fallbackModel);
          dbError = retryError;
        }

        if (dbError) throw new Error(`Database record failed: ${dbError.message}`);
        
        setStatusMessage('✔ Wish sent successfully via Supabase!');
      } else {
        // Fall back to offline localStorage
        const noteModel: GuestNote = {
          guest_name: draft.guestName.trim() || 'Anonymous Friend',
          message: draft.isHandwritten ? (draft.handwritingDataUrl || '[handwritten wishing]') : draft.guestMessage,
          is_handwritten: draft.isHandwritten,
          photo_url: draft.photoDataUrl || '',
          created_at: new Date().toISOString(),
          device_info: navigator.userAgent,
        };
        
        localDb.insertNote(noteModel);
        setStatusMessage('✔ Sealed locally inside your browser cache!');
        console.warn('Supabase not fully configured; stored letter in client localStorage.');
      }

      // PHYSICAL SEAL ANIMATION SEQUENCE !
      // 1. Move back to the envelope stage with envelope set to open so user sees their note
      setStep('envelope');
      setEnvelopeOpen(true);
      await new Promise(r => setTimeout(r, 1200));

      // 2. Play envelope "Close" animation - slides the card back inside, folds flap, stamps gold logo wax!
      setEnvelopeOpen(false);
      setStatusMessage('Sealing envelope with wax stamp...');
      await new Promise(r => setTimeout(r, 3400));

      // 3. Move to the Thank You screen now that physical cycle completed!
      setStep('thanks');
      clearStatus();

    } catch (e: any) {
      console.error('Submission error:', e);
      setStatusMessage(`Unable to sync database. Saving locally. Error: ${e.message}`);
      
      // Secondary fallback save to keep workflow going
      const noteModel: GuestNote = {
        guest_name: draft.guestName.trim() || 'Anonymous Friend',
        message: draft.isHandwritten ? (draft.handwritingDataUrl || '[handwritten wishing]') : draft.guestMessage,
        is_handwritten: draft.isHandwritten,
        photo_url: draft.photoDataUrl || '',
        created_at: new Date().toISOString(),
        device_info: navigator.userAgent,
      };
      localDb.insertNote(noteModel);
      
      // Still show close sequence so they get the beautiful responsive wax sealing !
      setStep('envelope');
      setEnvelopeOpen(true);
      await new Promise(r => setTimeout(r, 600));
      setEnvelopeOpen(false);
      await new Promise(r => setTimeout(r, 1400));
      setStep('thanks');
      clearStatus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextFromLetter = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Message validity check
    if (draft.isHandwritten) {
      if (!draft.handwritingDataUrl) {
        setStatusMessage('Please draw your message/signature on the canvas, or toggle keyboard mode.');
        return;
      }
    } else {
      if (draft.guestMessage.trim().length < 8) {
        setStatusMessage('Please expand your wishes to at least 8 characters.');
        return;
      }
    }

    clearStatus();
    setStep('camera');
  };

  const handleReset = () => {
    setDraft({
      guestName: '',
      guestMessage: '',
      isHandwritten: true,
      handwritingDataUrl: null,
      photoBlob: null,
      photoDataUrl: null,
      timestamp: new Date().toISOString(),
    });
    setEnvelopeOpen(false);
    setStep('envelope');
    clearStatus();
  };

  return (
    <main className="custom-grid-bg min-h-screen w-full flex flex-col justify-between py-6 px-4 sm:p-8">
      
      {/* 1. TOP HEADER BRANDING */}
      <header className="w-full max-w-xl mx-auto flex flex-col items-center text-center mt-2 mb-4 select-none">
        
        {/* Intricate floating floral logo branding */}
        <motion.div 
          onClick={handleReset}
          className="cursor-pointer"
          whileHover={{ rotate: 10, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <SusfinityLogo variant="color" size={90} className="filter drop-shadow-[0_4px_8px_rgba(123,144,118,0.18)]" />
        </motion.div>

        <h1 className="font-serif font-semibold text-[#2f3a31] text-3xl md:text-4xl mt-3 tracking-wide">
          Susfinity Guest Letters
        </h1>
        <p className="font-serif italic text-sm text-[#5f6a60] mt-1 pr-1 pl-1">
          A sustainable digital guestbook for Rupa &amp; Aravind
        </p>
      </header>

      {/* 2. MAIN CARD SHELL CONTAINER WITH STEP SWITCHES */}
      <section className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center my-4">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: ENVELOPE INTRO */}
          {step === 'envelope' && (
            <motion.div
              key="step-envelope"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-1 w-full"
            >
              <div className="text-center mb-4">
                <p className="font-sans text-xs font-bold tracking-widest text-[#7b9076] uppercase">TAP TO OPEN</p>
                <p className="font-serif italic text-[#5f6a60] text-sm mt-0.5">Let your words of celebration be packed in molten sealing wax.</p>
              </div>

              {/* Enhanced 3D Envelope */}
              <Envelope
                isOpen={envelopeOpen}
                onToggle={() => setEnvelopeOpen(prev => !prev)}
                onOpenLetter={() => setStep('letter')}
                guestName={draft.guestName}
                hasInputMessage={!!(draft.handwritingDataUrl || draft.guestMessage)}
              />
            </motion.div>
          )}

          {/* STEP 2: LETTER WRITING PAPERING */}
          {step === 'letter' && (
            <motion.div
              key="step-letter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-[#f9f4e9]/92 backdrop-blur-xs border border-[#d8c7a8] rounded-3xl shadow-2xl p-6 sm:p-8"
            >
              <h2 className="font-serif font-semibold text-[#2f3a31] text-2xl text-center mb-1">
                Write Your Wishes
              </h2>
              <p className="font-serif italic text-xs text-[#5f6a60] text-center mb-6">
                Pour your love onto pristine organic parchment paper
              </p>

              <form onSubmit={handleNextFromLetter} className="flex flex-col gap-5">
                
                {/* Guest Name input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="guest-name" className="text-xs font-sans font-bold uppercase tracking-wider text-[#5f6a60]">
                    Your Name (Optional)
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    maxLength={80}
                    value={draft.guestName}
                    onChange={(e) => setDraft(p => ({ ...p, guestName: e.target.value }))}
                    placeholder="Enter your name or family title..."
                    className="w-full border border-[#b7b197] bg-white rounded-xl px-4 py-3 text-sm text-[#2f3a31] placeholder-[#b7b197]/75 shadow-xs focus:ring-1 focus:ring-[#7b9076] focus:border-[#7b9076] outline-none transition-all font-sans"
                  />
                </div>

                {/* Message Entry Block */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-[#d8c7a8]/40 pb-1.5">
                    <label className="text-xs font-sans font-bold uppercase tracking-wider text-[#5f6a60] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#7b9076]" />
                      <span>Your Message</span>
                    </label>

                    {/* Mode toggler layout */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextMod = !isKeyboardMode;
                        setIsKeyboardMode(nextMod);
                        setDraft(p => ({
                          ...p,
                          isHandwritten: !nextMod,
                          handwritingDataUrl: null, // clear drawing on mode swap
                          guestMessage: '',
                        }));
                        clearStatus();
                      }}
                      className="text-[10px] font-sans font-bold tracking-wider text-[#7b9076] uppercase flex items-center gap-1 px-2.5 py-1 bg-[#7b9076]/10 hover:bg-[#7b9076]/20 transition-colors rounded-full duration-150 cursor-pointer"
                    >
                      <span>USE {isKeyboardMode ? 'HANDWRITING' : 'KEYBOARD'}</span>
                    </button>
                  </div>

                  {/* Dynamic Writer Node */}
                  <div className="mt-1 transition-all">
                    {isKeyboardMode ? (
                      /* Keyboard mode cursive textarea */
                      <textarea
                        value={draft.guestMessage}
                        onChange={(e) => setDraft(p => ({ ...p, guestMessage: e.target.value }))}
                        placeholder="My dear Rupa & Aravind, wishing you a life filled with endless laughter, adventures, and sustainable growth. Here is to infinity together..."
                        maxLength={800}
                        className="w-full border border-[#b7b197] bg-white rounded-xl p-4 text-2xl font-script text-[#2f3a31] placeholder-[#b7b197]/60 shadow-xs focus:ring-1 focus:ring-[#7b9076] focus:border-[#7b9076] outline-none min-h-[220px] resize-none leading-relaxed transition-all"
                      />
                    ) : (
                      /* Handwriting Draw Canvas */
                      <HandwritingCanvas
                        initialDataUrl={draft.handwritingDataUrl}
                        onSave={(dataUrl) => setDraft(p => ({ ...p, handwritingDataUrl: dataUrl }))}
                      />
                    )}
                  </div>
                </div>

                {/* Honeypot anti-spam */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('envelope');
                      setEnvelopeOpen(true);
                      clearStatus();
                    }}
                    className="flex-1 py-3 text-xs font-bold tracking-wider text-[#5f6a60] hover:text-[#2f3a31] bg-[#ede4d0]/60 hover:bg-[#ede4d0] border border-[#d8c7a8]/40 transition-all rounded-full cursor-pointer outline-none uppercase"
                  >
                    Reseal Letter
                  </button>
                  
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 scale-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer outline-none"
                  >
                    <span>Next: Take Selfie</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: PHOTO CAPTURE WORKFLOW */}
          {step === 'camera' && (
            <motion.div
              key="step-camera"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-[#f9f4e9]/92 backdrop-blur-xs border border-[#d8c7a8] rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center"
            >
              <h2 className="font-serif font-semibold text-[#2f3a31] text-2xl text-center mb-1">
                Capture Your Smile
              </h2>
              <p className="font-serif italic text-xs text-[#5f6a60] text-center mb-6">
                Bind your portrait to seal your blessing forever
              </p>

              <CameraCapture
                initialPhotoUrl={draft.photoDataUrl}
                onCapture={(blob, dataUrl) => setDraft(p => ({ ...p, photoBlob: blob, photoDataUrl: dataUrl }))}
              />

              <div className="flex gap-3 w-full max-w-[340px] mt-6 pt-4 border-t border-[#d8c7a8]/30">
                <button
                  type="button"
                  onClick={() => {
                    setStep('letter');
                    clearStatus();
                  }}
                  className="flex-1 py-3 text-xs font-semibold text-[#5f6a60] hover:text-[#2f3a31] border border-transparent rounded-full hover:bg-[#ede4d0]/60 transition-all cursor-pointer outline-none"
                >
                  Back to Letter
                </button>
                
                {draft.photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('preview');
                      clearStatus();
                    }}
                    className="flex-1 py-3 bg-[#7b9076] hover:bg-[#5d7259] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-md flex items-center justify-center gap-1 scale-100 active:scale-95 transition-all cursor-pointer outline-none"
                  >
                    <span>PREVIEW LETTER</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: PREVIEW COMPILATION */}
          {step === 'preview' && (
            <motion.div
              key="step-preview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-[#f9f4e9]/92 backdrop-blur-xs border border-[#d8c7a8] rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center"
            >
              <h2 className="font-serif font-semibold text-[#2f3a31] text-2xl text-center mb-1">
                Your Wishing Letter
              </h2>
              <p className="font-serif italic text-xs text-[#5f6a60] text-center mb-6">
                Review your message and photo before melting the wax seal
              </p>

              <SubmissionPreview
                guestName={draft.guestName}
                guestMessage={draft.guestMessage}
                isHandwritten={draft.isHandwritten}
                handwritingDataUrl={draft.handwritingDataUrl}
                photoDataUrl={draft.photoDataUrl}
                onUpdateMessage={handleUpdateMessage}
                onBackToCamera={() => {
                  setStep('camera');
                  setDraft(prev => ({ ...prev, photoBlob: null, photoDataUrl: null }));
                }}
              />

              <div className="flex gap-4 w-full max-w-[480px] mt-6 border-t border-[#d8c7a8]/30 pt-5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setStep('camera');
                    clearStatus();
                  }}
                  className="flex-1 py-3 text-xs font-bold tracking-wider text-[#5f6a60] hover:text-[#2f3a31] bg-[#ede4d0]/60 hover:bg-[#ede4d0] border border-[#d8c7a8]/40 transition-all rounded-full cursor-pointer outline-none"
                >
                  RETIGHTEN PHOTO
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitWishes}
                  className="flex-1 py-3 bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-md flex items-center justify-center gap-1.5 hover:shadow-lg transition-all scale-100 hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed outline-none cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'SEALING LETTER...' : 'SUBMIT & SEAL'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: THANKS CONCLUSION */}
          {step === 'thanks' && (
            <>
              <Confetti />
              <motion.div
                key="step-thanks"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.4 }}
                className="w-full bg-[#f9f4e9]/92 backdrop-blur-xs border border-[#d8c7a8] rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  {/* Visual success rings */}
                  <span className="absolute inset-0 bg-emerald-100 rounded-full scale-125 opacity-40 animate-ping" />
                  <CheckCircle2 className="w-16 h-16 text-[#7b9076] drop-shadow-md relative z-10" />
                </div>

                <h2 className="font-serif font-semibold text-[#2f3a31] text-3xl mb-2">
                  Thank You!
                </h2>
                <p className="font-serif italic text-base text-[#5f6a60] mb-4">
                  Dear {draft.guestName || 'Friend'},
                </p>
                
                <p className="font-sans text-xs text-[#5f6a60] leading-relaxed max-w-[340px] mb-8">
                  Your personalized letter has been successfully sealed and added to the wishing chest. Rupa and Aravind will treasure your thoughtful words and portrait forever.
                </p>

                <div className="h-[1px] w-24 bg-[#d8c7a8]/50 mb-8" />

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full max-w-[280px] py-3.5 bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all scale-100 hover:scale-[1.02] active:scale-95 outline-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>WRITE ANOTHER LETTER</span>
                </button>
              </motion.div>
            </>
          )}

        </AnimatePresence>
      </section>

      {/* 3. FOOTER LOGGING BAR & REASSURANCES */}
      <footer className="w-full max-w-xl mx-auto flex flex-col items-center mt-4 mb-2 select-none">
        
        {/* Real-time status update banner */}
        <AnimatePresence mode="wait">
          {statusMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wide border shadow-xs max-w-xs text-center ${
                statusMessage.includes('✔')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                  : 'bg-[#ede4d0]/70 text-[#5f6a60] border-[#d8c7a8]/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7b9076] shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </motion.div>
          ) : (
            <div className="h-6" /> // spacer to keep vertical density
          )}
        </AnimatePresence>

        {/* Database offline disclaimer */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#5f6a60] opacity-40 mt-3 uppercase tracking-widest leading-none">
          <Database className="w-3 h-3" />
          <span>Local Storage Fallback Ready</span>
        </div>

        {/* Database connection diagnostic doctor */}
        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            disabled={isDiagnosticRunning}
            onClick={runDatabaseDiagnostic}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7b9076]/8 hover:bg-[#7b9076]/15 disabled:opacity-50 text-[9px] font-sans font-bold uppercase tracking-widest text-[#7b9076] rounded-full border border-[#7b9076]/20 hover:border-[#7b9076]/40 cursor-pointer transition-all duration-150 shadow-2xs"
          >
            <Database className="w-3 h-3 shrink-0" />
            <span>{isDiagnosticRunning ? 'Checking Supabase...' : 'Database Connection Diagnostic'}</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
