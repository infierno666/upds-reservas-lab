"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Props {
    events: any[];
}

export default function CalendarView({ events }: Props) {
    const [vista, setVista] = useState("dayGridMonth");

    // Responsividad: Cambiar a lista/agenda en móviles si es necesario (opcional)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVista("timeGridDay"); // En celular, mostrar día por defecto
            } else {
                setVista("dayGridMonth"); // En PC, mostrar mes
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col h-full min-h-[600px]">

            {/* LEYENDA DE COLORES UX */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leyenda:</span>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div> Aprobada
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500"></div> Pendiente
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div> Rechazada
                </div>
            </div>

            {/* CONTENEDOR FULLCALENDAR */}
            <div className="flex-1 min-h-0 calendar-wrapper">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={vista}
                    locale="es"
                    height="100%"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    buttonText={{
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día"
                    }}
                    events={events}
                    eventDisplay="block"
                    dayMaxEvents={3}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    eventClassNames={(arg) => {
                        const estado = arg.event.extendedProps.estado;
                        if (estado === "aprobada") return ["bg-emerald-500 text-white border-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-600 transition-colors"];
                        if (estado === "pendiente") return ["bg-amber-400 text-amber-950 border-amber-500 shadow-sm cursor-pointer hover:bg-amber-500 transition-colors"];
                        if (estado === "rechazada") return ["bg-red-400 text-white border-red-500 shadow-sm cursor-pointer hover:bg-red-500 transition-colors"];
                        return ["bg-blue-500 text-white border-blue-600"];
                    }}
                />
            </div>
        </div>
    );
}