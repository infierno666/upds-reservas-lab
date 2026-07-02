"use client";

import React from "react";
import { getEstadoCelda } from "@/lib/utils/shiftCellState";

interface BloqueHorario {
  id: number;
  turno: string;
  hora_inicio: string;
  hora_fin: string;
}
interface CeldaSeleccionada { fecha: string; bloqueId: number; }

interface Props {
  fecha: Date;
  bloquesDelTurno: BloqueHorario[];
  disponibilidad: any[];
  misReservas: any[];
  seleccion: CeldaSeleccionada[];
  onToggleCelda: (fecha: string, bloqueId: number) => void;
}

// Tarjeta de un día con sus bloques del turno activo — usada en la vista mobile de la grilla
export function ShiftDayCard({ fecha, bloquesDelTurno, disponibilidad, misReservas, seleccion, onToggleCelda }: Props) {
  const fechaStr = fecha.toISOString().split("T")[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          {fecha.toLocaleDateString("es-ES", { weekday: "long" })}
        </span>
        <span className="text-sm font-black text-slate-800">
          {fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {bloquesDelTurno.map((bloque) => {
          const info = getEstadoCelda(fechaStr, bloque.id, seleccion, misReservas, disponibilidad);
          const isInteractable = info.label === "Libre" || info.label === "Seleccionado";

          return (
            <button
              key={bloque.id}
              type="button"
              disabled={!isInteractable}
              onClick={() => onToggleCelda(fechaStr, bloque.id)}
              className={`w-full h-full flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-all ${info.clase}`}
            >
              <span className="text-[11px] font-bold">
                {bloque.hora_inicio?.slice(0, 5)}-{bloque.hora_fin?.slice(0, 5)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{info.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}