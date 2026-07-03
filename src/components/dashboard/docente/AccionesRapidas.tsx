'use client';

import { Plus, Calendar, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export function AccionesRapidas() {
  const acciones = [
    {
      label: 'Nueva Reserva',
      href: '/docente/reserva/nueva',
      icon: Plus,
      primary: true,
    },
    {
      label: 'Ver Calendario',
      href: '/docente/calendario',
      icon: Calendar,
      primary: false,
    },
    {
      label: 'Mis Reservas',
      href: '/docente/reservas',
      icon: ClipboardList,
      primary: false,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm h-full flex flex-col w-full">
      <p className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-5">
        Acciones rápidas
      </p>
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {acciones.map((accion, i) => (
          <Link
            key={i}
            href={accion.href}
            className={`flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl font-black text-sm transition-all duration-200 ${accion.primary
              ? 'bg-[#001D4A] text-white hover:bg-[#004B87] shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
          >
            <accion.icon size={18} className="shrink-0" />
            <span className="truncate">{accion.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}