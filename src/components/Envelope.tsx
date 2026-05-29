import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WaxSeal } from './WaxSeal';
import { MailOpen, Edit3, Lock } from 'lucide-react';

interface EnvelopeProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenLetter: () => void;
  guestName?: string;
  hasInputMessage?: boolean;
}

export const Envelope: React.FC<EnvelopeProps> = ({
  isOpen,
  onToggle,
  onOpenLetter,
  guestName = '',
  hasInputMessage = false,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* 3D Scene Wrapper with high perspective */}
      <div 
        className="relative w-full max-w-[480px] aspect-[1.45/1] select-none"
        style={{ perspective: '1500px' }}
      >
        {/* Envelope Base Shadow */}
        <div className="absolute inset-x-2 -bottom-4 h-8 bg-black/10 blur-xl rounded-full transition-transform duration-500 scale-95" />

        <div className="absolute inset-0 w-full h-full">
          {/* 1. BACK PLATE (The envelope interior and backing) */}
          <div className="absolute inset-0 bg-[#dbcfb8] border border-[#cec0a6] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Elegant luxury botanical liner pattern inside */}
            <div className="absolute inset-1 bg-[#f9f4e9] rounded-lg opacity-80 border border-[#e8dfcb] overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7b9076_15%,_transparent_15%)] [background-size:16px_16px]" />
              <div className="absolute inset-0 bg-linear-to-b from-[#7b9076]/5 via-transparent to-[#b87d5f]/5" />
            </div>
          </div>

          {/* 2. THE LETTER CARD (Peeking and sliding out of the cavity) */}
          <motion.div
            id="envelope-letter"
            variants={{
              closed: {
                y: 10,
                scale: 0.95,
                zIndex: 20, // behind the front pouch
                opacity: 0.9,
              },
              open: {
                y: '-65%',
                scale: 1.05,
                zIndex: 40, // on top of everything!
                opacity: 1,
              },
            }}
            initial="closed"
            animate={isOpen ? 'open' : 'closed'}
            transition={{
              type: 'spring',
              stiffness: isOpen ? 120 : 55,
              damping: isOpen ? 22 : 16,
              mass: 1.1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isOpen) {
                onOpenLetter();
              } else {
                onToggle();
              }
            }}
            className="absolute left-[8%] right-[8%] bottom-[12%] h-[82%] bg-[#fffcf5] border border-[#d8c7a8] rounded-lg shadow-[-2px_-4px_15px_rgba(47,58,49,0.06),_2px_4px_20px_rgba(47,58,49,0.12)] p-6 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Letter Paper Horizontal Lines (Vellum styling) */}
            <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(#2f3a31_0px,_#2f3a31_1px,_transparent_1px,_transparent_24px)] pointer-events-none mt-16 px-6" />
            
            {/* Letter Header */}
            <div className="flex flex-col items-center text-center mt-2">
              <span className="font-serif italic text-xs tracking-widest text-[#7b9076] uppercase">INVITATION WISHES</span>
              <div className="h-[1px] w-12 bg-[#7b9076]/30 my-1" />
            </div>

            {/* Letter Body: Handwriten placeholder or personalized guest card */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 my-2 text-center pointer-events-none">
              {guestName ? (
                <p className="font-serif text-[#2f3a31] text-base font-medium">
                  Wish card by <span className="font-sans font-bold text-[#7b9076] text-sm tracking-wide block sm:inline">{guestName}</span>
                </p>
              ) : (
                <p className="font-serif text-[#2f3a31] text-base font-semibold">Your Wholesome Letter</p>
              )}
              
              <p className="font-sans text-[#5f6a60] text-xs mt-1.5 px-4 leading-relaxed max-w-[280px]">
                {hasInputMessage 
                  ? "Sealed and ready for Rupa & Aravind." 
                  : "Click to write your heartfelt wishes to the newly-weds."}
              </p>
            </div>

            {/* Letter Footer Badge */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#7b9076]/80 font-sans font-semibold mt-auto z-10 py-1 border-t border-[#f0e6d2]">
              {hasInputMessage ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ready to Seal</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Write Note</span>
                </>
              )}
            </div>
          </motion.div>

          {/* 3. FRONT POUCH (Left & Right folded triangles overlaps) */}
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Soft shadow for the overlapping side panels */}
            <svg viewBox="0 0 480 330" className="absolute inset-0 w-full h-full drop-shadow-[0_-3px_8px_rgba(47,58,49,0.08)] filter">
              {/* Left Side Wing */}
              <path d="M0,0 L0,330 L260,165 Z" fill="#cfc2aa" />
              {/* Right Side Wing */}
              <path d="M480,0 L480,330 L220,165 Z" fill="#cfc2aa" />
              {/* Overlapping borders */}
              <path d="M0,0 L260,165 L480,0" stroke="#bfaa88" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          {/* 4. FRONT BOTTOM CORNER (Rises up overlaying side wings) */}
          <div className="absolute inset-0 pointer-events-none z-30">
            <svg viewBox="0 0 480 330" className="absolute inset-0 w-full h-full drop-shadow-[0_-5px_12px_rgba(47,58,49,0.12)] filter">
              {/* Bottom Triangle Shape */}
              <path d="M0,330 L240,140 L480,330 Z" fill="#decfae" />
              <path d="M0,330 L240,140 L480,330" stroke="#bfaa88" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          {/* 5. TOP FLAP (Folds up in 3D around top edge) */}
          <motion.div
            id="envelope-flap"
            variants={{
              closed: {
                rotateX: 0,
                zIndex: 45, // closes over everything to seal it!
              },
              open: {
                rotateX: -175,
                zIndex: 10, // slips behind the card raised up
              },
            }}
            initial="closed"
            animate={isOpen ? 'open' : 'closed'}
            transition={{
              type: 'spring',
              stiffness: isOpen ? 90 : 45,
              damping: isOpen ? 18 : 14,
              mass: 1.1,
              // Sequenced delays matching open/close - delay closing by 0.85s to let the letter slide in first
              delay: isOpen ? 0 : 0.85,
            }}
            className="absolute top-0 inset-x-0 h-1/2 cursor-pointer z-45"
            style={{
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
            }}
            onClick={onToggle}
          >
            {/* Outer Flap Triangles (Visible when closed) */}
            <div 
              className="absolute inset-0 bg-[#decfae]"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                backfaceVisibility: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderBottom: '1px solid #c9bca0',
              }}
            >
              {/* Inner fold visual shadow */}
              <div className="absolute inset-0 bg-linear-to-b from-[#2f3a31]/5 to-transparent pointer-events-none" />
            </div>

            {/* Inner Flap Liner (Visible when folded up/interior shown) */}
            <div 
              className="absolute inset-0 bg-[#c2b59b] outline-1 outline-offset-[-2px] outline-[#decfae]/30"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Luxury liner inner peak texture */}
              <div className="absolute inset-1 bg-[#decfae] rounded-sm opacity-50" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
              {/* Diagonal lining lines */}
              <div 
                className="absolute inset-0 opacity-[0.14] bg-[repeating-linear-gradient(45deg,_#2f3a31,_#2f3a31_1px,_transparent_1px,_transparent_8px)]" 
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
            </div>
          </motion.div>

          {/* 6. PHYSICAL WAX SEAL (Centered at overlap point) */}
          <WaxSeal isOpen={isOpen} onClick={onToggle} />

        </div>
      </div>

      {/* Helper Action Prompt Sub-Label */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="sealed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-6"
          >
            <p className="font-serif italic text-base text-[#5f6a60] flex items-center justify-center gap-1.5 md:text-lg">
              <MailOpen className="w-4 h-4 text-[#7b9076]" />
              Tap the wax seal to open your letter
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-6 flex flex-col items-center gap-3 w-full"
          >
            <p className="font-serif italic text-base text-[#5f6a60] md:text-lg">
              The envelope is unsealed
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenLetter}
                className="px-6 py-2 rounded-full bg-linear-to-b from-[#859b80] to-[#6f866a] hover:from-[#7b9076] hover:to-[#5d7259] text-white text-xs font-semibold tracking-wider uppercase shadow-md transition-all scale-100 hover:scale-[1.03] active:scale-[0.98] outline-none"
              >
                {hasInputMessage ? "View / Edit Wishes" : "Write Wishes"}
              </button>
              <button
                onClick={onToggle}
                className="px-4 py-2 rounded-full border border-[#7b9076]/40 text-[#5f6a60] hover:bg-[#ede4d0] hover:text-[#2f3a31] text-xs font-semibold tracking-wider uppercase transition-all outline-none"
              >
                Sealing back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
