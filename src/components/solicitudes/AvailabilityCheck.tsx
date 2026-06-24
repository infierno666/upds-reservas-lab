import { Info } from "lucide-react";

interface Props {
    isAvailable: boolean;
    nombreLaboratorio?: string;
}

export function AvailabilityCheck({ isAvailable, nombreLaboratorio = "laboratorio solicitado" }: Props) {
    return (
        <div className={`p-4 rounded-xl border flex gap-3 items-start ${isAvailable ? 'bg-[#EEF2FF] border-[#E0E7FF]' : 'bg-red-50 border-red-200'
            }`}>
            <Info size={20} className={`mt-0.5 shrink-0 ${isAvailable ? 'text-[#4F46E5]' : 'text-red-600'}`} />
            <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-1">
                    Análisis de Disponibilidad
                </h4>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                    {isAvailable ? (
                        <>El <strong>{nombreLaboratorio}</strong> se encuentra <strong>disponible</strong> en el horario solicitado. No hay conflictos con otras materias o mantenimientos programados.</>
                    ) : (
                        <>¡Alerta! El <strong>{nombreLaboratorio}</strong> presenta un conflicto de horarios con otra reserva aprobada o un bloqueo de mantenimiento.</>
                    )}
                </p>
            </div>
        </div>
    );
}