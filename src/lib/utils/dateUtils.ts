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
        // Lunes de esta semana
        const day = refDate.getDay();
        const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
        fechaInicio = new Date(refDate.setDate(diff));
        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + 4); // Viernes
    } else {
        // Todo el mes
        fechaInicio = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        fechaFin = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
    }

    // Generar iteración excluyendo fines de semana
    let actual = new Date(fechaInicio);
    while (actual <= fechaFin) {
        const diaSemana = actual.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) { // 0 = Dom, 6 = Sab
            fechas.push(new Date(actual));
        }
        actual.setDate(actual.getDate() + 1);
    }

    return {
        inicio: fechas[0].toISOString().split('T')[0],
        fin: fechas[fechas.length - 1].toISOString().split('T')[0],
        fechas
    };
};

export const formatearFecha = (date: Date) => date.toISOString().split('T')[0];