import { Badge } from "@/components/ui/badge";

interface Props {
    estado: 'aprobada' | 'pendiente' | 'rechazada' | 'cancelada' | 'pendiente_modificacion';
}

export const StatusBadge = ({ estado }: Props) => {
    const styles: Record<string, string> = {
        aprobada: "bg-green-100 text-green-700 border-green-200",
        pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
        rechazada: "bg-red-100 text-red-700 border-red-200",
        cancelada: "bg-slate-100 text-slate-600 border-slate-200",
        pendiente_modificacion: "bg-blue-100 text-blue-700 border-blue-200"
    };

    return (
        <Badge variant="outline" className={`${styles[estado] || "bg-slate-100"} capitalize px-3 py-1 font-medium`}>
            {estado.replace('_', ' ')}
        </Badge>
    );
};