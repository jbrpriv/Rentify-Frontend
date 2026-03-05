'use client';

/**
 * SignatureModal — DocuSign-style draw-to-sign canvas modal.
 *
 * Props:
 *   open       boolean   - Whether the modal is visible
 *   onClose    () => void
 *   onConfirm  (drawDataBase64: string) => void
 *   signerName string    - Name of the person signing (shown in the header)
 *   loading    boolean   - Shows a spinner on the confirm button
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { X, RotateCcw, PenLine, Check } from 'lucide-react';

export default function SignatureModal({ open, onClose, onConfirm, signerName = '', loading = false }) {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const [isEmpty, setIsEmpty] = useState(true);

    // ── Reset canvas whenever modal opens ──────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        clearCanvas();
    }, [open]);

    // ── Resize canvas to match its CSS size (prevents blurry strokes) ──────────
    useEffect(() => {
        if (!open) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            ctx.strokeStyle = '#1e293b'; // slate-800
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };

        resize();
        setIsEmpty(true);
    }, [open]);

    // ── Drawing helpers ────────────────────────────────────────────────────────
    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDraw = useCallback((e) => {
        e.preventDefault();
        isDrawing.current = true;
        const canvas = canvasRef.current;
        lastPos.current = getPos(e, canvas);
    }, []);

    const draw = useCallback((e) => {
        e.preventDefault();
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e, canvas);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastPos.current = pos;
        setIsEmpty(false);
    }, []);

    const stopDraw = useCallback(() => {
        isDrawing.current = false;
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Re-apply styles after clear
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setIsEmpty(true);
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        const drawData = canvas.toDataURL('image/png');
        onConfirm(drawData);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
        >
            <div
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'fadeSlideUp 0.25s ease-out' }}
            >
                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                            <PenLine className="w-4 h-4 text-blue-600" />
                        </span>
                        <div>
                            <h3 className="font-black text-gray-900 text-base leading-tight">Draw Your Signature</h3>
                            {signerName && (
                                <p className="text-xs text-gray-400 mt-0.5">{signerName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── DocuSign-style signing notice ──────────────────────────────── */}
                <div className="px-6 pt-5">
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        By signing below, you confirm that you have read and agree to the lease agreement.
                        Your electronic signature is legally binding.
                    </p>

                    {/* ── Canvas area ─────────────────────────────────────────────── */}
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 overflow-hidden"
                        style={{ touchAction: 'none' }}>

                        {/* Baseline guide */}
                        <div className="absolute bottom-12 left-6 right-6 border-b border-gray-300 opacity-60" />
                        <div className="absolute bottom-8 left-6 text-[10px] uppercase tracking-widest text-gray-300 font-semibold select-none">
                            Sign above the line
                        </div>

                        <canvas
                            ref={canvasRef}
                            className="w-full cursor-crosshair"
                            style={{ height: '180px', touchAction: 'none' }}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={stopDraw}
                        />

                        {isEmpty && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-gray-300 text-sm font-medium select-none">Sign here with your mouse or finger</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Actions ────────────────────────────────────────────────────── */}
                <div className="px-6 py-5 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={clearCanvas}
                        disabled={isEmpty || loading}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-40 transition"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Clear
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isEmpty || loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm transition"
                    >
                        {loading ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {loading ? 'Signing…' : 'Sign Agreement'}
                    </button>
                </div>
            </div>

            <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
