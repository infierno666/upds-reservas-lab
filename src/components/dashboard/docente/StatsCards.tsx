'use client';

import { Inbox, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { KPIsDocente } from '@/lib/services/dashboard.docente.service';

interface StatsCardsDocenteProps {
  kpis: KPIsDocente;
}

export function StatsCardsDocente({ kpis }: StatsCardsDocenteProps) {
  const cards = [
    {
      titulo: 'Solicitudes pendientes',
      valor: String(kpis.solicitudesPendientes),
      sub: 'Esperando aprobación',
      icon: Inbox,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      titulo: 'Reservas aprobadas',
      valor: String(kpis.reservasAprobadasMes),
      sub: 'Este mes',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      titulo: 'Horas utilizadas',
      valor: `${kpis.horasUtilizadas}h`,
      sub: 'Con asistencia confirmada',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      titulo: 'Próxima reserva',
      valor: kpis.proximaReservaFecha === '-' ? 'Sin reservas' : kpis.proximaReservaFecha,
      sub: kpis.proximaReservaFecha === '-' ? 'No tienes reservas próximas' : kpis.proximaReservaLab,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
            <card.icon size={18} className={card.color} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
            {card.titulo}
          </p>
          <p className="text-xl font-black text-slate-800 truncate">{card.valor}</p>
          <p className="text-xs text-slate-500 font-medium mt-1 truncate">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}