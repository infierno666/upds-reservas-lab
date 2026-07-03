'use client';

import { Calendar, Clock, FlaskConical } from 'lucide-react';
import { KPIsDocente } from '@/lib/services/dashboard.docente.service';
import Link from 'next/link';

interface ProximaReservaProps {
  kpis: KPIsDocente;
}

export function ProximaReserva({ kpis }: ProximaReservaProps) {
  const sinReserva = kpis.proximaReservaFecha === '-';

  return (
    <div className="bg-gradient-to-br from-[#001D4A] to-[#004B87] rounded-2xl p-5 sm:p-6 text-white shadow-md h-full flex flex-col w-full">
      <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white/70 mb-5">
        Próxima reserva
      </p>

      {sinReserva ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-4">
          <div className="p-4 bg-white/5 rounded-full">
            <Calendar size={36} className="text-white/40" />
          </div>
          <p className="text-white/70 text-sm sm:text-base font-medium text-center">
            No tienes reservas próximas.
          </p>
          <Link href="/docente/reserva/nueva"
            className="mt-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs sm:text-sm font-black transition-colors border border-white/10 hover:border-white/30 shadow-sm">
            + Solicitar laboratorio
          </Link>
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-white/10 rounded-xl shrink-0 border border-white/5 shadow-inner">
              <FlaskConical size={24} className="text-white/90" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-black truncate leading-tight mb-1.5" title={kpis.proximaReservaLab}>
                {kpis.proximaReservaLab}
              </p>
              <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full inline-block tracking-wide ${kpis.proximaReservaEstado === 'aprobada'
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}>
                {kpis.proximaReservaEstado === 'aprobada' ? '✓ Confirmada' : '⏳ Pendiente de aprobación'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto">
            <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/5">
              <p className="text-[10px] sm:text-[11px] font-black text-white/60 uppercase tracking-wider mb-1.5">
                Fecha
              </p>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-white/80 shrink-0" />
                <p className="text-sm sm:text-base font-black truncate">{kpis.proximaReservaFecha}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/5">
              <p className="text-[10px] sm:text-[11px] font-black text-white/60 uppercase tracking-wider mb-1.5">
                Horario
              </p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-white/80 shrink-0" />
                <p className="text-sm sm:text-base font-black truncate">{kpis.proximaReservaHora}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}