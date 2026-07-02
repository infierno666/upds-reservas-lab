"use client";

import React from "react";
import { ShiftDayCard } from "./ShiftDayCard";

interface Props {
  bloquesDelTurno: any[];
  fechasVisibles: Date[];
  disponibilidad: any[];
  misReservas: any[];
  seleccion: { fecha: string; bloqueId: number }[];
  onToggleCelda: (fecha: string, bloqueId: number) => void;
}

// Lista vertical de días con sus bloques — reemplaza la tabla en pantallas < lg
export function ShiftGridMobile({ bloquesDelTurno, fechasVisibles, disponibilidad, misReservas, seleccion, onToggleCelda }: Props) {
  if (bloquesDelTurno.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400">
        <p className="text-sm font-medium">No hay bloques configurados para este turno.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {fechasVisibles.map((fecha, idx) => (
        <ShiftDayCard
          key={idx}
          fecha={fecha}
          bloquesDelTurno={bloquesDelTurno}
          disponibilidad={disponibilidad}
          misReservas={misReservas}
          seleccion={seleccion}
          onToggleCelda={onToggleCelda}
        />
      ))}
    </div>
  );
}