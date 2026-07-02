"use client";

import React from "react";
import { CalendarDays, Clock } from "lucide-react";

interface ReservaCardDetalleProps {
  grupo: any;
  setModalAsistencia: (val: { isOpen: boolean; reservaId: string; fecha: string; laboratorio: string }) => void;
}

// Detalle expandible de fechas y turnos dentro de la card de reserva (mobile)
export function ReservaCardDetalle({ grupo, setModalAsistencia }: ReservaCardDetalleProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2">
      <div className="flex justify-between items-center">
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays size={14} className="text-[#001D4A]" /> Fechas y Turnos
        </h4>
        <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
          {grupo.totalBloques} bloques
        </span>
      </div>
      <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar space-y-3">
        {grupo.diasAgrupados.map((dia: any, idx: number) => (
          <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl">
            <span className="font-black text-slate-800 text-sm">{dia.fecha}</span>
            <div className="flex flex-col gap-1.5 mt-2">
              {dia.etiquetas.map((etiqueta: string, tIdx: number) => (
                <span key={tIdx} className="text-xs text-[#001D4A] font-bold flex items-center gap-1.5 bg-blue-50/50 w-fit px-2.5 py-1.5 rounded-lg border border-blue-100">
                  <Clock size={12} className="text-blue-500" />
                  {etiqueta}
                </span>
              ))}
            </div>
            {grupo.estado === "aprobada" &&
              new Date(dia.fecha) < new Date() &&
              grupo.reservasCrudas.some(
                (r: any) =>
                  r.fecha === dia.fecha &&
                  r.asistencia_confirmada === null &&
                  !r.asistencia_resuelta_por_timeout
              ) && (
                <button
                  onClick={() =>
                    setModalAsistencia({
                      isOpen: true,
                      reservaId: grupo.reservasCrudas.find((r: any) => r.fecha === dia.fecha)?.id || "",
                      fecha: dia.fecha,
                      laboratorio: grupo.laboratorio,
                    })
                  }
                  className="mt-3 text-xs font-bold text-[#001D4A] border border-[#001D4A]/20 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 w-full transition-all"
                >
                  ¿Asististe este día?
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}