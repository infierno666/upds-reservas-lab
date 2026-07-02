"use client";

import React from "react";
import { MapPin, BookOpen, Clock, Trash2, ChevronDown, Layers } from "lucide-react";
import { ReservationCalendar } from "./ReservationCalendar";

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
    onLimpiarSeleccion: () => void;
}

export function ReservaSidebarConfig({
    materias,
    materiaIdSeleccionada,
    setMateriaIdSeleccionada,
    periodoModulo,
    setPeriodoModulo,
    periodoAnio,
    setPeriodoAnio,
    fechaPivote,
    setFechaPivote,
    cantidadSeleccionada,
    onLimpiarSeleccion 
}: Props) {

    // Lista de módulos académicos definidos por la regla de negocio institucional (1 al 6)
    const modulosDisponibles = ["1", "2", "3", "4", "5", "6"];

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5 md:gap-6 w-full h-full md:max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar relative">
            {/* Fondo decorativo institucional */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#004B87]/5 rounded-bl-full z-0 pointer-events-none" />

            {/* Encabezado */}
            <div className="relative z-10 shrink-0">
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-0.5 flex items-center gap-2 tracking-tight">
                    <MapPin size={20} className="text-[#004B87]" /> Configuración
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Defina los parámetros para su solicitud.</p>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="space-y-4 md:space-y-5 flex-1 z-10">

                {/* Asignatura Académica */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        Asignatura Académica
                    </label>
                    <div className="relative">
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] outline-none transition-all cursor-pointer hover:bg-slate-100/50 appearance-none"
                            value={materiaIdSeleccionada}
                            onChange={(e) => setMateriaIdSeleccionada(e.target.value)}
                        >
                            <option value="" className="text-slate-400">Seleccione la materia...</option>
                            {materias.map(m => (
                                <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                        </select>
                        <BookOpen size={16} className="absolute left-3.5 top-4 text-slate-400 pointer-events-none" />
                        <ChevronDown size={16} className="absolute right-3.5 top-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Módulo y Año en Grilla */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Selector de Módulo del 1 al 6 solicitado */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                            Módulo
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 pl-9 pr-8 text-slate-800 text-sm font-bold text-center focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] outline-none transition-all cursor-pointer hover:bg-slate-100/50 appearance-none"
                                value={periodoModulo}
                                onChange={(e) => setPeriodoModulo(e.target.value)}
                            >
                                <option value="">-</option>
                                {modulosDisponibles.map(num => (
                                    <option key={num} value={num}>Módulo {num}</option>
                                ))}
                            </select>
                            <Layers size={14} className="absolute left-3 top-4 text-slate-400 pointer-events-none" />
                            <ChevronDown size={14} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Año Académico */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                            Año
                        </label>
                        <input 
                            type="number" 
                            min="2026"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-sm font-black text-center focus:ring-2 focus:ring-[#004B87]/20 focus:border-[#004B87] outline-none transition-all"
                            value={periodoAnio} 
                            onChange={(e) => setPeriodoAnio(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sección de Calendario Limpia */}
                <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                        Fecha de Inicio / Pivote
                    </label>
                    <div className="w-full flex justify-center">
                        {/* 🛠️ SOLUCIÓN TS2322: Se eliminaron las propiedades que causaban error */}
                        <ReservationCalendar
                            fechaPivote={fechaPivote}
                            setFechaPivote={setFechaPivote}
                        />
                    </div>
                </div>
            </div>

            {/* Resumen Global */}
            <div className="mt-auto bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner shrink-0 z-10">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] uppercase tracking-wider font-black text-slate-400 flex items-center gap-1.5">
                        <Clock size={14} className="text-[#004B87]" /> Resumen Global
                    </h4>
                    {cantidadSeleccionada > 0 && (
                        <button 
                            onClick={onLimpiarSeleccion} 
                            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-all bg-red-50 hover:bg-red-100/80 px-2 py-1 rounded-lg"
                        >
                            <Trash2 size={12} /> Limpiar
                        </button>
                    )}
                </div>

                <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs md:text-sm font-bold text-slate-600">Bloques en Memoria</span>
                    <div className={`flex items-center justify-center min-w-[36px] h-[36px] px-2 rounded-lg ${cantidadSeleccionada > 0 ? 'bg-amber-400 text-amber-950 font-black shadow-sm' : 'bg-slate-100 text-slate-400 font-bold'}`}>
                        <span className="text-base md:text-lg">{cantidadSeleccionada}</span>
                    </div>
                </div>
                
                {cantidadSeleccionada > 0 && (
                    <p className="text-[10px] text-amber-600 mt-2.5 text-center font-bold bg-amber-50 border border-amber-100 py-1.5 px-2 rounded-lg animate-pulse">
                        Asegúrese de revisar otros turnos antes de procesar.
                    </p>
                )}
            </div>
        </div>
    );
}