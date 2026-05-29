import React, { useRef, useEffect, useState } from 'react';
import { Eraser, RotateCcw, Palette } from 'lucide-react';

interface HandwritingCanvasProps {
  onSave: (dataUrl: string | null) => void;
  initialDataUrl: string | null;
}

const BRUSH_COLORS = [
  { name: 'Forest Ink', value: '#2f3a31' },
  { name: 'Terracotta', value: '#b87d5f' },
  { name: 'Sage Leaf', value: '#7b9076' },
  { name: 'Sunset Gold', value: '#d0ac6c' },
];

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  onSave,
  initialDataUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2f3a31');
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize canvas with correct DPI scale
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Keep a copy of existing drawing to restore after resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize with physical pixels
      canvas.width = rect.width * dpr;
      canvas.height = 220 * dpr;
      canvas.style.height = '220px';

      // Reset transforms and apply scale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Restore drawing properties
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = brushColor;

      // Restore previous drawing contents nicely
      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(
          tempCanvas,
          0,
          0,
          tempCanvas.width / dpr,
          tempCanvas.height / dpr
        );
      }
    };

    // Run initially
    resizeCanvas();

    // Listen to resize
    window.addEventListener('resize', resizeCanvas);

    // If initial drawing exists, draw it
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
        setIsEmpty(false);
      };
      img.src = initialDataUrl;
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [initialDataUrl]);

  // Sync brush stroke color when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = brushColor;
    }
  }, [brushColor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Touch support
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    
    // Mouse Support
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Save canvas drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Force a small check to verify if drawing has ink
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    onSave(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave(null);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-3 w-full">
      {/* Tool panel: Brush Colors and Cleansers */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ede4d0]/60 p-2.5 rounded-xl border border-[#d8c7a8]/40">
        
        {/* Colors selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5f6a60] font-sans flex items-center gap-1 font-semibold">
            <Palette className="w-3.5 h-3.5 text-[#7b9076]" />
            Ink:
          </span>
          <div className="flex items-center gap-1.5">
            {BRUSH_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                onClick={() => setBrushColor(col.value)}
                style={{ backgroundColor: col.value }}
                title={col.name}
                className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer scale-100 active:scale-90 ${
                  brushColor === col.value 
                    ? 'border-white ring-2 ring-[#7b9076]/60 scale-110' 
                    : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Button Clears */}
        <button
          type="button"
          onClick={clearCanvas}
          disabled={isEmpty}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium text-[#5f6a60] hover:text-[#2f3a31] disabled:opacity-40 disabled:cursor-not-allowed border border-[#d8c7a8]/60 bg-white/70 hover:bg-white rounded-full transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear Ink</span>
        </button>
      </div>

      {/* Actual Drawing Canvas Plate */}
      <div className="relative w-full border border-[#b7b197] rounded-xl bg-[#fffcf5] overflow-hidden shadow-inner cursor-crosshair">
        
        {/* Decorative Grid Guide background lines */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-1.5 pointer-events-none text-center px-4">
            <span className="font-serif italic text-[#7b9076] text-lg">Dear newlyweds,</span>
            <span className="font-sans text-xs text-[#5f6a60] opacity-75">Sign or write with your finger/stylus here...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[220px] block touch-none relative z-10"
          aria-label="Handwriting canvas wishes entry"
        />
      </div>
    </div>
  );
};
