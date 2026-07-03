"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CalendarView from "@/components/calendario/CalendarView";
import { getCalendarioReservas, getLaboratorios } from "@/lib/services/reservaService";
import { Loader2, CalendarDays, Filter, MapPin, CheckCircle2, User, ChevronDown, Clock3 } from "lucide-react";

export default function CalendarioDocentePage() {
    const [rango, setRango] = useState({
        inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    });

    const [labSeleccionado, setLabSeleccionado] = useState<string>("");
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("");
    const [turnoSeleccionado, setTurnoSeleccionado] = useState<string>("");
    const [soloMisReservas, setSoloMisReservas] = useState<boolean>(false);

    const { data: laboratorios = [] } = useQuery({
        queryKey: ["cat-laboratorios"],
        queryFn: getLaboratorios,
    });

    const { data: eventos = [], isLoading } = useQuery({
        queryKey: ["calendario-docente", rango, labSeleccionado, estadoSeleccionado, turnoSeleccionado, soloMisReservas],
        queryFn: () => getCalendarioReservas(rango.inicio, rango.fin, {
            laboratorioId: labSeleccionado || undefined,
            estado: estadoSeleccionado || undefined,
            turno: turnoSeleccionado || undefined,
            soloMisReservas
        }),
    });

    return (
        // Removido min-h-screen, h-full y los paddings innecesarios.
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-[#004B87]/10 text-[#004B87] shadow-inner shrink-0">
                    <CalendarDays size={24} className="sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">
                        Calendario de Reservas
                    </h1>
                    <p className="text-[11px] sm:text-sm text-slate-500 font-medium mt-0.5 truncate">
                        Supervise la disponibilidad y ocupación institucional.
                    </p>
                </div>
            </div>

            {/* BARRA DE FILTROS RESPONSIVA */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center w-full">
                <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-1 lg:mb-0 shrink-0">
                    <Filter size={16} className="text-[#004B87]" /> Filtros
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">

                    <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-8 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#004B87]/30 transition-all appearance-none cursor-pointer hover:bg-slate-100"
                            value={labSeleccionado}
                            onChange={(e) => setLabSeleccionado(e.target.value)}
                        >
                            <option value="">Todos los laboratorios</option>
                            {laboratorios.map((lab: any) => (
                                <option key={lab.id} value={lab.id}>{lab.nombre}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                        <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-8 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#004B87]/30 transition-all appearance-none cursor-pointer hover:bg-slate-100"
                            value={estadoSeleccionado}
                            onChange={(e) => setEstadoSeleccionado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            <option value="aprobada">🟢 Aprobadas</option>
                            <option value="pendiente">🟡 Pendientes</option>
                            <option value="pendiente_modificacion">🟣 Modificaciones</option>
                            <option value="rechazada">🔴 Rechazadas</option>
                            <option value="cancelada">⚪ Canceladas</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative w-full sm:w-auto sm:min-w-[170px]">
                        <Clock3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-8 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#004B87]/30 transition-all appearance-none cursor-pointer hover:bg-slate-100"
                            value={turnoSeleccionado}
                            onChange={(e) => setTurnoSeleccionado(e.target.value)}
                        >
                            <option value="">Todos los turnos</option>
                            <option value="mañana">🌅 Mañana</option>
                            <option value="mediodia">☀️ Mediodía</option>
                            <option value="tarde">🌇 Tarde</option>
                            <option value="noche">🌙 Noche</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <label className="flex items-center justify-between sm:justify-start gap-3 cursor-pointer group w-full sm:w-auto bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-bold text-slate-700 select-none flex items-center gap-1.5 shrink-0">
                            <User size={16} className={soloMisReservas ? "text-[#004B87]" : "text-slate-400"} />
                            Mis Reservas
                        </span>
                        <div className="relative flex items-center shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={soloMisReservas}
                                onChange={(e) => setSoloMisReservas(e.target.checked)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${soloMisReservas ? 'bg-[#004B87]' : 'bg-slate-300'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${soloMisReservas ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>

                </div>
            </div>

            {/* CONTENIDO DEL CALENDARIO: Ahora con alturas fijas estrictas para que FullCalendar no colapse */}
            <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl z-0 relative flex flex-col overflow-hidden shadow-sm">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 bg-white/60 backdrop-blur-sm z-20">
                        <div className="p-4 bg-white rounded-full shadow-lg border border-slate-100">
                            <Loader2 size={36} className="animate-spin text-[#004B87]" />
                        </div>
                        <p className="font-black tracking-widest uppercase text-[#004B87] text-xs animate-pulse">
                            Sincronizando...
                        </p>
                    </div>
                )}

                <div className="flex-1 w-full h-full p-2 sm:p-4">
                    <CalendarView events={eventos} />
                </div>
            </div>
        </div>
    );
}