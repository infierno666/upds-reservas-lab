import { createClient } from "@/lib/supabase/client";

// 1. Obtener Catálogo de Laboratorios
export const getLaboratorios = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('laboratorios')
        .select('id, nombre, capacidad')
        .order('nombre', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

// 2. Obtener Catálogo de Bloques Horarios
export const getBloquesHorarios = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bloques_horarios')
        .select('*')
        .order('hora_inicio', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

// 3. Obtener Disponibilidad (El Motor del Calendario)
export const getDisponibilidad = async (laboratorioId: string, fecha: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('vista_disponibilidad_publica')
        .select('bloque_horario_id, estado')
        .eq('laboratorio_id', laboratorioId)
        .eq('fecha', fecha);

    if (error) throw new Error(error.message);
    return data || [];
};

// 4. NUEVO: Llamada al RPC de Nicolás para procesar la reserva completa
export const crearSolicitudReserva = async (solicitud: {
    laboratorio_id: string;
    fecha: string;
    materia_actividad: string;
    periodo_modulo: number;
    periodo_anio: number;
    bloques_ids: number[];
}) => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada. Inicie sesión nuevamente.");

    // Usamos el Stored Procedure 'solicitar_reserva' definido en el SQL
    const { data, error } = await supabase.rpc('solicitar_reserva', {
        p_laboratorio_id: solicitud.laboratorio_id,
        p_fecha: solicitud.fecha,
        p_bloques_horario_ids: solicitud.bloques_ids,
        p_periodo_modulo: solicitud.periodo_modulo,
        p_periodo_anio: solicitud.periodo_anio,
        p_materia_actividad: solicitud.materia_actividad
    });

    if (error) {
        throw new Error(error.message);
    }

    // La función RPC de Nicolás devuelve una tabla con el 'resultado' de cada bloque.
    // Verificamos si la base de datos lo rechazó por duplicidad exacta
    const rechazadas = data?.filter((r: any) => r.resultado === 'rechazada_por_duplicidad');
    if (rechazadas && rechazadas.length > 0) {
        throw new Error("Colisión de horarios: Uno de los bloques seleccionados acaba de ser reservado por otro usuario.");
    }

    return data;
};