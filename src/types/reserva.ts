// src/types/reserva.ts

export type ReservaEstado = 'aprobada' | 'pendiente' | 'rechazada' | 'cancelada' | 'pendiente_modificacion';

export interface ReservaFilters {
    estado?: ReservaEstado;
    materia?: string;
    fecha?: string;
    modulo?: number;
    anio?: number;
    laboratorio_id?: string;
}

export interface Reserva {
    id: string;
    fecha: string;
    materia_actividad: string;
    estado: ReservaEstado;
    periodo_modulo: number;
    periodo_anio: number;
    laboratorios: {
        nombre: string;
    };
    bloques_horarios: {
        hora_inicio: string;
        hora_fin: string;
    };
}