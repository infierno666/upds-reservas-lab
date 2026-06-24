import { Solicitud } from "@/lib/services/admin.service";
import { Calendar } from "lucide-react";

interface Props {
    data: Solicitud;
    isActive: boolean;
    onClick: () => void;
}

export function SolicitudListItem({ data, isActive, onClick }: Props) {
    // Extracción segura a prueba de fallos (Objeto vs Arreglo)
    const getSafeValue = (field: any) => Array.isArray(field) ? field[0] : field;

    const perfil = getSafeValue(data.perfiles);
    const lab = getSafeValue(data.laboratorios);

    const docenteNombre = perfil?.nombre_completo ?? "Docente desconocido";
    const labNombre = lab?.nombre ?? "Sin laboratorio";

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

    return (
        <div
            onClick={onClick}
            className={`p-4 border-b cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-900' : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
        >
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    {!isActive && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>}
                    <p className={`text-sm truncate ${isActive ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {docenteNombre}
                    </p>
                </div>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap ml-2">
                    {formatTimeAgo(data.created_at)}
                </span>
            </div>

            <div className="flex items-center gap-2 ml-4 mb-2.5 text-[13px] text-slate-500">
                <span className="font-medium truncate">{labNombre}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {data.fecha}</span>
            </div>

            <div className="ml-4 flex flex-wrap gap-2">
                <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium truncate max-w-[140px]">
                    {data.materia_actividad}
                </span>
                <span className="text-[11px] bg-[#FFF8E1] text-yellow-700 px-2 py-0.5 rounded font-medium capitalize">
                    {data.estado}
                </span>
            </div>
        </div>
    );
}