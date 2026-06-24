import { createClient } from "@/lib/supabase/client";

// Tipado estricto alineado al esquema SQL (N:1 devuelve Objetos, no Arreglos)
export interface Solicitud {
    id: string;
    fecha: string;
    materia_actividad: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    created_at: string;
    perfiles: { nombre_completo: string } | null;
    laboratorios: { nombre: string; capacidad: number } | null;
    bloques_horarios: { hora_inicio: string; hora_fin: string; turno: string } | null;
}

export const getSolicitudesPendientes = async (): Promise<Solicitud[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reservas')
        .select(`
            id,
            fecha,
            materia_actividad,
            estado,
            created_at,
            perfiles(nombre_completo),
            laboratorios(nombre, capacidad),
            bloques_horarios(hora_inicio, hora_fin, turno) 
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as any as Solicitud[];
};

export const resolverSolicitud = async (reservaId: string, estado: 'aprobada' | 'rechazada', motivo?: string) => {
    const supabase = createClient();

    const { error } = await supabase.rpc('resolver_solicitud', {
        p_reserva_ids: [reservaId],
        p_nueva_estado: estado,
        p_motivo_rechazo: motivo || null
    });

    if (error) throw new Error(error.message);
    return true;
};