import { createClient } from "@/lib/supabase/client";

export interface RegistroAsistencia {
  id: string;
  fecha: string;
  docente_nombre: string;
  laboratorio_nombre: string;
  bloque_inicio: string;
  bloque_fin: string;
  asistencia_confirmada: boolean | null;
  asistencia_resuelta_por_timeout: boolean;
}

// Obtiene reservas aprobadas con su estado de asistencia
export const getReservasAsistencia = async (): Promise<RegistroAsistencia[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reservas')
    .select(`
            id,
            fecha,
            asistencia_confirmada,
            asistencia_resuelta_por_timeout,
            perfiles!docente_id(nombre_completo),
            laboratorios!laboratorio_id(nombre),
            bloques_horarios!bloque_horario_id(hora_inicio, hora_fin)
        `)
    .eq('estado', 'aprobada')
    .order('fecha', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data as any[]).map(r => ({
    id: r.id,
    fecha: r.fecha,
    asistencia_confirmada: r.asistencia_confirmada,
    asistencia_resuelta_por_timeout: r.asistencia_resuelta_por_timeout,
    docente_nombre: r.perfiles?.nombre_completo ?? 'Sin nombre',
    laboratorio_nombre: r.laboratorios?.nombre ?? '-',
    bloque_inicio: r.bloques_horarios?.hora_inicio ?? '-',
    bloque_fin: r.bloques_horarios?.hora_fin ?? '-',
  }));
};