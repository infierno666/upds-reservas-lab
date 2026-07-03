'use client';

import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { UltimaSolicitud } from '@/lib/services/dashboard.docente.service';

interface UltimasSolicitudesProps {
  solicitudes: UltimaSolicitud[];
}

const ESTADO_STYLES: Record<string, string> = {
  aprobada: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pendiente: 'bg-amber-50 text-amber-700 border-amber-100',
  rechazada: 'bg-red-50 text-red-700 border-red-100',
  cancelada: 'bg-slate-100 text-slate-500 border-slate-200',
  pendiente_modificacion: 'bg-blue-50 text-blue-700 border-blue-100',
};

const ESTADO_LABEL: Record<string, string> = {
  aprobada: 'Aprobada',
  pendiente: 'Pendiente',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  pendiente_modificacion: 'En revisión',
};

export function UltimasSolicitudes({ solicitudes }: UltimasSolicitudesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
      <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-slate-100 bg-white">
        <p className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
          Últimas solicitudes
        </p>
        <Link href="/docente/reservas"
          className="text-[10px] sm:text-xs font-black text-[#001D4A] hover:text-[#004B87] hover:underline uppercase tracking-wider transition-colors">
          Ver todas →
        </Link>
      </div>

      {solicitudes.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center px-4">
          <p className="text-slate-400 text-sm font-medium text-center">No tienes solicitudes aún.</p>
          <Link href="/docente/reserva/nueva"
            className="text-xs font-black text-[#001D4A] hover:underline mt-3 inline-block">
            Solicitar un laboratorio →
          </Link>
        </div>
      ) : (
        <div className="w-full">
          {/* Vista Desktop (Tabla) */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Laboratorio</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Materia</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Horario</th>
                  <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {solicitudes.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-lg shrink-0">
                          <FlaskConical size={16} className="text-slate-500" />
                        </div>
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{s.laboratorio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[150px]">{s.materia}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{s.fecha}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{s.hora_inicio} - {s.hora_fin}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border uppercase tracking-wider whitespace-nowrap ${ESTADO_STYLES[s.estado] || ESTADO_STYLES.cancelada}`}>
                        {ESTADO_LABEL[s.estado] || s.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil (Cards) */}
          <div className="md:hidden divide-y divide-slate-100 w-full">
            {solicitudes.map((s, i) => (
              <div key={i} className="p-4 sm:p-5 flex items-start gap-3 w-full">
                <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                  <FlaskConical size={16} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="font-black text-slate-800 text-sm truncate">{s.laboratorio}</p>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md border shrink-0 uppercase tracking-wide ${ESTADO_STYLES[s.estado] || ESTADO_STYLES.cancelada}`}>
                      {ESTADO_LABEL[s.estado] || s.estado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mb-1">{s.materia}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{s.fecha} · {s.hora_inicio} - {s.hora_fin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}