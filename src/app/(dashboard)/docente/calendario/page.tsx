"use client";

import { useQuery } from "@tanstack/react-query";

import { useState } from "react";

import CalendarView from "@/components/calendario/CalendarView";

import { getCalendarioReservas } from "@/lib/services/reservaService";

import { Loader2, CalendarDays } from "lucide-react";

export default function CalendarioDocentePage() {
    const [rango, setRango] = useState({
        inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0],

        fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            .toISOString()
            .split("T")[0],
    });

    const { data: eventos = [], isLoading } = useQuery({
        queryKey: ["calendario-docente", rango],

        queryFn: () =>
            getCalendarioReservas(
                rango.inicio,

                rango.fin
            ),
    });

    return (
        <div
            className="
            w-full
            h-full

            flex
            flex-col

            gap-6

            animate-in
            fade-in
            duration-500

            "
        >
            {/* HEADER */}

            <div
                className="
                flex
                items-center
                gap-4
                "
            >
                <div
                    className="
                    p-3
                    rounded-2xl
                    bg-[#001D4A]/10
                    text-[#001D4A]
                    "
                >
                    <CalendarDays size={28} />
                </div>

                <div>
                    <h1
                        className="
                        text-3xl
                        font-black
                        text-slate-900
                        "
                    >
                        Calendario de Reservas
                    </h1>

                    <p
                        className="
                        text-slate-500
                        font-medium
                        "
                    >
                        Consulta tus reservas y disponibilidad de laboratorios.
                    </p>
                </div>
            </div>

            {/* CONTENIDO */}

            <div
                className="
                flex-1
                min-h-0
                "
            >
                {isLoading ? (
                    <div
                        className="
                        h-full

                        flex

                        flex-col

                        justify-center

                        items-center

                        gap-4

                        text-slate-400

                        "
                    >
                        <Loader2
                            size={40}
                            className="
                            animate-spin
                            text-[#001D4A]
                            "
                        />

                        <p className="font-bold">Cargando calendario...</p>
                    </div>
                ) : (
                    <CalendarView events={eventos} />
                )}
            </div>
        </div>
    );
}
