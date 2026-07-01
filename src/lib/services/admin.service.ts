import { createClient } from "@/lib/supabase/client";

// ============================================================================
// 1. INTERFACES DE TIPADO ESTRICTO
// ============================================================================

export interface ReservaIndividual {
    id: string;
    fecha: string;
    bloque_horario_id: number;
    bloques_horarios: { id: number; hora_inicio: string; hora_fin: string; turno: string } | null;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
}

export interface SolicitudGrupo {
    grupo_id: string;
    docente_nombre: string;
    materia_actividad: string;
    laboratorio_nombre: string;
    fecha_creacion: string;
    estado_global: string;
    total_bloques: number;
    reservas: ReservaIndividual[]; // Aquí guardamos el detalle de todas las fechas
}
export interface TramiteProcesado {
    aprobadosIds: string[];
    rechazadosIds: string[];
    motivoRechazo: string;
    nuevaMateria: string;
    nuevoLaboratorioNombre: string; // En producción idealmente enviaríamos nuevoLaboratorioId
}

// ============================================================================
// 2. OBTENCIÓN AGRUPADA (Data lista para consumir en la UI)
// ============================================================================
export const getSolicitudesPendientes = async (): Promise<SolicitudGrupo[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('reservas')
        .select(`
            id,
            grupo_solicitud_id,
            fecha,
            materia_actividad,
            estado,
            created_at,
            bloque_horario_id,
            perfiles(nombre_completo),
            laboratorios(nombre, capacidad),
            bloques_horarios(id, hora_inicio, hora_fin, turno),
            materias(nombre)
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // MAGIA ARQUITECTÓNICA: Agrupamos las filas por grupo_solicitud_id
    const map = (data || []).reduce((acc: any, curr: any) => {
        const grupoId = curr.grupo_solicitud_id;

        // Extracción segura (resuelve si Supabase lo manda como objeto o arreglo)
        const docente = Array.isArray(curr.perfiles) ? curr.perfiles[0]?.nombre_completo : curr.perfiles?.nombre_completo;
        const lab = Array.isArray(curr.laboratorios) ? curr.laboratorios[0]?.nombre : curr.laboratorios?.nombre;
        const materia = curr.materias?.nombre || curr.materia_actividad;

        if (!acc[grupoId]) {
            acc[grupoId] = {
                grupo_id: grupoId,
                docente_nombre: docente || 'Desconocido',
                materia_actividad: materia || 'Sin asignar',
                laboratorio_nombre: lab || 'Laboratorio Desconocido',
                fecha_creacion: curr.created_at,
                estado_global: curr.estado,
                total_bloques: 0,
                reservas: []
            };
        }

        // Metemos el detalle de esta fila al grupo
        acc[grupoId].reservas.push({
            id: curr.id,
            fecha: curr.fecha,
            bloque_horario_id: curr.bloque_horario_id,
            bloques_horarios: Array.isArray(curr.bloques_horarios) ? curr.bloques_horarios[0] : curr.bloques_horarios,
            estado: curr.estado
        });

        acc[grupoId].total_bloques += 1;
        return acc;
    }, {});

    // Devolvemos solo el arreglo de grupos ya consolidados
    return Object.values(map) as SolicitudGrupo[];
};

// ============================================================================
// 3. RESOLUCIÓN MASIVA (Aprobar o Rechazar el paquete entero)
// ============================================================================
export const resolverSolicitudesMasivas = async (
    reservaIds: string[], // <-- AHORA RECIBE UN ARREGLO DE IDs
    estado: 'aprobada' | 'rechazada',
    motivo?: string
) => {
    const supabase = createClient();

    const { error } = await supabase.rpc('resolver_solicitud', {
        p_reserva_ids: reservaIds,
        p_nueva_estado: estado,
        p_motivo_rechazo: motivo || null
    });

    if (error) throw new Error(error.message);
    return true;
};

// ============================================================================
// 4. RESOLUCIÓN PARCIAL (La Joya: Aprobar unas fechas y rechazar otras del grupo)
// ============================================================================
export const resolucionParcial = async (
    idsAprobados: string[],
    idsRechazados: string[],
    motivoRechazo: string
) => {
    const supabase = createClient();

    // Lanzamos ambas peticiones en paralelo para que sea rapidísimo
    const promesas = [];

    if (idsAprobados.length > 0) {
        promesas.push(
            supabase.rpc('resolver_solicitud', {
                p_reserva_ids: idsAprobados,
                p_nueva_estado: 'aprobada',
                p_motivo_rechazo: null
            })
        );
    }

    if (idsRechazados.length > 0) {
        promesas.push(
            supabase.rpc('resolver_solicitud', {
                p_reserva_ids: idsRechazados,
                p_nueva_estado: 'rechazada',
                p_motivo_rechazo: motivoRechazo
            })
        );
    }

    const resultados = await Promise.all(promesas);

    const errores = resultados.filter(r => r.error);
    if (errores.length > 0) {
        throw new Error("Error en resolución parcial: " + errores.map(e => e.error?.message).join(", "));
    }

    return true;
};

// ============================================================================
// FASE 4: RESOLUCIÓN AVANZADA CON EDICIÓN (Borrador -> Base de Datos)
// ============================================================================
export const procesarTramiteAvanzado = async (tramite: TramiteProcesado) => {
    const supabase = createClient();
    const promesas = [];

    // 1. Procesar los bloques que SÍ se aprueban (con sus posibles modificaciones)
    if (tramite.aprobadosIds.length > 0) {
        // Nota: Si en tu base de datos el laboratorio se relaciona por ID, 
        // aquí deberías hacer una consulta previa para obtener el ID basado en el nombre,
        // o modificar la UI para que el <select> maneje IDs en lugar de nombres.
        promesas.push(
            supabase.from('reservas')
                .update({
                    estado: 'aprobada',
                    materia_actividad: tramite.nuevaMateria
                    // laboratorio_id: tramite.nuevoLaboratorioId <- Integrar cuando uses IDs
                })
                .in('id', tramite.aprobadosIds)
        );
    }

    // 2. Procesar los bloques que fueron RECHAZADOS en la grilla
    if (tramite.rechazadosIds.length > 0) {
        promesas.push(
            // Asumiendo que tu RPC 'resolver_solicitud' o un update directo maneja el motivo
            supabase.from('reservas')
                .update({
                    estado: 'rechazada',
                    // Asume que tienes un campo en tu BD para el motivo, ej: motivo_rechazo
                    // motivo_rechazo: tramite.motivoRechazo 
                })
                .in('id', tramite.rechazadosIds)
        );
    }

    // Ejecutamos ambas transacciones en paralelo
    const resultados = await Promise.all(promesas);

    // Verificamos si hubo algún error en las promesas
    const errores = resultados.filter(r => r.error);
    if (errores.length > 0) {
        throw new Error("Error procesando el trámite: " + errores.map(e => e.error?.message).join(", "));
    }

    return true;
};