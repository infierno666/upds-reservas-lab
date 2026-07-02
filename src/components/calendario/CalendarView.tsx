"use client";

import { useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

interface Props {
    events: any[];
}

export default function CalendarView({ events }: Props) {
    const [vista, setVista] = useState("dayGridMonth");

    return (
        <div
            className="
            bg-white
            rounded-3xl
            border
            border-slate-200
            shadow-sm
            p-4
            h-full
            "
        >
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={vista}
                locale="es"
                height="100%"
                headerToolbar={{
                    left: "prev,next today",

                    center: "title",

                    right: "dayGridMonth,timeGridWeek",
                }}
                buttonText={{
                    today: "Hoy",

                    month: "Mes",

                    week: "Semana",
                }}
                events={events}
                eventDisplay="block"
                dayMaxEvents={3}
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                eventClassNames={(arg) => {
                    const estado = arg.event.extendedProps.estado;

                    if (estado === "aprobada") {
                        return ["bg-emerald-500", "border-emerald-600"];
                    }

                    if (estado === "pendiente") {
                        return ["bg-amber-400", "border-amber-500"];
                    }

                    if (estado === "rechazada") {
                        return ["bg-red-400", "border-red-500"];
                    }

                    return ["bg-blue-500", "border-blue-600"];
                }}
            />
        </div>
    );
}
