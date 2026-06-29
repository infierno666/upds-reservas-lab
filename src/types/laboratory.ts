// Tipo alineado al esquema real de la tabla "laboratorios" en Supabase

export type EstadoLaboratorio = 'activo' | 'inactivo';

export interface Laboratorio {
    id: string;
    nombre: string;
    capacidad: number | null;
    caracteristicas: string | null;
    estado_operativo: EstadoLaboratorio;
    created_at: string;
    updated_at: string;
}

// Forma de los datos que envia el formulario al crear/editar
export interface LaboratorioFormData {
    nombre: string;
    capacidad: number;
    caracteristicas: string;
}