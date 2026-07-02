import { createClient } from "@/lib/supabase/client";

// ============================================================================
// 1. INTERFACES DE TIPADO ESTRICTO
// ============================================================================

/**
 * Una única fila de reserva dentro de un grupo de solicitud.
 * Representa un bloque horario puntual (una fecha + un bloque_horario_id).
 */
export interface ReservaIndividual {
    id: string;
    fecha: string;
    bloque_horario_id: number;
    bloques_horarios: {
        id: number;
        hora_inicio: string;
        hora_fin: string;
        turno: string;
    } | null;
    estado: "pendiente" | "aprobada" | "rechazada";
}

/**
 * Un grupo de solicitud consolidado: agrupa todas las `ReservaIndividual`
 * que un docente envió juntas (mismo grupo_solicitud_id) para poder
 * aprobarlas/rechazarlas como paquete o de forma parcial.
 */
export interface SolicitudGrupo {
    grupo_id: string;
    docente_nombre: string;
    materia_actividad: string;
    laboratorio_id: string;
    laboratorio_nombre: string;
    laboratorio_capacidad: number;
    fecha_creacion: string;
    estado_global: string;
    total_bloques: number;
    reservas: ReservaIndividual[];
}

/**
 * Payload que arma la UI de administración cuando el admin resuelve
 * una solicitud "avanzada": puede aprobar unos bloques (con posibles
 * ediciones de materia/laboratorio) y rechazar otros, todo en un solo envío.
 */
export interface TramiteProcesado {
    aprobadosIds: string[];
    rechazadosIds: string[];
    motivoRechazo: string;
    nuevaMateria: string;
    nuevoLaboratorioId: string;
    nuevoLaboratorioNombre: string;
}

/**
 * Representa un choque de horario: alguien más ya tiene ese
 * laboratorio ocupado en esa fecha y bloque horario.
 */
export interface ConflictoLaboratorio {
    laboratorio_id: string;
    fecha: string;
    bloque_horario_id: number;
}

/**
 * Laboratorio candidato para reasignación, con la lista de conflictos
 * (si los tiene) para las fechas/bloques que se están evaluando.
 */
export interface LaboratorioDisponible {
    id: string;
    nombre: string;
    capacidad: number;
    disponible: boolean;
    conflictos: ConflictoLaboratorio[];
}

// ============================================================================
// 2. OBTENCIÓN AGRUPADA (Data lista para consumir en la UI)
// ============================================================================

/**
 * Trae todas las reservas con estado 'pendiente' y las agrupa por
 * `grupo_solicitud_id`, para que el panel de admin muestre "solicitudes"
 * (paquetes de bloques) en vez de filas sueltas.
 */
export const getSolicitudesPendientes = async (): Promise<SolicitudGrupo[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("reservas")
        .select(`
            id,
            grupo_solicitud_id,
            fecha,
            materia_actividad,
            estado,
            created_at,
            bloque_horario_id,
            perfiles(nombre_completo),
            laboratorios(id, nombre, capacidad, estado_operativo),
            bloques_horarios(id, hora_inicio, hora_fin, turno),
            materias(nombre)
        `)
        .eq("estado", "pendiente")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Agrupamos las filas planas de Supabase en un mapa { grupo_solicitud_id -> SolicitudGrupo }
    const gruposPorId = (data || []).reduce((acc: Record<string, SolicitudGrupo>, curr: any) => {
        const grupoId = curr.grupo_solicitud_id;

        // Extracción segura: Supabase a veces devuelve la relación como objeto y a veces como arreglo de 1 elemento
        const docente = Array.isArray(curr.perfiles)
            ? curr.perfiles[0]?.nombre_completo
            : curr.perfiles?.nombre_completo;

        const laboratorio = Array.isArray(curr.laboratorios)
            ? curr.laboratorios[0]
            : curr.laboratorios;

        const materia = curr.materias?.nombre || curr.materia_actividad;

        // Primera vez que vemos este grupo: creamos el registro consolidado
        if (!acc[grupoId]) {
            acc[grupoId] = {
                grupo_id: grupoId,
                docente_nombre: docente || "Desconocido",
                materia_actividad: materia || "Sin asignar",
                laboratorio_id: laboratorio?.id,
                laboratorio_nombre: laboratorio?.nombre || "Laboratorio Desconocido",
                laboratorio_capacidad: laboratorio?.capacidad || 0,
                fecha_creacion: curr.created_at,
                estado_global: curr.estado,
                total_bloques: 0,
                reservas: []
            };
        }

        // Agregamos el detalle de esta fila (bloque horario puntual) al grupo
        acc[grupoId].reservas.push({
            id: curr.id,
            fecha: curr.fecha,
            bloque_horario_id: curr.bloque_horario_id,
            bloques_horarios: Array.isArray(curr.bloques_horarios)
                ? curr.bloques_horarios[0]
                : curr.bloques_horarios,
            estado: curr.estado
        });

        acc[grupoId].total_bloques += 1;
        return acc;
    }, {});

    return Object.values(gruposPorId);
};

// ============================================================================
// 3. RESOLUCIÓN MASIVA (Aprobar o Rechazar el paquete entero)
// ============================================================================

/**
 * Aprueba o rechaza TODOS los ids de reserva recibidos en un solo paso,
 * usando el RPC `resolver_solicitud` en la base de datos.
 */
export const resolverSolicitudesMasivas = async (
    reservaIds: string[],
    estado: "aprobada" | "rechazada",
    motivo?: string
): Promise<true> => {
    const supabase = createClient();

    const { error } = await supabase.rpc("resolver_solicitud", {
        p_reserva_ids: reservaIds,
        p_nueva_estado: estado,
        p_motivo_rechazo: motivo || null
    });

    if (error) throw new Error(error.message);
    return true;
};

// ============================================================================
// 4. RESOLUCIÓN PARCIAL (Aprobar unas fechas y rechazar otras del mismo grupo)
// ============================================================================

/**
 * Permite resolver un grupo de solicitud de forma mixta: una parte de los
 * bloques se aprueba y otra parte se rechaza (con motivo), en un solo llamado.
 * Ambas operaciones se disparan en paralelo para minimizar la latencia.
 */
export const resolucionParcial = async (
    idsAprobados: string[],
    idsRechazados: string[],
    motivoRechazo: string
): Promise<true> => {
    const supabase = createClient();

    const promesas = [];

    if (idsAprobados.length > 0) {
        promesas.push(
            supabase.rpc("resolver_solicitud", {
                p_reserva_ids: idsAprobados,
                p_nueva_estado: "aprobada",
                p_motivo_rechazo: null
            })
        );
    }

    if (idsRechazados.length > 0) {
        promesas.push(
            supabase.rpc("resolver_solicitud", {
                p_reserva_ids: idsRechazados,
                p_nueva_estado: "rechazada",
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
// 5. RESOLUCIÓN AVANZADA CON EDICIÓN (Borrador -> Base de Datos)
// ============================================================================

/**
 * Igual que `resolucionParcial`, pero además permite EDITAR la materia y el
 * laboratorio de los bloques que se aprueban (por ejemplo, si el admin
 * reasigna a otro laboratorio antes de aprobar). Usa `update` directo en vez
 * del RPC porque necesita escribir columnas adicionales.
 */
export const procesarTramiteAvanzado = async (tramite: TramiteProcesado): Promise<true> => {
    const supabase = createClient();
    const promesas = [];

    // 1. Bloques aprobados: se actualizan estado + materia + laboratorio (posible reasignación)
    if (tramite.aprobadosIds.length > 0) {
        promesas.push(
            supabase
                .from("reservas")
                .update({
                    estado: "aprobada",
                    materia_actividad: tramite.nuevaMateria,
                    laboratorio_id: tramite.nuevoLaboratorioId
                })
                .in("id", tramite.aprobadosIds)
        );
    }

    // 2. Bloques rechazados desde la grilla
    if (tramite.rechazadosIds.length > 0) {
        promesas.push(
            supabase
                .from("reservas")
                .update({
                    estado: "rechazada"
                    // TODO: si se agrega una columna `motivo_rechazo` en la tabla `reservas`,
                    // incluir aquí: motivo_rechazo: tramite.motivoRechazo
                })
                .in("id", tramite.rechazadosIds)
        );
    }

    const resultados = await Promise.all(promesas);

    const errores = resultados.filter(r => r.error);
    if (errores.length > 0) {
        throw new Error("Error procesando el trámite: " + errores.map(e => e.error?.message).join(", "));
    }

    return true;
};

// ============================================================================
// 6. OBTENER LABORATORIOS DISPONIBLES PARA REASIGNACIÓN
// ============================================================================

/**
 * Dado un conjunto de (fecha, bloque_horario_id) que se quieren reasignar,
 * devuelve todos los laboratorios activos indicando si están libres o
 * tienen conflicto (ya ocupados por otra reserva) en esas franjas.
 *
 * Nota de rendimiento: hace una consulta por cada `reserva` recibida
 * (N llamadas secuenciales). Si el arreglo de reservas puede ser grande,
 * conviene reemplazarlo por una sola consulta con `.in()` sobre
 * pares (fecha, bloque_horario_id) o un RPC dedicado.
 */
export const getLaboratoriosDisponibles = async (
    reservas: { fecha: string; bloque_horario_id: number }[]
): Promise<LaboratorioDisponible[]> => {
    const supabase = createClient();

    // 1. Traer laboratorios activos
    const { data: laboratorios, error: errorLabs } = await supabase
        .from("laboratorios")
        .select(`id, nombre, capacidad`)
        .eq("estado_operativo", "activo");

    if (errorLabs) throw new Error(errorLabs.message);

    // 2. Por cada fecha/bloque a reasignar, buscar reservas ya existentes que choquen
    const conflictos: ConflictoLaboratorio[] = [];

    for (const reserva of reservas) {
        const { data } = await supabase
            .from("reservas")
            .select(`laboratorio_id, fecha, bloque_horario_id`)
            .eq("fecha", reserva.fecha)
            .eq("bloque_horario_id", reserva.bloque_horario_id)
            .in("estado", ["pendiente", "aprobada", "pendiente_modificacion"]);

        conflictos.push(
            ...(data || []).map(r => ({
                laboratorio_id: r.laboratorio_id,
                fecha: r.fecha,
                bloque_horario_id: r.bloque_horario_id
            }))
        );
    }

    // 3. Cruzar cada laboratorio activo contra la lista de conflictos encontrados
    return (laboratorios || []).map(lab => {
        const conflictosLab = conflictos.filter(c => c.laboratorio_id === lab.id);

        return {
            id: lab.id,
            nombre: lab.nombre,
            capacidad: lab.capacidad,
            disponible: conflictosLab.length === 0,
            conflictos: conflictosLab.map(c => ({
                laboratorio_id: lab.id,
                fecha: c.fecha,
                bloque_horario_id: c.bloque_horario_id
            }))
        };
    });
};