import { createClient } from "@/lib/supabase/client";
import { ReservaFilters } from "@/types/reserva";

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

export const getMisReservas = async (
    page: number = 1,
    pageSize: number = 10,
    filters?: ReservaFilters
) => {
    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Iniciamos la consulta base
    let query = supabase
        .from('reservas')
        .select(`
            id,
            fecha,
            materia_actividad,
            estado,
            periodo_modulo,
            periodo_anio,
            laboratorios(nombre),
            bloques_horarios(hora_inicio, hora_fin)
        `, { count: 'exact' });

    // Aplicación dinámica de filtros (Patrón arquitectónico de Query Builder)
    if (filters?.estado) query = query.eq('estado', filters.estado);
    if (filters?.laboratorio_id) query = query.eq('laboratorio_id', filters.laboratorio_id);
    if (filters?.modulo) query = query.eq('periodo_modulo', filters.modulo);
    if (filters?.anio) query = query.eq('periodo_anio', filters.anio);
    if (filters?.fecha) query = query.eq('fecha', filters.fecha);

    // Búsqueda por texto (ILIKE es insensible a mayúsculas/minúsculas)
    if (filters?.materia) {
        query = query.ilike('materia_actividad', `%${filters.materia}%`);
    }

    const { data, error, count } = await query
        .order('fecha', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);

    return { data, count };
};

export const cancelarReserva = async (reservaId: string, motivo: string) => {
    const supabase = createClient();

    // Llamada a la función de base de datos 'cancelar_reserva'
    const { error } = await supabase.rpc('cancelar_reserva', {
        p_reserva_id: reservaId,
        p_motivo: motivo
    });

    if (error) throw new Error(error.message);
    return true;
};