'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { getNotificaciones, marcarLeida, marcarTodasLeidas, Notificacion } from '@/lib/services/notificacion.service';

export function NotificacionesBell() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const cargar = async () => {
    try {
      setNotificaciones(await getNotificaciones());
    } catch { /* silencioso — no interrumpe la UI */ }
  };

  // Carga inicial y polling cada 30 segundos
  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cierra el panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarcarLeida = async (id: string) => {
    await marcarLeida(id);
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  return (
    <div ref={ref} className="relative">
      {/* Botón campana */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        title="Notificaciones"
      >
        <Bell size={20} className="text-slate-600" />
        {/* Badge de no leídas */}
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {abierto && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-[300] overflow-hidden">
          {/* Header del panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-black text-slate-800 text-sm">Notificaciones</span>
            <div className="flex items-center gap-2">
              {noLeidas > 0 && (
                <button
                  onClick={handleMarcarTodas}
                  className="text-[11px] font-bold text-[#001D4A] hover:underline flex items-center gap-1"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck size={14} /> Leer todas
                </button>
              )}
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notificaciones.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Sin notificaciones</p>
              </div>
            ) : (
              notificaciones.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.leida ? 'bg-blue-50/40' : ''}`}
                  onClick={() => !n.leida && handleMarcarLeida(n.id)}
                >
                  {/* Indicador de no leída */}
                  <div className="mt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${!n.leida ? 'bg-[#001D4A]' : 'bg-transparent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.leida ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {n.titulo}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.mensaje}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {new Date(n.created_at).toLocaleDateString('es-BO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}