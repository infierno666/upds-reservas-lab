"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { formatearFecha } from "@/lib/utils/dateUtils";
import { es } from "date-fns/locale";

interface Props {
  fechaPivote: string;
  setFechaPivote: (fecha: string) => void;
}

export function ReservationCalendar({ fechaPivote, setFechaPivote }: Props) {
  const fechaActual = new Date(fechaPivote + "T12:00:00");

  const seleccionarDia = (dia?: Date) => {
    if (!dia) return;
    setFechaPivote(formatearFecha(dia));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-3">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={fechaActual}
          onSelect={seleccionarDia}
          locale={es}

        />
      </div>

      <div className="bg-slate-50 rounded-xl p-3 text-center">
        <p className="text-xs uppercase font-bold text-slate-400">Fecha seleccionada</p>
        <p className="font-black text-[#001D4A]">
          {fechaActual.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
    </div>
  );
}