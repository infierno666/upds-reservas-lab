'use client';

import { Laptop, Calendar, Inbox, BarChart3 } from 'lucide-react';
import { KPIsAdmin } from '@/lib/services/dashboard.admin.service';

interface StatsCardsProps {
  kpis: KPIsAdmin;
}

const CARDS = (kpis: KPIsAdmin) => [
  {
    titulo: 'Laboratorios Activos',
    valor: String(kpis.laboratoriosActivos),
    sub: `/ ${kpis.laboratoriosTotal} Total`,
    icon: Laptop,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    titulo: 'Reservas Hoy',
    valor: String(kpis.reservasHoy),
    sub: 'Aprobadas para hoy',
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    titulo: 'Solicitudes Pendientes',
    valor: String(kpis.solicitudesPendientes),
    sub: 'Requieren atención',
    icon: Inbox,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    titulo: '% Ocupación hoy',
    valor: `${kpis.porcentajeOcupacionHoy}%`,
    sub: 'Bloques ocupados vs disponibles',
    icon: BarChart3,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export function StatsCards({ kpis }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CARDS(kpis).map((card, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
            <card.icon size={20} className={card.color} />
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
            {card.titulo}
          </p>
          <p className="text-2xl font-black text-slate-800 truncate">{card.valor}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}