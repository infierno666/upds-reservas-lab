"use client";

import React, { useState } from "react";
import { MapPin, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ReservationCalendar } from "./ReservationCalendar";
import { ReservaConfigForm } from "./ReservaConfigForm";

interface Props {
  materias: any[];
  materiaIdSeleccionada: string;
  setMateriaIdSeleccionada: (val: string) => void;
  periodoModulo: string;
  setPeriodoModulo: (val: string) => void;
  periodoAnio: string;
  setPeriodoAnio: (val: string) => void;
  fechaPivote: string;
  setFechaPivote: (val: string) => void;
  cantidadSeleccionada: number;
  onLimpiarSeleccion: () => void;
}

// Panel de configuración: materia, módulo, año y fecha pivote.
// Colapsable en mobile para no empujar la grilla hacia abajo.
export function ReservaSidebarConfig({
  materias, materiaIdSeleccionada, setMateriaIdSeleccionada,
  periodoModulo, setPeriodoModulo, periodoAnio, setPeriodoAnio,
  fechaPivote, setFechaPivote, cantidadSeleccionada, onLimpiarSeleccion,
}: Props) {
  const [abierto, setAbierto] = useState(true);
  const materiaNombre = materias.find(m => m.id === materiaIdSeleccionada)?.nombre;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between p-4 lg:cursor-default"
      >
        <div className="text-left">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <MapPin size={16} className="text-[#004B87]" /> Configuración
          </h3>
          {!abierto && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {materiaNombre ? `${materiaNombre} · Módulo ${periodoModulo} · ${periodoAnio}` : "Sin completar"}
            </p>
          )}
        </div>
        <span className="lg:hidden text-slate-400">
          {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      <div className={`${abierto ? "block" : "hidden"} lg:block px-4 pb-4 space-y-4`}>
        <ReservaConfigForm
          materias={materias}
          materiaIdSeleccionada={materiaIdSeleccionada}
          setMateriaIdSeleccionada={setMateriaIdSeleccionada}
          periodoModulo={periodoModulo}
          setPeriodoModulo={setPeriodoModulo}
          periodoAnio={periodoAnio}
          setPeriodoAnio={setPeriodoAnio}
        />

        <ReservationCalendar fechaPivote={fechaPivote} setFechaPivote={setFechaPivote} />

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
              <Clock size={12} className="text-[#004B87]" /> Bloques en memoria
            </span>
            {cantidadSeleccionada > 0 && (
              <button onClick={onLimpiarSeleccion} className="text-xs text-red-600 font-bold flex items-center gap-1">
                <Trash2 size={12} /> Limpiar
              </button>
            )}
          </div>
          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Seleccionados</span>
            <span className={`min-w-[32px] text-center px-2 py-1 rounded-lg text-sm font-black ${cantidadSeleccionada > 0 ? "bg-amber-400 text-amber-950" : "bg-slate-100 text-slate-400"}`}>
              {cantidadSeleccionada}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}