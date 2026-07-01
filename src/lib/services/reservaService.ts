import { createClient } from "@/lib/supabase/client";
import { ReservaFilters } from "@/types/reserva";

// =========================================================================
// 1. CATÁLOGOS DEL SISTEMA
// =========================================================================

export const getLaboratorios = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('laboratorios')
        .select(`
            id,
            nombre,
            capacidad,
            caracteristicas,
            estado_operativo
        `)
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

// NUEVO: Obtenemos las materias de la tabla 'materias'
export const getMaterias = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('materias')
        .select('id, nombre')
        .order('nombre', { ascending: true });

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
    materia_id: string; // <-- AHORA USAMOS EL ID DE LA MATERIA
    periodo_modulo: number;
    periodo_anio: number;
    selecciones: { fecha: string; bloqueId: number }[];
}) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada. Inicie sesión nuevamente.");

    if (!solicitudMasiva.selecciones || solicitudMasiva.selecciones.length === 0) {
        throw new Error("Debe seleccionar al menos un bloque.");
    }

    // MAGIA: Generamos UN SOLO ID para toda la solicitud
    const grupoSolicitudId = crypto.randomUUID();

    // Agrupamos los bloques por fecha
    const agrupadoPorFecha = solicitudMasiva.selecciones.reduce((acc, curr) => {
        if (!acc[curr.fecha]) acc[curr.fecha] = [];
        acc[curr.fecha].push(curr.bloqueId);
        return acc;
    }, {} as Record<string, number[]>);

    // Lanzamos las peticiones usando el mismo grupoSolicitudId para todas
    const promesas = Object.entries(agrupadoPorFecha).map(async ([fecha, bloquesIds]) => {
        const { data, error } = await supabase.rpc('solicitar_reserva', {
            p_laboratorio_id: solicitudMasiva.laboratorio_id,
            p_fecha: fecha,
            p_bloques_horario_ids: bloquesIds,
            p_periodo_modulo: solicitudMasiva.periodo_modulo,
            p_periodo_anio: solicitudMasiva.periodo_anio,
            p_materia_id: solicitudMasiva.materia_id, // Enviamos el ID relacional
            p_grupo_id: grupoSolicitudId // Enviamos el ID agrupador
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
    pageSize: number = 50,
    filters?: any
) => {
    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const stringQuery = filters?.materia_actividad
        ? "id, grupo_solicitud_id, fecha, estado, periodo_modulo, periodo_anio, created_at, laboratorio_id, materia_id, asistencia_confirmada, asistencia_resuelta_por_timeout, laboratorios(nombre), bloques_horarios(turno, periodo, hora_inicio, hora_fin), materias!inner(id, nombre)"
        : "id, grupo_solicitud_id, fecha, estado, periodo_modulo, periodo_anio, created_at, laboratorio_id, materia_id, asistencia_confirmada, asistencia_resuelta_por_timeout, laboratorios(nombre), bloques_horarios(turno, periodo, hora_inicio, hora_fin), materias(id, nombre)";
    let query = supabase
        .from('reservas')
        .select(stringQuery, { count: 'exact' });

    // Aplicación de Filtros Estrictos
    if (filters?.estado) query = query.eq('estado', filters.estado);
    if (filters?.laboratorio_id) query = query.eq('laboratorio_id', filters.laboratorio_id);

    // Filtro por fecha en la que se HIZO la solicitud
    if (filters?.fecha) {
        query = query
            .gte('created_at', `${filters.fecha}T00:00:00.000Z`)
            .lte('created_at', `${filters.fecha}T23:59:59.999Z`);
    }

    // Búsqueda parcial por el nombre real de la asignatura en la tabla relacional
    if (filters?.materia_actividad) {
        query = query.ilike('materias.nombre', `%${filters.materia_actividad}%`);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);
    return { data, count };
};

export const getMisReservasRango = async (
    laboratorioId: string,
    inicio: string,
    fin: string
) => {


    const supabase = createClient();


    const { data, error } = await supabase
        .from("reservas")
        .select(`
    id,
    fecha,
    bloque_horario_id,
    estado,
    laboratorio_id
`)
        .eq(
            "laboratorio_id",
            laboratorioId
        )
        .gte(
            "fecha",
            inicio
        )
        .lte(
            "fecha",
            fin
        );


    if (error)
        throw new Error(error.message);


    return data;


}

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
    const { data: reservas, error: fetchError } = await supabase
        .from('reservas')
        .select('id')
        .eq('grupo_solicitud_id', grupoId);

    if (fetchError) throw new Error(fetchError.message);

    const promesas = reservas.map((res: any) => cancelarReserva(res.id, motivo));
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
    materia_id?: string;
}) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reservas')
        .update({
            fecha: nuevosDatos.fecha,
            bloque_horario_id: nuevosDatos.bloque_horario_id,
            materia_id: nuevosDatos.materia_id, // ACTUALIZADO A MATERIA_ID
            updated_at: new Date().toISOString()
        })
        .eq('id', reservaId)
        .eq('estado', 'pendiente');

    if (error) throw new Error(error.message);
    return data;
};

// =========================================================================
// 5. MODO EDICIÓN (REEMPLAZO ATÓMICO Y MODIFICACIONES)
// =========================================================================

// Recupera los bloques exactos que el docente seleccionó en el pasado
export const getReservasPorGrupo = async (grupoId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reservas')
        .select('id, fecha, bloque_horario_id, materia_id, laboratorio_id, periodo_modulo, periodo_anio')
        .eq('grupo_solicitud_id', grupoId);

    if (error) throw new Error(error.message);
    return data;
};

// Reemplazo Atómico con Pre-Validación en Memoria (Para grupos pendientes)
export const actualizarGrupoPendiente = async (
    grupoId: string,
    solicitudMasiva: {
        laboratorio_id: string;
        materia_id: string;
        periodo_modulo: number;
        periodo_anio: number;
        selecciones: { fecha: string; bloqueId: number }[];
    }
) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada. Inicie sesión nuevamente.");

    if (!solicitudMasiva.selecciones || solicitudMasiva.selecciones.length === 0) {
        throw new Error("Debe seleccionar al menos un bloque.");
    }

    // 1. PRE-VALIDACIÓN (A prueba de balas)
    const fechasUnicas = Array.from(new Set(solicitudMasiva.selecciones.map(s => s.fecha)));
    fechasUnicas.sort();
    const fechaInicio = fechasUnicas[0];
    const fechaFin = fechasUnicas[fechasUnicas.length - 1];

    const { data: ocupados } = await supabase
        .from('reservas')
        .select('fecha, bloque_horario_id, grupo_solicitud_id')
        .eq('laboratorio_id', solicitudMasiva.laboratorio_id)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .in('estado', ['pendiente', 'aprobada', 'pendiente_modificacion']);

    // Uso de String() para garantizar igualdad estricta
    const colisionesReales = solicitudMasiva.selecciones.filter(seleccion => {
        return ocupados?.some(ocupado =>
            ocupado.fecha === seleccion.fecha &&
            String(ocupado.bloque_horario_id) === String(seleccion.bloqueId) &&
            String(ocupado.grupo_solicitud_id).toLowerCase() !== String(grupoId).toLowerCase()
        );
    });

    if (colisionesReales.length > 0) {
        throw new Error(`Los siguientes horarios ya no están disponibles: ${colisionesReales.map(c => `${c.fecha} (Bloque ${c.bloqueId})`).join(', ')}`);
    }

    // 2. LIMPIEZA SEGURA (Ahora permitida por la nueva política SQL)
    const { error: deleteError } = await supabase
        .from('reservas')
        .delete()
        .eq('grupo_solicitud_id', grupoId)
        .eq('estado', 'pendiente');

    if (deleteError) throw new Error("Error de permisos al limpiar configuración previa: " + deleteError.message);

    // 3. RE-INSERCIÓN AGRUPADA
    const agrupadoPorFecha = solicitudMasiva.selecciones.reduce((acc, curr) => {
        if (!acc[curr.fecha]) acc[curr.fecha] = [];
        acc[curr.fecha].push(curr.bloqueId);
        return acc;
    }, {} as Record<string, number[]>);

    const promesas = Object.entries(agrupadoPorFecha).map(async ([fecha, bloquesIds]) => {
        const { data, error } = await supabase.rpc('solicitar_reserva', {
            p_laboratorio_id: solicitudMasiva.laboratorio_id,
            p_fecha: fecha,
            p_bloques_horario_ids: bloquesIds,
            p_periodo_modulo: solicitudMasiva.periodo_modulo,
            p_periodo_anio: solicitudMasiva.periodo_anio,
            p_materia_id: solicitudMasiva.materia_id,
            p_grupo_id: grupoId
        });

        if (error) throw new Error(`Error en fecha ${fecha}: ${error.message}`);
        return { fecha, data };
    });

    return await Promise.all(promesas);
};

// Función para modificar UNA reserva aprobada
export const solicitarModificacionAprobada = async (reservaId: string, nuevaFecha: string, nuevoBloqueId: number) => {
    const supabase = createClient();
    const { error } = await supabase.rpc('solicitar_modificacion_reserva', {
        p_reserva_id: reservaId,
        p_nueva_fecha: nuevaFecha,
        p_nuevo_bloque_horario_id: nuevoBloqueId
    });

    if (error) throw new Error(error.message);
    return true;
};

// Confirma si el docente usó o no su reserva aprobada
export const confirmarAsistencia = async (
    reservaId: string,
    usoConfirmado: boolean
): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.rpc('confirmar_uso_reserva', {
        p_reserva_id: reservaId,
        p_uso_confirmado: usoConfirmado,
        p_descripcion_reporte: null,
    });
    if (error) throw new Error(error.message);
};