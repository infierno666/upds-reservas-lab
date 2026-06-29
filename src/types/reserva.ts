export type ReservaEstado = 'aprobada' | 'pendiente' | 'rechazada' | 'cancelada' | 'pendiente_modificacion';

export interface ReservaFilters {
    estado?: ReservaEstado;
    materia_actividad?: string; // Sincronizado con BD
    fecha?: string;
    modulo?: number;
    anio?: number;
    laboratorio_id?: string;
}

export interface Reserva {
    id: string;
    fecha: string;
    materia_actividad: string; // Sincronizado con BD
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

export interface PatronReserva {
    dayOfWeek: number;
    bloqueId: number;
}