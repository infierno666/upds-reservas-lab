"use client";

import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

import { ReservaIndividual } from "@/lib/services/admin.service";

interface Conflicto {
    fecha: string;

    bloque_horario_id: number;
}

interface Props {
    reservas: ReservaIndividual[];

    nombreLaboratorio: string;

    disponible: boolean;

    conflictos: Conflicto[];
}

export function AvailabilityCheck({
    reservas,

    nombreLaboratorio,

    disponible,

    conflictos,
}: Props) {
    const total = reservas.length;

    return (
        <div
            className={`
    p-5 rounded-xl border flex gap-4 items-start

    ${disponible
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-amber-50/50 border-amber-200"
                }

    `}
        >
            {disponible ? (
                <CheckCircle size={24} className="text-emerald-600 mt-0.5" />
            ) : (
                <AlertTriangle size={24} className="text-amber-500 mt-0.5" />
            )}

            <div className="flex-1">
                <h4
                    className={`
            font-bold text-base mb-1

            ${disponible ? "text-emerald-800" : "text-amber-800"}

            `}
                >
                    Análisis de Disponibilidad
                </h4>

                {disponible ? (
                    <p
                        className="
            text-sm
            text-emerald-700/80
            font-medium
            "
                    >
                        Los
                        <strong> {total} bloques</strong>
                        solicitados para
                        <strong> {nombreLaboratorio}</strong>
                        están libres.
                    </p>
                ) : (
                    <div className="space-y-3">
                        <p
                            className="
            text-sm
            text-amber-800
            font-medium
            "
                        >
                            Se detectaron conflictos para:
                        </p>

                        <div className="space-y-2">
                            {conflictos.map((c, index) => (
                                <div
                                    key={index}
                                    className="
            flex items-center gap-2
            bg-amber-100
            px-3
            py-2
            rounded-lg
            text-xs
            font-bold
            "
                                >
                                    <Clock size={14} />
                                    Fecha:
                                    {c.fecha}| Bloque:
                                    {c.bloque_horario_id}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
