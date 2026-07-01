import { createClient } from "@/lib/supabase/client";

// Tipos alineados a lo que devuelven las RPCs del backend
export interface ReporteLaboratorio {
  laboratorio_id: string;
  nombre: string;
  periodo_modulo: number;
  periodo_anio: number;
  semestre: number;
  total_aprobadas: number;
  total_rechazadas: number;
  total_canceladas: number;
  total_no_usadas: number;
}

export interface ReporteDocente {
  docente_id: string;
  nombre_completo: string;
  periodo_modulo: number;
  periodo_anio: number;
  semestre: number;
  total_aprobadas: number;
  total_ausencias: number;
}

export interface ReporteMateria {
  materia_actividad: string;
  periodo_modulo: number;
  periodo_anio: number;
  semestre: number;
  total_reservas: number;
}

export interface ReporteAusentismo {
  docente_id: string;
  nombre_completo: string;
  total_reservas_aprobadas: number;
  total_no_usadas: number;
  porcentaje_ausentismo: number;
}

// Reporte de uso por laboratorio
export const getReporteLaboratorio = async (): Promise<ReporteLaboratorio[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('obtener_reporte_uso_laboratorio');
  if (error) throw new Error(error.message);
  return data as ReporteLaboratorio[];
};

// Reporte de uso por docente
export const getReporteDocente = async (): Promise<ReporteDocente[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('obtener_reporte_uso_docente');
  if (error) throw new Error(error.message);
  return data as ReporteDocente[];
};

// Reporte de uso por materia
export const getReporteMateria = async (): Promise<ReporteMateria[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('obtener_reporte_uso_materia');
  if (error) throw new Error(error.message);
  return data as ReporteMateria[];
};

// Reporte de indice de ausentismo
export const getReporteAusentismo = async (): Promise<ReporteAusentismo[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('obtener_reporte_indice_ausentismo');
  if (error) throw new Error(error.message);
  return data as ReporteAusentismo[];
};

// Reporte global de solicitudes por estado (RF-29)
export interface ReporteSolicitudesGlobales {
  estado: string;
  total: number;
  porcentaje: number;
}

export const getReporteSolicitudesGlobales = async (): Promise<ReporteSolicitudesGlobales[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('obtener_reporte_solicitudes_globales');
  if (error) throw new Error(error.message);
  return data as ReporteSolicitudesGlobales[];
};

// Reporte de dias de mayor demanda (RF-30)
export interface ReporteDiasDemanda {
  dia_numero: number;
  dia_nombre: string;
  total_reservas: number;
}

export const getReporteDiasDemanda = async (): Promise<ReporteDiasDemanda[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('obtener_reporte_dias_demanda');
  if (error) throw new Error(error.message);
  return data as ReporteDiasDemanda[];
};