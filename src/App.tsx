import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Mic,
  MicOff,
  Type,
  Languages
} from 'lucide-react';

import { Step, LetterDraft, GuestNote } from './types';
import { SusfinityLogo } from './components/SusfinityLogo';
import { Envelope } from './components/Envelope';
import { HandwritingCanvas } from './components/HandwritingCanvas';
import { CameraCapture } from './components/CameraCapture';
import { SubmissionPreview } from './components/SubmissionPreview';
import { getSupabase, localDb } from './supabaseClient';
import { Confetti } from './components/Confetti';

// Translatability & Senior Localization Dictionary
type Language = 'en' | 'ta';

const TRANSLATIONS = {
  en: {
    title: "Susfinity Guest Letters",
    subtitle: "A sustainable digital guestbook for Rupa & Aravind",
    tapToOpen: "TAP TO OPEN",
    envelopeSub: "Let your words of celebration be packed in molten sealing wax.",
    writeWishesTitle: "Write Your Wishes",
    pourLove: "Pour your love onto pristine organic parchment paper",
    guestNameLabel: "Your Name (Optional)",
    guestNamePlaceholder: "Enter your name or family title...",
    guestMessageLabel: "Your Message",
    useHandwriting: "USE HANDWRITING",
    useKeyboard: "USE KEYBOARD",
    speakBtnStart: "Speak Wish",
    speakBtnListening: "Listening...",
    speakBtnSupported: "Speak your message clearly. Recording automatically fills text below.",
    backReseal: "Muted Sealing",
    resealLetter: "Reseal Letter",
    nextTakeSelfie: "Next: Take Selfie",
    selfieTitle: "Capture Your Smile",
    selfieSub: "Bind your portrait to seal your blessing forever",
    backToLetter: "Back to Letter",
    previewBtnSelector: "PREVIEW LETTER",
    previewTitle: "Your Wishing Letter",
    previewSub: "Review your message and photo before melting the wax seal",
    retightenPhoto: "RETIGHTEN PHOTO",
    submitAndSeal: "SUBMIT & SEAL",
    sealingLetter: "SEALING LETTER...",
    syncWishes: "Syncing wishes to database...",
    sealedLocally: "✔ Sealed locally inside your browser cache!",
    sentSuccessfully: "✔ Wish sent successfully via Supabase!",
    writeAnotherText: "WRITE ANOTHER LETTER",
    thankYouTitle: "Thank You!",
    dear: "Dear",
    thankYouMsg: "Your personalized letter has been successfully sealed and added to the wishing chest. Rupa and Aravind will treasure your thoughtful words and portrait forever.",
    wishesShared: "Wishes Shared So Far",
    localStorageDisclaimer: "Local Storage Fallback Ready",
    diagnosticBtn: "Database Connection Diagnostic",
    micNotSupported: "Speech transcription not supported in this browser. Try Chrome/Safari.",
    listeningPleaseSpeak: "Listening... Speak clearly into microphone now.",
    stoppedListening: "Stopped capturing voice input.",
    seniorToggle: "Senior-Friendly A+",
    seniorSubtitle: "Extra large high-contrast text for elders",
    minCharactersError: "Please expand your wishes to at least 8 characters.",
    selectPolicyNote: "Requires at least 8 characters (max 800)"
  },
  ta: {
    title: "சஸ்பினிட்டி வாழ்த்து மடல்",
    subtitle: "ரூபா & அரவிந்த் ஜோடிக்கான ஒரு நிலையான டிஜிட்டல் வாழ்த்துப் பெட்டகம்",
    tapToOpen: "திறக்க தட்டவும்",
    envelopeSub: "உங்கள் வாழ்த்துக்கள் உருகிய மெழுகு முத்திரையில் பொதியப்படட்டும்.",
    writeWishesTitle: "உங்கள் வாழ்த்துக்களை எழுதுங்கள்",
    pourLove: "உங்களது அன்பை அழகான பாராளுமன்ற மடல் தாளில் வடியுங்கள்",
    guestNameLabel: "உங்கள் பெயர் (விருப்பத்திற்குரியது)",
    guestNamePlaceholder: "உங்கள் பெயர் அல்லது குடும்பப் பெயரை உள்ளிடவும்...",
    guestMessageLabel: "உங்கள் வாழ்த்துச் செய்தி",
    useHandwriting: "கையெழுத்து",
    useKeyboard: "விசைப்பலகை",
    speakBtnStart: "பேசி வாழ்த்துக",
    speakBtnListening: "கேட்கிறது...",
    speakBtnSupported: "விசைப்பலகைக்குப் பதில் தமிழிலேயே பேசி வாழ்த்துங்கள்!",
    backReseal: "வாழ்த்து மடலை மூடு",
    resealLetter: "வாழ்த்து மடலை மூடு",
    nextTakeSelfie: "அடுத்து: புகைப்படம்",
    selfieTitle: "உங்களது புன்னகை",
    selfieSub: "உங்களது ஆசீர்வாதத்தை என்றும் நிலைநிறுத்த புகைப்படத்தை இணைத்திடுங்கள்",
    backToLetter: "வாழ்த்து எழுத",
    previewBtnSelector: "வாழ்த்து மடலைப் பார்",
    previewTitle: "உங்களது வாழ்த்து மடல்",
    previewSub: "முத்திரை இடுவதற்குத் தயாராக உள்ள உங்கள் வாழ்த்து மற்றும் புகைப்படம்",
    retightenPhoto: "புகைப்படத்தை மாற்று",
    submitAndSeal: "சமர்ப்பித்து முத்திரையிடு",
    sealingLetter: "மெழுகு முத்திரையிடப்படுகிறது...",
    syncWishes: "விவரங்கள் தரவுத்தளத்துடன் இணைக்கப்படுகிறது...",
    sealedLocally: "✔ உலாவி சேமிப்பில் வெற்றிகரமாக சீல் செய்யப்பட்டது!",
    sentSuccessfully: "✔ வாழ்த்துக்கள் சமர்ப்பிக்கப்பட்டன!",
    writeAnotherText: "மற்றொரு வாழ்த்து எழுத",
    thankYouTitle: "மிக்க நன்றி!",
    dear: "அன்புள்ள",
    thankYouMsg: "உங்களது தனிப்பயனாக்கப்பட்ட வாழ்த்து மடல் வெற்றிகரமாக சீல் செய்யப்பட்டு, மெழுகு முத்திரை வாழ்த்துப் பெட்டகத்தில் சேர்க்கப்பட்டது. ஜோடி ரூபாவும் அரவிந்தும் உங்களது சொற்களையும் புகைப்படத்தையும் என்றென்றும் மதிக்கப் போகிறார்கள்.",
    wishesShared: "இதுவரை பகிரப்பட்ட வாழ்த்துக்கள்",
    localStorageDisclaimer: "உள்ளூர் உலாவி சேமிப்பு தயாராக உள்ளது",
    diagnosticBtn: "தரவுத்தள இணைப்பு கண்டறிதல்",
    micNotSupported: "உங்கள் லேப்டாப்/கைபேசியில் தமிழ் பேச்சு வடிவம் ஆதரிக்கப்படவில்லை.",
    listeningPleaseSpeak: "கேட்கிறது... மைக்ரோபோன் அருகில் தெளிவாகப் பேசுங்கள்.",
    stoppedListening: "பேச்சு வாழ்த்து முடிந்தது.",
    seniorToggle: "பெரிய எழுத்துக்கள் A+",
    seniorSubtitle: "முதியோர்களுக்கான கூடுதல் எழுத்து அளவுகள்",
    minCharactersError: "உங்கள் வாழ்த்துகளை குறைந்தது 8 எழுத்துக்களாக விரிவுபடுத்தவும்.",
    selectPolicyNote: "குறைந்தது 8 எழுத்துக்கள் தேவை (அதிகபட்சம் 800)"
  }
};

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

export default function App() {
  const [step, setStep] = useState<Step>('envelope');
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  // Inclusive and localization states
  const [lang, setLang] = useState<Language>('en');
  const [isElderMode, setIsElderMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const t = TRANSLATIONS[lang];

  // Core wishing draft data state
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [totalWishesCount, setTotalWishesCount] = useState<number | null>(null);

  const fetchWishesCount = async () => {
    try {
      const supabaseConnector = getSupabase();
      let dbCount = 0;
      if (supabaseConnector) {
        // Query exact count of all rows resiliently
        const { count, data, error } = await supabaseConnector
          .from('guest_notes')
          .select('*', { count: 'exact' });
        
        if (!error) {
          if (count !== null) {
            dbCount = count;
          } else if (data) {
            dbCount = data.length;
          }
        } else {
          console.error('Fetch count error:', error);
        }
      }
      const localCount = localDb.getNotes().length;
      const aggregateCount = Math.max(dbCount, localCount);
      setTotalWishesCount(aggregateCount);
    } catch (e) {
      console.error('Error fetching count:', e);
      setTotalWishesCount(localDb.getNotes().length);
    }
  };

  useEffect(() => {
    fetchWishesCount();
  }, []);

  const runDatabaseDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    setStatusMessage('Checking Supabase connection...');
    try {
      const supabaseConnector = getSupabase();
      if (!supabaseConnector) {
        throw new Error('Supabase URL or Key environment variables are missing');
      }
      
      const { count, data, error } = await supabaseConnector
        .from('guest_notes')
        .select('*', { count: 'exact' });
        
      if (error) {
        throw error;
      }
      
      const foundCount = count !== null ? count : (data?.length ?? 0);
      
      if (foundCount === 0) {
        setStatusMessage(`✔ Reachable count: 0 (If your DB contains entries, you must enable PUBLIC SELECT RLS in Supabase: "CREATE POLICY \"read_public\" ON public.guest_notes FOR SELECT USING (true);")`);
      } else {
        setStatusMessage(`✔ Reachable count in DB is ${foundCount} total entries successfully!`);
      }
      
      // Sync local state
      const localCount = localDb.getNotes().length;
      setTotalWishesCount(Math.max(foundCount, localCount));
    } catch (err: any) {
      console.error('Diagnostic check failed:', err);
      setStatusMessage(`❌ Check failed: ${err.message || 'Unknown network error'}`);
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

  // Speech-to-Text Transcription Service for Elder dictation
  const startSpeechRecognition = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage(TRANSLATIONS[lang].micNotSupported);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ta' ? 'ta-IN' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setStatusMessage(TRANSLATIONS[lang].listeningPleaseSpeak);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setStatusMessage(`Mic error: ${event.error || 'Permission Denied'}`);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDraft(p => {
            const currentMessage = p.guestMessage ? p.guestMessage + ' ' : '';
            return {
              ...p,
              guestMessage: currentMessage + transcript,
              isHandwritten: false
            };
          });
          setIsKeyboardMode(true);
          setStatusMessage(`✔ Voice typed: "${transcript}"`);
        }
      };

      rec.start();
    } catch (e: any) {
      console.error(e);
      setStatusMessage(`Failed to start mic: ${e.message}`);
    }
  };

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
      fetchWishesCount();
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
      
      {/* 1. TOP HEADER BRANDING & DUAL LANGUAGE ACCESSIBILITY BAR */}
      <header className="w-full max-w-xl mx-auto flex flex-col items-center mt-2 mb-2 select-none">
        
        {/* Languages Switcher & Senior Accessibility Controls Panel */}
        <div className="w-full flex items-center justify-between px-2 mb-5 gap-3 shrink-0">
          
          {/* Beautifully balanced pill-shaped Language Selector */}
          <div className="flex bg-[#ede4d0]/65 p-1 rounded-full border border-[#d8c7a8]/40 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setLang('en');
                clearStatus();
              }}
              className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#7b9076] text-white shadow-xs'
                  : 'text-[#5f6a60] hover:text-[#2f3a31]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setLang('ta');
                clearStatus();
              }}
              className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full transition-all cursor-pointer ${
                lang === 'ta'
                  ? 'bg-[#7b9076] text-white shadow-xs'
                  : 'text-[#5f6a60] hover:text-[#2f3a31]'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Bold visual Elder-Friendly sizing switcher */}
          <button
            type="button"
            onClick={() => setIsElderMode(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10px] font-extrabold tracking-widest uppercase transition-all cursor-pointer shadow-2xs ${
              isElderMode
                ? 'bg-[#2f3a31] text-white border-[#2f3a31] scale-102 font-black'
                : 'bg-[#ede4d0]/50 text-[#5f6a60] border-[#d8c7a8]/30 hover:bg-[#ede4d0]/90'
            }`}
            title={t.seniorToggle}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{t.seniorToggle}</span>
          </button>
        </div>

        {/* Intricate floating floral logo branding */}
        <motion.div 
          onClick={handleReset}
          className="cursor-pointer"
          whileHover={{ rotate: 10, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <SusfinityLogo variant="color" size={isElderMode ? 100 : 90} className="filter drop-shadow-[0_4px_8px_rgba(123,144,118,0.18)]" />
        </motion.div>

        <h1 className={`font-serif font-semibold text-[#2f3a31] mt-3 tracking-wide transition-all ${isElderMode ? 'text-4xl md:text-5xl font-bold' : 'text-3xl md:text-4xl'}`}>
          {t.title}
        </h1>
        <p className={`font-serif italic text-[#5f6a60] mt-1 pr-1 pl-1 transition-all ${isElderMode ? 'text-lg font-bold' : 'text-sm'}`}>
          {t.subtitle}
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
                <p className={`font-sans font-bold tracking-widest text-[#7b9076] uppercase transition-all ${isElderMode ? 'text-sm font-black' : 'text-xs'}`}>{t.tapToOpen}</p>
                <p className={`font-serif italic text-[#5f6a60] mt-0.5 transition-all ${isElderMode ? 'text-base font-bold' : 'text-sm'}`}>{t.envelopeSub}</p>
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
              <h2 className={`font-serif font-semibold text-[#2f3a31] text-center mb-1 transition-all ${isElderMode ? 'text-3xl' : 'text-2xl'}`}>
                {t.writeWishesTitle}
              </h2>
              <p className={`font-serif italic text-[#5f6a60] text-center mb-6 transition-all ${isElderMode ? 'text-base font-bold' : 'text-xs'}`}>
                {t.pourLove}
              </p>

              <form onSubmit={handleNextFromLetter} className="flex flex-col gap-5">
                
                {/* Guest Name input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="guest-name" className={`font-sans font-bold uppercase tracking-wider text-[#5f6a60] transition-all ${isElderMode ? 'text-sm font-black text-[#2f3a31]' : 'text-xs'}`}>
                    {t.guestNameLabel}
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    maxLength={80}
                    value={draft.guestName}
                    onChange={(e) => setDraft(p => ({ ...p, guestName: e.target.value }))}
                    placeholder={t.guestNamePlaceholder}
                    className={`w-full border border-[#b7b197] bg-white rounded-xl px-4 py-3 text-[#2f3a31] placeholder-[#b7b197]/75 shadow-xs focus:ring-1 focus:ring-[#7b9076] focus:border-[#7b9076] outline-none transition-all font-sans ${isElderMode ? 'text-lg p-4 font-bold border-2 border-[#7b9076]' : 'text-sm'}`}
                  />
                </div>

                {/* Message Entry Block */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-[#d8c7a8]/40 pb-1.5">
                    <label className={`font-sans font-bold uppercase tracking-wider text-[#5f6a60] flex items-center gap-1.5 transition-all ${isElderMode ? 'text-sm font-black text-[#2f3a31]' : 'text-xs'}`}>
                      <MessageSquare className="w-3.5 h-3.5 text-[#7b9076]" />
                      <span>{t.guestMessageLabel}</span>
                    </label>

                    {/* Speech / Keyboard / Handwriting controls grouped dynamically */}
                    <div className="flex items-center gap-1.5">
                      {isKeyboardMode && (
                        <button
                          type="button"
                          onClick={startSpeechRecognition}
                          className={`text-[10px] font-sans font-bold tracking-wider uppercase flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                            isListening
                              ? 'bg-red-50 text-red-700 animate-pulse border border-red-200'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 shadow-3xs'
                          }`}
                          title={t.speakBtnSupported}
                        >
                          <Mic className={`w-3 h-3 ${isListening ? 'animate-bounce' : ''}`} />
                          <span>{isListening ? t.speakBtnListening : t.speakBtnStart}</span>
                        </button>
                      )}

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
                        <span>{isKeyboardMode ? t.useHandwriting : t.useKeyboard}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Writer Node */}
                  <div className="mt-1 transition-all">
                    {isKeyboardMode ? (
                      /* Keyboard mode cursive textarea - beautifully adapted font readability for elders */
                      <textarea
                        value={draft.guestMessage}
                        onChange={(e) => setDraft(p => ({ ...p, guestMessage: e.target.value }))}
                        placeholder={lang === 'ta' ? "உதாரணம்: அன்புடைய ரூபா மற்றும் அரவிந்த், உங்களது இல்லற வாழ்க்கை இன்பமாகவும், அனைத்து மகிழ்ச்சிகளுடனும் நிலைத்திருக்க வாழ்த்துகிறேன்..." : "My dear Rupa & Aravind, wishing you a life filled with endless laughter, adventures, and sustainable growth. Here is to infinity together..."}
                        maxLength={800}
                        className={`w-full border border-[#b7b197] bg-white rounded-xl p-4 text-[#2f3a31] placeholder-[#b7b197]/60 shadow-xs focus:ring-1 focus:ring-[#7b9076] focus:border-[#7b9076] outline-none min-h-[220px] resize-none leading-relaxed transition-all ${isElderMode ? 'text-2xl font-sans font-bold border-2 border-[#7b9076]' : 'text-2xl font-script'}`}
                      />
                    ) : (
                      /* Handwriting Draw Canvas */
                      <HandwritingCanvas
                        initialDataUrl={draft.handwritingDataUrl}
                        onSave={(dataUrl) => setDraft(p => ({ ...p, handwritingDataUrl: dataUrl }))}
                      />
                    )}
                  </div>
                  <p className="text-[10px] font-sans text-neutral-500 italic mt-0.5">
                    {t.selectPolicyNote}
                  </p>
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
                    className={`flex-1 text-[#5f6a60] hover:text-[#2f3a31] bg-[#ede4d0]/60 hover:bg-[#ede4d0] border border-[#d8c7a8]/40 transition-all rounded-full cursor-pointer outline-none uppercase font-bold tracking-wider ${isElderMode ? 'py-4 px-6 text-sm' : 'py-3 text-xs'}`}
                  >
                    {t.resealLetter}
                  </button>
                  
                  <button
                    type="submit"
                    className={`flex-1 bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white font-bold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 scale-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer outline-none ${isElderMode ? 'py-4 px-6 text-sm' : 'py-3 text-xs'}`}
                  >
                    <span>{t.nextTakeSelfie}</span>
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
              <h2 className={`font-serif font-semibold text-[#2f3a31] text-center mb-1 transition-all ${isElderMode ? 'text-3xl' : 'text-2xl'}`}>
                {t.selfieTitle}
              </h2>
              <p className={`font-serif italic text-[#5f6a60] text-center mb-6 transition-all ${isElderMode ? 'text-base font-bold' : 'text-xs'}`}>
                {t.selfieSub}
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
                  className={`flex-1 text-[#5f6a60] hover:text-[#2f3a31] border border-transparent rounded-full hover:bg-[#ede4d0]/60 transition-all cursor-pointer outline-none uppercase font-bold tracking-wider ${isElderMode ? 'py-4 text-sm' : 'py-3 text-xs'}`}
                >
                  {t.backToLetter}
                </button>
                
                {draft.photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('preview');
                      clearStatus();
                    }}
                    className={`flex-1 bg-[#7b9076] hover:bg-[#5d7259] text-white font-bold tracking-wider uppercase rounded-full shadow-md flex items-center justify-center gap-1 scale-100 active:scale-95 transition-all cursor-pointer outline-none ${isElderMode ? 'py-4 text-sm font-black' : 'py-3 text-xs'}`}
                  >
                    <span>{t.previewBtnSelector}</span>
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
              <h2 className={`font-serif font-semibold text-[#2f3a31] text-center mb-1 transition-all ${isElderMode ? 'text-3xl' : 'text-2xl'}`}>
                {t.previewTitle}
              </h2>
              <p className={`font-serif italic text-[#5f6a60] text-center mb-6 transition-all ${isElderMode ? 'text-base font-bold' : 'text-xs'}`}>
                {t.previewSub}
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
                lang={lang}
              />

              <div className="flex gap-4 w-full max-w-[480px] mt-6 border-t border-[#d8c7a8]/30 pt-5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setStep('camera');
                    clearStatus();
                  }}
                  className={`flex-1 text-[#5f6a60] hover:text-[#2f3a31] bg-[#ede4d0]/60 hover:bg-[#ede4d0] border border-[#d8c7a8]/40 transition-all rounded-full cursor-pointer outline-none uppercase font-bold tracking-wider ${isElderMode ? 'py-4 text-sm' : 'py-3 text-xs'}`}
                >
                  {t.retightenPhoto}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitWishes}
                  className={`flex-1 bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white font-bold tracking-wider uppercase rounded-full shadow-md flex items-center justify-center gap-1.5 hover:shadow-lg transition-all scale-100 hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed outline-none cursor-pointer ${isElderMode ? 'py-4 text-sm' : 'py-3 text-xs'}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.sealingLetter : t.submitAndSeal}</span>
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

                <h2 className={`font-serif font-semibold text-[#2f3a31] mb-2 transition-all ${isElderMode ? 'text-4xl' : 'text-3xl'}`}>
                  {t.thankYouTitle}
                </h2>
                <p className={`font-serif italic text-[#5f6a60] mb-4 transition-all ${isElderMode ? 'text-xl font-bold' : 'text-base'}`}>
                  {t.dear} {draft.guestName || (lang === 'ta' ? 'அன்பரே' : 'Friend')},
                </p>
                
                <p className={`font-sans text-[#5f6a60] leading-relaxed mb-8 transition-all ${isElderMode ? 'text-lg font-bold text-neutral-800 max-w-lg' : 'text-xs max-w-[340px]'}`}>
                  {t.thankYouMsg}
                </p>

                <div className="h-[1px] w-24 bg-[#d8c7a8]/50 mb-8" />

                <button
                  type="button"
                  onClick={handleReset}
                  className={`w-full max-w-[280px] bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white font-bold tracking-wider uppercase rounded-full shadow-md hover:shadow-lg transition-all scale-100 hover:scale-[1.02] active:scale-95 outline-none cursor-pointer flex items-center justify-center gap-1.5 ${isElderMode ? 'py-5 text-sm font-black' : 'py-3.5 text-xs'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.writeAnotherText}</span>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wide border shadow-xs max-w-lg text-center ${
                statusMessage.includes('✔')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                  : 'bg-[#ede4d0]/70 text-[#5f6a60] border-[#d8c7a8]/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7b9076] shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          ) : (
            <div className="h-6" /> // spacer to keep vertical density
          )}
        </AnimatePresence>

        {/* Total Letters count badge */}
        <div className="mt-4 flex flex-col items-center select-none">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-[#7b9076]/6 text-[#3c4a3e] border border-[#d8c7a8]/35 font-sans font-semibold uppercase tracking-widest rounded-full shadow-2xs transition-all ${isElderMode ? 'text-xs border-2' : 'text-[10px]'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7b9076] animate-pulse shrink-0" />
            <span>
              {t.wishesShared}: <span className="font-mono text-xs font-bold text-[#2f3a31] bg-[#7b9076]/12 px-1.5 py-0.5 rounded-sm ml-1">{totalWishesCount !== null ? totalWishesCount : '...'}</span>
            </span>
          </div>
        </div>

        {/* Database offline disclaimer */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#5f6a60] opacity-35 mt-3.5 uppercase tracking-widest leading-none">
          <Database className="w-3 h-3" />
          <span>{t.localStorageDisclaimer}</span>
        </div>

        {/* Database connection diagnostic doctor */}
        <div className="mt-3.5 flex flex-col items-center">
          <button
            type="button"
            disabled={isDiagnosticRunning}
            onClick={runDatabaseDiagnostic}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7b9076]/8 hover:bg-[#7b9076]/15 disabled:opacity-50 text-[9px] font-sans font-bold uppercase tracking-widest text-[#7b9076] rounded-full border border-[#7b9076]/20 hover:border-[#7b9076]/40 cursor-pointer transition-all duration-150 shadow-2xs"
          >
            <Database className="w-3 h-3 shrink-0" />
            <span>{isDiagnosticRunning ? 'Checking Supabase...' : t.diagnosticBtn}</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
