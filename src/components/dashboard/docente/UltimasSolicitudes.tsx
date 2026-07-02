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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          Últimas solicitudes
        </p>
        <Link href="/docente/reservas"
          className="text-xs font-black text-[#001D4A] hover:underline uppercase tracking-wider">
          Ver todas →
        </Link>
      </div>

      {solicitudes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-400 text-sm font-medium">No tienes solicitudes aún.</p>
          <Link href="/docente/reserva/nueva"
            className="text-xs font-black text-[#001D4A] hover:underline mt-2 inline-block">
            Solicitar un laboratorio →
          </Link>
        </div>
      ) : (
        <>
          {/* Tabla — visible en md+ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Laboratorio</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Materia</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Horario</th>
                  <th className="text-left px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {solicitudes.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                          <FlaskConical size={14} className="text-slate-500" />
                        </div>
                        <span className="font-bold text-slate-800 truncate max-w-[140px]">{s.laboratorio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[120px]">{s.materia}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{s.fecha}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{s.hora_inicio} - {s.hora_fin}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${ESTADO_STYLES[s.estado] || ESTADO_STYLES.cancelada}`}>
                        {ESTADO_LABEL[s.estado] || s.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — visible solo en móvil */}
          <div className="md:hidden divide-y divide-slate-100">
            {solicitudes.map((s, i) => (
              <div key={i} className="px-4 py-4 flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                  <FlaskConical size={14} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-black text-slate-800 text-sm truncate">{s.laboratorio}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${ESTADO_STYLES[s.estado] || ESTADO_STYLES.cancelada}`}>
                      {ESTADO_LABEL[s.estado] || s.estado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate">{s.materia}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.fecha} · {s.hora_inicio} - {s.hora_fin}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}