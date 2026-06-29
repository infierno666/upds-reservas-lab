import { createClient } from "@/lib/supabase/client";
import { ReservaFilters } from "@/types/reserva";

// =========================================================================
// 1. CATÁLOGOS DEL SISTEMA
// =========================================================================

export const getLaboratorios = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('laboratorios')
        .select('id, nombre, capacidad')
        .order('nombre', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const getBloquesHorarios = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('bloques_horarios')
        .select('*')
        .order('hora_inicio', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

// =========================================================================
// 2. MOTOR DE DISPONIBILIDAD
// =========================================================================

export const getDisponibilidadRango = async (laboratorioId: string, fechaInicio: string, fechaFin: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('vista_disponibilidad_publica')
        .select('fecha, bloque_horario_id, estado')
        .eq('laboratorio_id', laboratorioId)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

    if (error) throw new Error(error.message);
    return data || [];
};

// =========================================================================
// 3. CREACIÓN DE RESERVAS (DOCENTES)
// =========================================================================

export const crearReservaMasiva = async (solicitudMasiva: {
    laboratorio_id: string;
    fechas: string[];
    materia_actividad: string; // TEXTO
    periodo_modulo: number;
    periodo_anio: number;
    bloques_ids: number[];
}) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada. Inicie sesión nuevamente.");

    if (solicitudMasiva.fechas.length === 0) {
        throw new Error("Debe seleccionar al menos una fecha.");
    }

    const promesas = solicitudMasiva.fechas.map(async (fecha) => {
        // ENVIAMOS LOS PARÁMETROS EXACTOS DEL SCRIPT SQL
        const { data, error } = await supabase.rpc('solicitar_reserva', {
            p_laboratorio_id: solicitudMasiva.laboratorio_id,
            p_fecha: fecha,
            p_bloques_horario_ids: solicitudMasiva.bloques_ids,
            p_periodo_modulo: solicitudMasiva.periodo_modulo,
            p_periodo_anio: solicitudMasiva.periodo_anio,
            p_materia_actividad: solicitudMasiva.materia_actividad // LLAVE CORREGIDA
        });

        if (error) throw new Error(`Error en fecha ${fecha}: ${error.message}`);
        return { fecha, data };
    });

    const resultados = await Promise.all(promesas);

    let colisiones: string[] = [];
    resultados.forEach(res => {
        const rechazadas = res.data?.filter((r: any) => r.resultado === 'rechazada_por_duplicidad');
        if (rechazadas && rechazadas.length > 0) {
            colisiones.push(res.fecha);
        }
    });

    if (colisiones.length > 0) {
        throw new Error(`Hubo colisión de horarios en las fechas: ${colisiones.join(', ')}.`);
    }

    return resultados;
};

// =========================================================================
// 4. GESTIÓN Y AUDITORÍA
// =========================================================================

export const getMisReservas = async (
    page: number = 1,
    pageSize: number = 10,
    filters?: ReservaFilters
) => {
    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('reservas')
        .select(`
            id,
            grupo_solicitud_id,
            fecha,
            estado,
            periodo_modulo,
            periodo_anio,
            materia_actividad, 
            laboratorios(nombre),
            bloques_horarios(hora_inicio, hora_fin)
        `, { count: 'exact' });

    if (filters?.estado) query = query.eq('estado', filters.estado);
    if (filters?.laboratorio_id) query = query.eq('laboratorio_id', filters.laboratorio_id);
    if (filters?.modulo) query = query.eq('periodo_modulo', filters.modulo);
    if (filters?.anio) query = query.eq('periodo_anio', filters.anio);
    if (filters?.fecha) query = query.eq('fecha', filters.fecha);
    if (filters?.materia_actividad) query = query.ilike('materia_actividad', `%${filters.materia_actividad}%`);

    const { data, error, count } = await query
        .order('fecha', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);
    return { data, count };
};

export const cancelarReserva = async (reservaId: string, motivo: string) => {
    const supabase = createClient();
    const { error } = await supabase.rpc('cancelar_reserva', {
        p_reserva_id: reservaId,
        p_motivo: motivo
    });
    if (error) throw new Error(error.message);
    return true;
};

export const cancelarGrupoReservas = async (grupoId: string, motivo: string) => {
    const supabase = createClient();

    // 1. Obtenemos todas las reservas de ese grupo
    const { data: reservas, error: fetchError } = await supabase
        .from('reservas')
        .select('id')
        .eq('grupo_solicitud_id', grupoId);

    if (fetchError) throw new Error(fetchError.message);

    // 2. Cancelamos cada una de ellas
    const promesas = reservas.map((res: any) =>
        cancelarReserva(res.id, motivo)
    );

    return Promise.all(promesas);
};

export const resolverSolicitud = async (solicitud: { reserva_ids: string[], nuevo_estado: 'aprobada' | 'rechazada', motivo_rechazo?: string }) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('resolver_solicitud', {
        p_reserva_ids: solicitud.reserva_ids,
        p_nueva_estado: solicitud.nuevo_estado,
        p_motivo_rechazo: solicitud.motivo_rechazo || null
    });
    if (error) throw new Error(error.message);
    return data;
};

// Función para editar reservas pendientes
export const actualizarReserva = async (reservaId: string, nuevosDatos: {
    fecha?: string;
    bloque_horario_id?: number;
    materia_actividad?: string;
}) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reservas')
        .update({
            fecha: nuevosDatos.fecha,
            bloque_horario_id: nuevosDatos.bloque_horario_id,
            materia_actividad: nuevosDatos.materia_actividad,
            updated_at: new Date().toISOString()
        })
        .eq('id', reservaId)
        .eq('estado', 'pendiente'); // SEGURIDAD: Solo permite editar si sigue pendiente

    if (error) throw new Error(error.message);
    return data;
};