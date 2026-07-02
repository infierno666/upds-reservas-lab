"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { MapPin, Clock, AlertCircle } from "lucide-react";

interface Props {
    events: any[];
}

export default function CalendarView({ events }: Props) {
    const [vista, setVista] = useState("dayGridMonth");

    // Responsividad táctica: Forzar vista de agenda en pantallas pequeñas
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVista("timeGridDay"); // En móviles es imposible leer un mes completo
            } else {
                setVista("dayGridMonth");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 🎨 CUSTOM RENDERER: Aquí diseñamos la tarjeta de cada reserva
    const renderEventContent = (eventInfo: EventContentArg) => {
        const { event, timeText } = eventInfo;
        const { materia, laboratorio, estado } = event.extendedProps;

        // Formateo del texto del estado
        const estadoFormateado = estado ? estado.replace('_', ' ') : 'desconocido';

        return (
            <div className="flex flex-col gap-0.5 p-1.5 w-full h-full overflow-hidden text-slate-800">
                <div className="flex items-center justify-between gap-1 opacity-70">
                    <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                        <Clock size={9} /> {timeText}
                    </span>
                </div>
                <div className="text-[10px] sm:text-xs font-bold leading-tight truncate">
                    {materia || "Sin materia"}
                </div>
                <div className="text-[9px] sm:text-[10px] font-medium leading-tight truncate flex items-center gap-1 opacity-80">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{laboratorio || "Sin laboratorio"}</span>
                </div>
                {/* Badge de estado solo visible en vistas amplias (semanal/diaria) */}
                {vista !== "dayGridMonth" && (
                    <div className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider opacity-80">
                        <AlertCircle size={10} /> {estadoFormateado}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-2.5 sm:p-4 md:p-6 flex flex-col h-full min-h-[480px] sm:min-h-[600px] w-full max-w-full overflow-x-hidden">

            {/* LEYENDA DE COLORES */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
                <span className="w-full md:w-auto text-center md:text-left text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Leyenda:</span>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-slate-600">
                    <div className="w-3 h-3 shrink-0 rounded-[4px] bg-emerald-100 border-l-2 border-emerald-500"></div> Aprobada
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-slate-600">
                    <div className="w-3 h-3 shrink-0 rounded-[4px] bg-amber-100 border-l-2 border-amber-500"></div> Pendiente
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-slate-600">
                    <div className="w-3 h-3 shrink-0 rounded-[4px] bg-purple-100 border-l-2 border-purple-500"></div> Modificación
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-slate-600">
                    <div className="w-3 h-3 shrink-0 rounded-[4px] bg-red-100 border-l-2 border-red-500"></div> Rechazada
                </div>
            </div>

            {/* FULLCALENDAR */}
            <div className="flex-1 min-h-[420px] sm:min-h-[500px] w-full overflow-hidden calendar-wrapper">
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
                    eventContent={renderEventContent}
                    dayMaxEvents={3} // Mostrar popover "+X más" si hay muchas reservas
                    slotMinTime="07:00:00"
                    slotMaxTime="22:30:00"
                    allDaySlot={false}
                    expandRows={true}
                    stickyHeaderDates={true}
                    // Estilos SaaS Soft-UI inyectados directamente al core de FullCalendar
                    eventClassNames={(arg) => {
                        const estado = arg.event.extendedProps.estado;
                        const baseClasses = "!rounded-r-md !rounded-l-sm !border-y-0 !border-r-0 !border-l-[3px] !shadow-sm transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer !m-0.5";

                        if (estado === "aprobada") return [`${baseClasses} !bg-emerald-50/80 !border-emerald-500 hover:!bg-emerald-100`];
                        if (estado === "pendiente") return [`${baseClasses} !bg-amber-50/80 !border-amber-500 hover:!bg-amber-100`];
                        if (estado === "pendiente_modificacion") return [`${baseClasses} !bg-purple-50/80 !border-purple-500 hover:!bg-purple-100`];
                        if (estado === "rechazada") return [`${baseClasses} !bg-red-50/80 !border-red-500 hover:!bg-red-100`];
                        if (estado === "cancelada") return [`${baseClasses} !bg-slate-100/80 !border-slate-400 hover:!bg-slate-200`];

                        return [`${baseClasses} !bg-blue-50/80 !border-blue-500`];
                    }}
                />
            </div>

            {/* Estilos responsivos inyectados al core de FullCalendar (no se puede tocar vía Tailwind) */}
            <style jsx global>{`
                /* --- Toolbar: evita overflow y quiebre feo en pantallas chicas --- */
                .calendar-wrapper .fc-header-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    row-gap: 0.6rem;
                    column-gap: 0.75rem;
                    margin-bottom: 1rem !important;
                }
                .calendar-wrapper .fc-toolbar-chunk {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 0.35rem;
                }
                .calendar-wrapper .fc-toolbar-title {
                    font-size: clamp(0.95rem, 2.5vw, 1.25rem);
                    font-weight: 800;
                    color: #0f172a;
                    white-space: nowrap;
                }
                .calendar-wrapper .fc-button {
                    background: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    color: #334155 !important;
                    font-weight: 700 !important;
                    font-size: 0.75rem !important;
                    padding: 0.4rem 0.7rem !important;
                    box-shadow: none !important;
                    text-transform: capitalize;
                    line-height: 1.1;
                }
                .calendar-wrapper .fc-button:hover {
                    background: #f1f5f9 !important;
                }
                .calendar-wrapper .fc-button:focus-visible {
                    outline: 2px solid #004b87 !important;
                    outline-offset: 1px;
                }
                .calendar-wrapper .fc-button-primary:not(:disabled).fc-button-active,
                .calendar-wrapper .fc-button-primary:not(:disabled):active {
                    background: #004b87 !important;
                    border-color: #004b87 !important;
                    color: #fff !important;
                }
                .calendar-wrapper .fc-icon {
                    font-size: 1em;
                }

                /* --- Scrollbars finos y consistentes en el grid horario --- */
                .calendar-wrapper .fc-scroller {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                    -webkit-overflow-scrolling: touch;
                }
                .calendar-wrapper .fc-scroller::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .calendar-wrapper .fc-scroller::-webkit-scrollbar-track {
                    background: transparent;
                }
                .calendar-wrapper .fc-scroller::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 999px;
                }
                .calendar-wrapper .fc-scroller::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }

                /* --- Popover "+X más" adaptado a pantallas chicas --- */
                .calendar-wrapper .fc-popover {
                    max-width: 90vw;
                    border-radius: 0.75rem !important;
                    overflow: hidden;
                    box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.25) !important;
                }
                .calendar-wrapper .fc-popover-header {
                    background: #f8fafc !important;
                    font-weight: 700;
                }

                /* --- Ajustes tablet / móvil --- */
                @media (max-width: 767px) {
                    .calendar-wrapper .fc-header-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .calendar-wrapper .fc-toolbar-title {
                        text-align: center;
                        order: -1;
                    }
                    .calendar-wrapper .fc-button {
                        padding: 0.4rem 0.6rem !important;
                        font-size: 0.7rem !important;
                    }
                }

                @media (max-width: 480px) {
                    .calendar-wrapper .fc-col-header-cell-cushion,
                    .calendar-wrapper .fc-daygrid-day-number {
                        font-size: 0.7rem;
                    }
                    .calendar-wrapper .fc-button {
                        padding: 0.35rem 0.5rem !important;
                        font-size: 0.65rem !important;
                    }
                }
            `}</style>
        </div>
    );
}