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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-4">
        Acciones rápidas
      </p>
      <div className="flex flex-col gap-3">
        {acciones.map((accion, i) => (
          <Link
            key={i}
            href={accion.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all ${accion.primary
              ? 'bg-[#001D4A] text-white hover:bg-[#001D4A]/90 shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
          >
            <accion.icon size={18} />
            {accion.label}
          </Link>
        ))}
      </div>
    </div>
  );
}