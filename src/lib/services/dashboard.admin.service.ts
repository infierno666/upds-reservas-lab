import { createClient } from "@/lib/supabase/client";

export interface KPIsAdmin {
  laboratoriosActivos: number;
  laboratoriosTotal: number;
  reservasHoy: number;
  solicitudesPendientes: number;
  porcentajeOcupacionHoy: number;
}

export interface DatoGraficoSemanal {
  dia: string;
  reservas: number;
}

export interface DatoGraficoHorarios {
  turno: string;
  total: number;
}

// KPIs principales del dashboard admin
export const getKPIsAdmin = async (): Promise<KPIsAdmin> => {
  const supabase = createClient();
  const hoy = new Date().toISOString().split('T')[0];

  const [labs, reservasHoy, pendientes, bloquesHoy, totalBloques] = await Promise.all([
    // Laboratorios activos y total
    supabase.from('laboratorios').select('estado_operativo'),

    // Reservas aprobadas hoy
    supabase.from('reservas').select('id', { count: 'exact', head: true })
      .eq('estado', 'aprobada')
      .eq('fecha', hoy),

    // Solicitudes pendientes
    supabase.from('reservas').select('id', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),

    // Bloques ocupados hoy (aprobadas + pendientes)
    supabase.from('reservas').select('id', { count: 'exact', head: true })
      .in('estado', ['aprobada', 'pendiente'])
      .eq('fecha', hoy),

    // Total de bloques posibles hoy = labs activos x bloques horarios disponibles
    supabase.from('bloques_horarios').select('id', { count: 'exact', head: true }),
  ]);

  if (labs.error) throw new Error(labs.error.message);

  const labsActivos = labs.data?.filter(l => l.estado_operativo === 'activo').length || 0;
  const totalBloquesDisponibles = (totalBloques.count || 0) * labsActivos;
  const bloquesOcupados = bloquesHoy.count || 0;

  // Calcula porcentaje — evita division por cero
  const porcentaje = totalBloquesDisponibles > 0
    ? Math.round((bloquesOcupados / totalBloquesDisponibles) * 100)
    : 0;

  return {
    laboratoriosActivos: labsActivos,
    laboratoriosTotal: labs.data?.length || 0,
    reservasHoy: reservasHoy.count || 0,
    solicitudesPendientes: pendientes.count || 0,
    porcentajeOcupacionHoy: porcentaje,
  };
};

// Datos para gráfico de líneas — reservas aprobadas por día última semana
export const getDatosGraficoSemanal = async (): Promise<DatoGraficoSemanal[]> => {
  const supabase = createClient();
  const hoy = new Date();
  const hace7dias = new Date(hoy.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('reservas')
    .select('fecha')
    .eq('estado', 'aprobada')
    .gte('fecha', hace7dias)
    .lte('fecha', hoy.toISOString().split('T')[0]);

  if (error) throw new Error(error.message);

  const resultado: Record<string, { label: string; count: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit' });
    resultado[key] = { label, count: 0 };
  }

  (data || []).forEach((r: any) => {
    if (resultado[r.fecha]) resultado[r.fecha].count++;
  });

  return Object.values(resultado).map(r => ({ dia: r.label, reservas: r.count }));
};

// Datos para gráfico donut — reservas aprobadas por turno
export const getDatosGraficoHorarios = async (): Promise<DatoGraficoHorarios[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reservas')
    .select('bloques_horarios!bloque_horario_id(turno)')
    .eq('estado', 'aprobada')
    .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  if (error) throw new Error(error.message);

  const conteo: Record<string, number> = {};
  (data || []).forEach((r: any) => {
    const turno = r.bloques_horarios?.turno || 'desconocido';
    conteo[turno] = (conteo[turno] || 0) + 1;
  });

  return Object.entries(conteo).map(([turno, total]) => ({
    turno: turno.charAt(0).toUpperCase() + turno.slice(1),
    total,
  }));
};