import React from "react";
import { CheckCircle2, AlertTriangle, X, Info, HelpCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'form' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  children?: React.ReactNode;

  // Props opcionales para personalizar botones
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Pinta el botón de confirmar en rojo
}

export function CustomModal({
  isOpen, type, title, message, onClose, onConfirm, children,
  confirmText = "Confirmar", cancelText = "Cancelar", isDestructive = false
}: ModalProps) {

  if (!isOpen) return null;

  // Configuración visual según el tipo de modal
  const getIconInfo = () => {
    switch (type) {
      case 'success': return { icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'error': return { icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-600' };
      case 'confirm': return { icon: HelpCircle, bg: 'bg-amber-100', text: 'text-amber-600' };
      case 'info':
      default: return { icon: Info, bg: 'bg-blue-100', text: 'text-blue-600' };
    }
  };

  const { icon: Icon, bg, text } = getIconInfo();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100 relative">

        {/* Botón Cerrar (X) Universal */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
          title="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Cuerpo del Modal */}
        <div className="p-8">
          <div className="flex items-start gap-5 mb-2">
            {type !== 'form' && (
              <div className={`shrink-0 p-3.5 rounded-2xl ${bg} ${text} shadow-inner`}>
                <Icon size={28} strokeWidth={2.5} />
              </div>
            )}
            <div className="flex-1 pt-1.5">
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2.5">
                {title}
              </h3>
              {message && (
                <p className="text-sm text-slate-500 font-medium leading-relaxed pr-6">
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Renderizamos los hijos (Formularios, Textareas, etc.) */}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>

        {/* Footer con Acciones (Oculto en type form) */}
        {type !== 'form' && (
          <div className="bg-slate-50/80 px-8 py-5 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all"
            >
              {type === 'confirm' ? cancelText : 'Cerrar'}
            </button>

            {type === 'confirm' && onConfirm && (
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 ${isDestructive
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    : 'bg-[#001D4A] hover:bg-[#001D4A]/90 shadow-[#001D4A]/20'
                  }`}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}