export interface RangoFechas {
    inicio: string;
    fin: string;
    fechas: Date[];
}

export const calcularFechasVisibles = (fechaRefStr: string, vista: 'semana' | 'mes'): RangoFechas => {
    const refDate = new Date(fechaRefStr + 'T12:00:00'); // Evitar problemas de zona horaria
    const fechas: Date[] = [];

    let fechaInicio: Date;
    let fechaFin: Date;

    if (vista === 'semana') {
        // 5 días hábiles empezando en la fecha pivote, avanzando siempre hacia adelante
        // y saltando sábado/domingo sin retroceder nunca al día clickeado.
        let actual = new Date(refDate);
        while (fechas.length < 5) {
            const diaSemana = actual.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
                fechas.push(new Date(actual));
            }
            actual.setDate(actual.getDate() + 1);
        }
    } else {
        // Todo el mes, excluyendo fines de semana
        const fechaInicio = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        const fechaFin = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
        let actual = new Date(fechaInicio);
        while (actual <= fechaFin) {
            const diaSemana = actual.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
                fechas.push(new Date(actual));
            }
            actual.setDate(actual.getDate() + 1);
        }
    }

    return {
        inicio: fechas[0].toISOString().split('T')[0],
        fin: fechas[fechas.length - 1].toISOString().split('T')[0],
        fechas
    };
};

export const formatearFecha = (date: Date) => date.toISOString().split('T')[0];