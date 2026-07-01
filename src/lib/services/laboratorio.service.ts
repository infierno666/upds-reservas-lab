import { createClient } from "@/lib/supabase/client";
import { Laboratorio, LaboratorioFormData } from "@/types/laboratory";

// Obtiene todos los laboratorios (activos e inactivos)
export const getLaboratorios = async (): Promise<Laboratorio[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('laboratorios')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Laboratorio[];
};

// Verifica si ya existe un laboratorio con ese nombre (validacion previa de cortesia)
export const existeNombreLaboratorio = async (nombre: string): Promise<boolean> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('laboratorios')
    .select('id')
    .eq('nombre', nombre.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data !== null;
};

// Crea un laboratorio nuevo
export const crearLaboratorio = async (form: LaboratorioFormData): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('laboratorios').insert({
    nombre: form.nombre.trim(),
    capacidad: form.capacidad,
    caracteristicas: form.caracteristicas.trim() || null,
  });

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un laboratorio con ese nombre.');
    throw new Error(error.message);
  }
};

// Edita un laboratorio existente
export const editarLaboratorio = async (id: string, form: LaboratorioFormData): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('laboratorios')
    .update({
      nombre: form.nombre.trim(),
      capacidad: form.capacidad,
      caracteristicas: form.caracteristicas.trim() || null,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un laboratorio con ese nombre.');
    throw new Error(error.message);
  }
};

// Habilita un laboratorio (sin efectos secundarios)
export const habilitarLaboratorio = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('laboratorios')
    .update({ estado_operativo: 'activo' })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// Deshabilita un laboratorio via RPC (cancela reservas y notifica en el backend)
export const deshabilitarLaboratorio = async (id: string, motivo: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.rpc('deshabilitar_laboratorio', {
    p_laboratorio_id: id,
    p_motivo: motivo.trim(),
  });

  if (error) throw new Error(error.message);
};

// Crea un bloqueo preventivo en fechas especificas (mantenimiento o evento)
export const crearBloqueoPreventivo = async (
  laboratorioId: string,
  fechas: string[],
  motivo: string
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.rpc('crear_bloqueo_preventivo', {
    p_laboratorio_id: laboratorioId,
    p_fechas: fechas,
    p_motivo: motivo.trim(),
  });
  if (error) throw new Error(error.message);
};