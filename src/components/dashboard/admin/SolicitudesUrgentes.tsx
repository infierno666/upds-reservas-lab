'use client';

import { AlertCircle, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { SolicitudGrupo } from '@/lib/services/admin.service';

interface SolicitudesUrgentesProps {
  solicitudes: SolicitudGrupo[];
}

export function SolicitudesUrgentes({ solicitudes }: SolicitudesUrgentesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
            Requieren atención
          </p>
          <p className="text-lg font-black text-slate-800 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Solicitudes Pendientes
          </p>
        </div>
        <Link
          href="/admin/solicitudes"
          className="text-xs font-black text-[#004B87] hover:underline uppercase tracking-wider"
        >
          Ver todas →
        </Link>
      </div>

      {solicitudes.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-400 text-sm font-medium">No hay solicitudes pendientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudes.slice(0, 5).map(sol => (
            <div key={sol.grupo_id}
              className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl shrink-0">
                <FlaskConical size={16} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">
                  {sol.docente_nombre}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {sol.materia_actividad} — {sol.laboratorio_nombre}
                </p>
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg shrink-0 uppercase tracking-wider">
                Pendiente
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}