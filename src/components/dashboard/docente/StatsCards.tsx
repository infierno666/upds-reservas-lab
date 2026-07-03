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
    // Reemplazado lg:grid-cols-4 por la clase kpi-grid para usar Container Queries
    <div className="kpi-grid grid grid-cols-2 gap-4 w-full">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
              {card.titulo}
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-800 truncate">
              {card.valor}
            </p>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2 truncate">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}