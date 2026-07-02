"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CalendarView from "@/components/calendario/CalendarView";
import { getCalendarioReservas, getLaboratorios } from "@/lib/services/reservaService";
import { Loader2, CalendarDays, Filter, MapPin, CheckCircle2, User } from "lucide-react";


export default function CalendarioDocentePage() {
    const [rango, setRango] = useState({
        inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    });

    // Filtros de estado local
    const [labSeleccionado, setLabSeleccionado] = useState<string>("");
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("");
    const [soloMisReservas, setSoloMisReservas] = useState<boolean>(false);

    // Cargar Catálogo de Laboratorios
    const { data: laboratorios = [] } = useQuery({
        queryKey: ["cat-laboratorios"],
        queryFn: getLaboratorios,
    });

    // Cargar Eventos con Filtros aplicados
    const { data: eventos = [], isLoading } = useQuery({
        queryKey: ["calendario-docente", rango, labSeleccionado, estadoSeleccionado, soloMisReservas],
        queryFn: () => getCalendarioReservas(rango.inicio, rango.fin, {
            laboratorioId: labSeleccionado || undefined,
            estado: estadoSeleccionado || undefined,
            soloMisReservas
        }),
    });

    return (
        <div className="w-full h-full min-h-screen flex flex-col gap-5 p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

            {/* HEADER */}
            <div className="flex items-center gap-4 shrink-0">
                <div className="p-3 sm:p-4 rounded-2xl bg-[#004B87]/10 text-[#004B87] shadow-inner">
                    <CalendarDays size={28} className="sm:w-8 sm:h-8" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Calendario de Reservas
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        Consulte la disponibilidad institucional en tiempo real.
                    </p>
                </div>
            </div>

            {/* BARRA DE FILTROS RESPONSIVA (Glassmorphism) */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm shrink-0 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center z-10 relative">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 xl:mb-0">
                    <Filter size={18} className="text-[#004B87]" /> Filtros
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Selector de Laboratorios */}
                    <div className="relative w-full sm:w-auto min-w-[220px]">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#004B87]/30 focus:border-[#004B87] transition-all appearance-none cursor-pointer hover:bg-slate-100"
                            value={labSeleccionado}
                            onChange={(e) => setLabSeleccionado(e.target.value)}
                        >
                            <option value="">Todos los laboratorios</option>
                            {laboratorios.map((lab: any) => (
                                <option key={lab.id} value={lab.id}>{lab.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Estados */}
                    <div className="relative w-full sm:w-auto min-w-[180px]">
                        <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#004B87]/30 focus:border-[#004B87] transition-all appearance-none cursor-pointer hover:bg-slate-100"
                            value={estadoSeleccionado}
                            onChange={(e) => setEstadoSeleccionado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="aprobada">🟢 Aprobadas</option>
                            <option value="pendiente">🟡 Pendientes</option>
                        </select>
                    </div>

                    {/* Toggle Switch Mis Reservas */}
                    <label className="flex items-center gap-3 cursor-pointer group w-full sm:w-auto bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={soloMisReservas}
                                onChange={(e) => setSoloMisReservas(e.target.checked)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${soloMisReservas ? 'bg-[#004B87]' : 'bg-slate-300'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${soloMisReservas ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 select-none flex items-center gap-1.5">
                            <User size={16} className={soloMisReservas ? "text-[#004B87]" : "text-slate-400"} />
                            Mis Reservas
                        </span>
                    </label>
                </div>
            </div>

            {/* CONTENIDO (Calendario o Skeleton) */}
            <div className="flex-1 min-h-[600px] bg-slate-50/30 rounded-3xl z-0 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 bg-white/50 backdrop-blur-sm z-10 rounded-3xl border border-slate-200">
                        <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
                            <Loader2 size={40} className="animate-spin text-[#004B87]" />
                        </div>
                        <p className="font-black tracking-widest uppercase text-slate-400 text-sm animate-pulse">
                            Sincronizando Matriz...
                        </p>
                    </div>
                ) : null}
                <CalendarView events={eventos} />
            </div>
        </div>
    );
}