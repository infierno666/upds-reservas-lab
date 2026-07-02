"use client";

import React from "react";
import { BookOpen, ChevronDown, Layers } from "lucide-react";

interface Props {
  materias: any[];
  materiaIdSeleccionada: string;
  setMateriaIdSeleccionada: (val: string) => void;
  periodoModulo: string;
  setPeriodoModulo: (val: string) => void;
  periodoAnio: string;
  setPeriodoAnio: (val: string) => void;
}

const MODULOS = ["1", "2", "3", "4", "5", "6"];

// Campos de configuración académica — extraído de ReservaSidebarConfig para mantenerlo compacto
export function ReservaConfigForm({
  materias, materiaIdSeleccionada, setMateriaIdSeleccionada,
  periodoModulo, setPeriodoModulo, periodoAnio, setPeriodoAnio,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          Asignatura Académica
        </label>
        <div className="relative">
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 pr-9 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] outline-none appearance-none cursor-pointer"
            value={materiaIdSeleccionada}
            onChange={(e) => setMateriaIdSeleccionada(e.target.value)}
          >
            <option value="">Seleccione la materia...</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          <BookOpen size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <ChevronDown size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Módulo</label>
          <div className="relative">
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-8 pr-7 text-slate-800 text-sm font-bold text-center focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] outline-none appearance-none cursor-pointer"
              value={periodoModulo}
              onChange={(e) => setPeriodoModulo(e.target.value)}
            >
              <option value="">-</option>
              {MODULOS.map(num => <option key={num} value={num}>Módulo {num}</option>)}
            </select>
            <Layers size={14} className="absolute left-2.5 top-3 text-slate-400 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Año</label>
          <input
            type="number"
            min="2026"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm font-black text-center focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] outline-none"
            value={periodoAnio}
            onChange={(e) => setPeriodoAnio(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}