import { SolicitudGrupo } from "@/lib/services/admin.service";
import { CalendarDays, FlaskConical, User, Clock } from "lucide-react";

interface Props {
    data: SolicitudGrupo;
    isActive: boolean;
    onClick: () => void;
}

export function SolicitudListItem({ data, isActive, onClick }: Props) {
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const diffMins = Math.floor((new Date().getTime() - date.getTime()) / 60000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffHours < 48) return 'Ayer';
        return date.toLocaleDateString();
    };

    // Calculamos los días únicos de este paquete
    const diasUnicos = new Set(data.reservas.map(r => r.fecha)).size;

    return (
        <div
            onClick={onClick}
            className={`p-4 border-b cursor-pointer transition-all duration-200 ${isActive
                    ? 'bg-[#004B87]/5 border-l-4 border-l-[#004B87] shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
        >
            {/* Header de la tarjeta */}
            <div className="flex justify-between items-start mb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    REQ-{data.grupo_id.slice(0, 5)}
                </span>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <Clock size={10} /> {formatTimeAgo(data.fecha_creacion)}
                </span>
            </div>

            {/* Contenido Principal */}
            <div className="mb-3">
                <p className={`text-sm truncate ${isActive ? 'font-black text-[#004B87]' : 'font-bold text-slate-800'}`}>
                    {data.materia_actividad}
                </p>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1 truncate">
                    <User size={13} className="opacity-70" /> {data.docente_nombre}
                </p>
            </div>

            {/* Footer de la tarjeta con pastillas de información */}
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                    <FlaskConical size={13} className="text-[#004B87]" />
                    <span className="truncate max-w-[120px]">{data.laboratorio_nombre}</span>
                </span>

                {/* Indicador visual de volumen (Se pone naranja si pide mucho) */}
                <span className={`text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-md font-bold border ${diasUnicos > 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    <CalendarDays size={12} className={diasUnicos > 5 ? 'text-amber-500' : 'text-slate-400'} />
                    {diasUnicos} Días | {data.total_bloques} blq
                </span>
            </div>
        </div>
    );
}