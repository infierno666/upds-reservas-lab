import { createClient } from "@/lib/supabase/client";

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  reserva_id: string;
}

// Obtiene las notificaciones del docente autenticado
export const getNotificaciones = async (): Promise<Notificacion[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as Notificacion[];
};

// Marca una notificación como leída
export const marcarLeida = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// Marca todas las notificaciones como leídas
export const marcarTodasLeidas = async (): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('leida', false);

  if (error) throw new Error(error.message);
};