"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    show: boolean;
    type: ToastType;
    message: string;
    onClose: () => void;
    duration?: number;
}

export function Toast({ show, type, message, onClose, duration = 4000 }: ToastProps) {

    // Auto-cierre de la notificación
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={24} />,
        error: <AlertTriangle className="text-red-500" size={24} />,
        info: <Info className="text-blue-500" size={24} />
    };

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-xl max-w-sm ${bgColors[type]}`}>
                <div className="shrink-0 mt-0.5">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold capitalize mb-0.5">
                        {type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}
                    </h4>
                    <p className="text-xs font-medium opacity-90 leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 ml-2 opacity-50 hover:opacity-100 transition-opacity rounded-md hover:bg-black/5"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}