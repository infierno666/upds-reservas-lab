import { createClient } from "@/lib/supabase/client";

export interface RegistroAuditoria {
  id: string;
  fecha: string;
  estado: string;
  motivo_rechazo: string | null;
  motivo_cancelacion: string | null;
  created_at: string;
  updated_at: string;
  docente_nombre: string;
  laboratorio_nombre: string;
  bloque_inicio: string;
  bloque_fin: string;
}

export interface FiltrosAuditoria {
  estado?: string;
  laboratorio_id?: string;
  docente_nombre?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Obtiene el historial completo de reservas con filtros opcionales
export const getHistorialReservas = async (filtros: FiltrosAuditoria): Promise<RegistroAuditoria[]> => {
  const supabase = createClient();

  let query = supabase
    .from('reservas')
    .select(`
            id,
            fecha,
            estado,
            motivo_rechazo,
            motivo_cancelacion,
            created_at,
            updated_at,
            perfiles!docente_id(nombre_completo),
            laboratorios!laboratorio_id(nombre),
            bloques_horarios!bloque_horario_id(hora_inicio, hora_fin)
        `)
    .order('updated_at', { ascending: false })
    .limit(200);

  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.fecha_desde) query = query.gte('fecha', filtros.fecha_desde);
  if (filtros.fecha_hasta) query = query.lte('fecha', filtros.fecha_hasta);
  if (filtros.laboratorio_id) query = query.eq('laboratorio_id', filtros.laboratorio_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Normaliza los joins para aplanar la estructura anidada
  return (data as any[]).map(r => ({
    id: r.id,
    fecha: r.fecha,
    estado: r.estado,
    motivo_rechazo: r.motivo_rechazo,
    motivo_cancelacion: r.motivo_cancelacion,
    created_at: r.created_at,
    updated_at: r.updated_at,
    docente_nombre: r.perfiles?.nombre_completo ?? 'Sin nombre',
    laboratorio_nombre: r.laboratorios?.nombre ?? '-',
    bloque_inicio: r.bloques_horarios?.hora_inicio ?? '-',
    bloque_fin: r.bloques_horarios?.hora_fin ?? '-',
  }));
};

// Obtiene la lista de laboratorios para el filtro del select
export const getLaboratoriosParaFiltro = async (): Promise<{ id: string; nombre: string }[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('laboratorios')
    .select('id, nombre')
    .order('nombre');
  if (error) throw new Error(error.message);
  return data as { id: string; nombre: string }[];
};