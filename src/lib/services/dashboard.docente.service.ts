import { createClient } from "@/lib/supabase/client";

export interface KPIsDocente {
  proximaReservaLab: string;
  proximaReservaFecha: string;
  proximaReservaHora: string;
  proximaReservaEstado: string;
  solicitudesPendientes: number;
  reservasAprobadasMes: number;
  horasUtilizadas: number;
}

export interface UltimaSolicitud {
  id: string;
  laboratorio: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  materia: string;
}

// KPIs del docente autenticado
export const getKPIsDocente = async (): Promise<KPIsDocente> => {
  const supabase = createClient();
  const hoy = new Date().toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  const [proxima, pendientes, aprobadasMes, horas] = await Promise.all([
    // Próxima reserva — aprobada o pendiente, fecha >= hoy
    supabase.from('reservas')
      .select(`
                fecha, estado,
                laboratorios!laboratorio_id(nombre),
                bloques_horarios!bloque_horario_id(hora_inicio, hora_fin)
            `)
      .in('estado', ['aprobada', 'pendiente'])
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .limit(1)
      .single(),

    // Solicitudes pendientes del docente
    supabase.from('reservas')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),

    // Reservas aprobadas este mes
    supabase.from('reservas')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'aprobada')
      .gte('fecha', inicioMes),

    // Horas utilizadas — reservas confirmadas con asistencia
    supabase.from('reservas')
      .select('bloques_horarios!bloque_horario_id(hora_inicio, hora_fin)')
      .eq('estado', 'aprobada')
      .eq('asistencia_confirmada', true),
  ]);

  // Calcula horas totales sumando duración de cada bloque confirmado
  const totalHoras = (horas.data || []).reduce((acc: number, r: any) => {
    const inicio = r.bloques_horarios?.hora_inicio;
    const fin = r.bloques_horarios?.hora_fin;
    if (!inicio || !fin) return acc;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    return acc + ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
  }, 0);

  const p = proxima.data;

  return {
    proximaReservaLab: (p?.laboratorios as any)?.nombre ?? 'Sin reservas próximas',
    proximaReservaFecha: p?.fecha ?? '-',
    proximaReservaHora: p ? `${(p.bloques_horarios as any)?.hora_inicio ?? ''} - ${(p.bloques_horarios as any)?.hora_fin ?? ''}` : '-',
    proximaReservaEstado: p?.estado ?? '-',
    solicitudesPendientes: pendientes.count || 0,
    reservasAprobadasMes: aprobadasMes.count || 0,
    horasUtilizadas: Math.round(totalHoras * 10) / 10,
  };
};

// Últimas 5 solicitudes del docente para la tabla del dashboard
export const getUltimasSolicitudes = async (): Promise<UltimaSolicitud[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reservas')
    .select(`
            id, fecha, estado,
            laboratorios!laboratorio_id(nombre),
            bloques_horarios!bloque_horario_id(hora_inicio, hora_fin),
            materias(nombre),
            materia_actividad
        `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);

  return (data || []).map((r: any) => ({
    id: r.id,
    laboratorio: r.laboratorios?.nombre ?? '-',
    fecha: r.fecha,
    hora_inicio: r.bloques_horarios?.hora_inicio ?? '-',
    hora_fin: r.bloques_horarios?.hora_fin ?? '-',
    estado: r.estado,
    materia: r.materias?.nombre || r.materia_actividad || 'Sin asignar',
  }));
};