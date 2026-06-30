"use client";

import { Info, AlertTriangle, CheckCircle } from "lucide-react";
import { ReservaIndividual } from "@/lib/services/admin.service";

interface Props {
    reservas: ReservaIndividual[];
    nombreLaboratorio: string;
    // En un caso real, esto vendría validado desde el backend.
    // Aquí simularemos que podemos recibir un array de IDs conflictivos.
    conflictosIds?: string[];
}

export function AvailabilityCheck({ reservas, nombreLaboratorio, conflictosIds = [] }: Props) {
    const total = reservas.length;
    const conConflicto = conflictosIds.length;
    const isTotalmenteLibre = conConflicto === 0;

    return (
        <div className={`p-5 rounded-xl border flex gap-4 items-start transition-colors ${isTotalmenteLibre
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-amber-50/50 border-amber-200'
            }`}>
            {isTotalmenteLibre ? (
                <CheckCircle size={24} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : (
                <AlertTriangle size={24} className="mt-0.5 shrink-0 text-amber-500" />
            )}

            <div className="flex-1">
                <h4 className={`font-bold text-base mb-1 ${isTotalmenteLibre ? 'text-emerald-800' : 'text-amber-800'}`}>
                    Análisis de Disponibilidad
                </h4>

                {isTotalmenteLibre ? (
                    <p className="text-sm text-emerald-700/80 leading-relaxed font-medium">
                        Los <strong>{total} bloques</strong> solicitados para el <strong>{nombreLaboratorio}</strong> se encuentran totalmente libres. No hay cruces de horarios ni mantenimientos programados.
                    </p>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
                            ¡Atención! Se detectaron conflictos en <strong>{conConflicto} de los {total} bloques</strong> solicitados para el {nombreLaboratorio}.
                        </p>
                        <p className="text-xs text-amber-700 font-semibold bg-amber-100/50 inline-block px-2 py-1 rounded-md border border-amber-200">
                            Recomendación: Usa la "Aprobación Parcial" para descartar los días ocupados.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}