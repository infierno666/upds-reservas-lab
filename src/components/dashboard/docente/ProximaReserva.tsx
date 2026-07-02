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
    <div className="bg-gradient-to-br from-[#001D4A] to-[#004B87] rounded-2xl p-6 text-white shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wider text-white/60 mb-4">
        Próxima reserva
      </p>

      {sinReserva ? (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <Calendar size={32} className="text-white/30" />
          <p className="text-white/60 text-sm font-medium text-center">
            No tienes reservas próximas.
          </p>
          <Link href="/docente/reserva/nueva"
            className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-colors">
            + Solicitar laboratorio
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl shrink-0">
              <FlaskConical size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black truncate">{kpis.proximaReservaLab}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-block ${kpis.proximaReservaEstado === 'aprobada'
                  ? 'bg-emerald-400/20 text-emerald-300'
                  : 'bg-amber-400/20 text-amber-300'
                }`}>
                {kpis.proximaReservaEstado === 'aprobada' ? '✓ Confirmada' : '⏳ Pendiente de aprobación'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-wider mb-1">
                Fecha
              </p>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-white/70" />
                <p className="text-sm font-black">{kpis.proximaReservaFecha}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-wider mb-1">
                Horario
              </p>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-white/70" />
                <p className="text-sm font-black">{kpis.proximaReservaHora}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}