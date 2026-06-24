import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getLaboratorios() {
    const { data, error } = await supabase.from('laboratorios').select('*');
    if (error) throw error;
    return data;
}

export async function getBloquesHorarios() {
    const { data, error } = await supabase
        .from('bloques_horarios')
        .select('*')
        .order('hora_inicio', { ascending: true });
    if (error) throw error;
    return data;
}

export async function getDisponibilidad(laboratorioId: string, fecha: string) {
    const { data, error } = await supabase
        .from('vista_disponibilidad_publica')
        .select('bloque_horario_id, estado')
        .eq('laboratorio_id', laboratorioId)
        .eq('fecha', fecha);
    if (error) throw error;
    return data;
}