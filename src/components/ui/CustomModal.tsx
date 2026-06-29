import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";
import React from "react"; // Importante para React.ReactNode

interface ModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'form';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  children?: React.ReactNode; // <-- AQUÍ ESTÁ LA CORRECCIÓN
}

export function CustomModal({ isOpen, type, title, message, onClose, onConfirm, children }: ModalProps) {
  if (!isOpen) return null;

  const Icono = type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : Info;
  const colorClass = type === 'success' ? 'text-green-600 bg-green-100' : type === 'error' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {type !== 'form' && (
                <div className={`p-3 rounded-full ${colorClass}`}>
                  <Icono size={28} />
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            </div>
            {/* En type="form" el cierre es solo con la X, el formulario maneja su propio submit */}
            {type === 'form' && (
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            )}
          </div>
          {message && <p className="text-slate-600 leading-relaxed mb-4">{message}</p>}

          {/* Renderizamos los hijos si existen (formulario o textarea segun el caso) */}
          {children && <div className="mt-2">{children}</div>}
        </div>

        {/* El footer con botones Cerrar/Confirmar NO se muestra en type="form": el formulario ya trae los suyos */}
        {type !== 'form' && (
          <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {type === 'confirm' ? 'Cancelar' : 'Cerrar'}
            </button>
            {type === 'confirm' && onConfirm && (
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#001D4A] hover:bg-[#001D4A]/90 transition-colors shadow-md hover:shadow-lg"
              >
                Confirmar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}