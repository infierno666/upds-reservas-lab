"use client";

import React from "react";
import { MapPin, CalendarDays, BookOpen, Clock, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatearFecha } from "@/lib/utils/dateUtils";

interface Props {
    laboratorios: any[];
    materias: any[];
    labSeleccionado: string;
    setLabSeleccionado: (val: string) => void;
    materiaIdSeleccionada: string;
    setMateriaIdSeleccionada: (val: string) => void;
    periodoModulo: string;
    setPeriodoModulo: (val: string) => void;
    periodoAnio: string;
    setPeriodoAnio: (val: string) => void;
    fechaPivote: string;
    setFechaPivote: (val: string) => void;
    cantidadSeleccionada: number;
    onLimpiarSeleccion: () => void; // <-- NUEVA PROP
}

export function ReservaSidebarConfig({
    laboratorios, materias,
    labSeleccionado, setLabSeleccionado,
    materiaIdSeleccionada, setMateriaIdSeleccionada,
    periodoModulo, setPeriodoModulo,
    periodoAnio, setPeriodoAnio,
    fechaPivote, setFechaPivote,
    cantidadSeleccionada,
    onLimpiarSeleccion // <-- NUEVA PROP
}: Props) {

    const dateObj = fechaPivote ? new Date(fechaPivote + 'T12:00:00') : undefined;

    const handleDateSelect = (d: Date | undefined) => {
        if (d) setFechaPivote(formatearFecha(d));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6 h-full min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-60 pointer-events-none"></div>

            <div>
                <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2 tracking-tight">
                    <MapPin size={22} className="text-[#001D4A]" /> Configuración
                </h3>
                <p className="text-sm text-slate-500 font-medium">Defina los parámetros para su solicitud.</p>
            </div>

            <div className="space-y-6 flex-1 z-10">
                {/* 1. Laboratorio */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Espacio Físico</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-[#001D4A]/30 outline-none transition-all cursor-pointer hover:bg-slate-100/50 appearance-none"
                        value={labSeleccionado}
                        onChange={(e) => setLabSeleccionado(e.target.value)}
                    >
                        <option value="" className="text-slate-400">Seleccione un laboratorio...</option>
                        {laboratorios.map(lab => (
                            <option key={lab.id} value={lab.id}>{lab.nombre} (Cap: {lab.capacidad})</option>
                        ))}
                    </select>
                </div>

                {/* 2. Materia / Actividad */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        Asignatura Académica
                    </label>
                    <div className="relative">
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-800 font-medium focus:ring-2 focus:ring-[#001D4A]/30 outline-none transition-all cursor-pointer hover:bg-slate-100/50 appearance-none"
                            value={materiaIdSeleccionada}
                            onChange={(e) => setMateriaIdSeleccionada(e.target.value)}
                        >
                            <option value="" className="text-slate-400">Seleccione la materia...</option>
                            {materias.map(m => (
                                <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                        </select>
                        <BookOpen size={18} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* 3. Periodo y Año */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Módulo</label>
                        <input type="number" min="1" max="12"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-center focus:ring-2 focus:ring-[#001D4A]/30 outline-none transition-all"
                            value={periodoModulo} onChange={(e) => setPeriodoModulo(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Año</label>
                        <input type="number" min="2024"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-center focus:ring-2 focus:ring-[#001D4A]/30 outline-none transition-all"
                            value={periodoAnio} onChange={(e) => setPeriodoAnio(e.target.value)}
                        />
                    </div>
                </div>

                {/* 4. Fecha Pivote con Shadcn Calendar */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        Fecha de Referencia
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-semibold border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl py-6 text-slate-700 transition-all">
                                <CalendarIcon className="mr-3 h-5 w-5 text-[#001D4A]" />
                                {dateObj ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(dateObj) : "Seleccione una fecha"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-xl" align="center">
                            <Calendar mode="single" selected={dateObj} onSelect={handleDateSelect} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Panel de Resumen Premium */}
            <div className="mt-auto bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[11px] uppercase tracking-wider font-black text-slate-500 flex items-center gap-2">
                        <Clock size={14} className="text-[#001D4A]" /> Resumen Global
                    </h4>
                    {/* NUEVO: Botón para limpiar memoria */}
                    {cantidadSeleccionada > 0 && (
                        <button onClick={onLimpiarSeleccion} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-all">
                            <Trash2 size={12} /> Limpiar
                        </button>
                    )}
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all">
                    <span className="text-sm font-bold text-slate-600">Bloques en Memoria</span>
                    <div className={`flex items-center justify-center min-w-[40px] h-[40px] rounded-lg ${cantidadSeleccionada > 0 ? 'bg-amber-400 text-amber-950 shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                        <span className="text-xl font-black">{cantidadSeleccionada}</span>
                    </div>
                </div>
                {cantidadSeleccionada > 0 && (
                    <p className="text-[11px] text-amber-600 mt-3 text-center px-1 font-semibold">
                        Asegúrese de revisar las pestañas de otros turnos antes de procesar.
                    </p>
                )}
            </div>
        </div>
    );
}