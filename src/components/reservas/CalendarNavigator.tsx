"use client";

import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface Props {
    fechaPivote: string;
    vista: "semana" | "mes";
    setFechaPivote: (fecha: string) => void;
}

export function CalendarNavigator({ fechaPivote, vista, setFechaPivote }: Props) {
    const fecha = new Date(fechaPivote + "T12:00:00");

    const moverFecha = (cantidad: number) => {
        const nueva = new Date(fecha);
        nueva.setDate(nueva.getDate() + cantidad);
        setFechaPivote(nueva.toISOString().split("T")[0]);
    };

    const irHoy = () => {
        setFechaPivote(new Date().toISOString().split("T")[0]);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                    <button onClick={() => moverFecha(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={irHoy} className="px-4 rounded-xl bg-slate-100 font-bold text-sm hover:bg-slate-200">
                        Hoy
                    </button>
                    <button onClick={() => moverFecha(1)} className="p-2 rounded-xl hover:bg-slate-100 transition">
                        <ChevronRight size={18} />
                    </button>
                </div>
                <span className="sm:hidden text-[11px] font-bold text-slate-400 uppercase">{vista}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center gap-2 font-black text-slate-800 capitalize text-sm sm:text-base truncate">
                    <CalendarDays size={18} className="text-[#001D4A] shrink-0" />
                    <span className="truncate">
                        {fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                    </span>
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase shrink-0">
                    Vista: {vista}
                </span>
            </div>
        </div>
    );
}