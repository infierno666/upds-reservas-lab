export interface CeldaEstado {
  label: string;
  clase: string;
}

interface CeldaSeleccionada {
  fecha: string;
  bloqueId: number;
}

// Determina el estado visual de una celda de la grilla de turnos (Libre, Ocupado, Mi reserva, etc.)
// Misma lógica que tenía ShiftGridSelector — extraída para reutilizarse en la vista mobile.
export function getEstadoCelda(
  fechaStr: string,
  bloqueId: number,
  seleccion: CeldaSeleccionada[],
  misReservas: any[],
  disponibilidad: any[]
): CeldaEstado {
  const seleccionada = seleccion.some(s => s.fecha === fechaStr && s.bloqueId === bloqueId);
  if (seleccionada) {
    return { label: "Seleccionado", clase: "bg-blue-600 border-blue-700 text-white" };
  }

  const miReserva = misReservas.find(
    r => r.fecha === fechaStr && r.bloque_horario_id === bloqueId &&
      (r.estado === "pendiente" || r.estado === "aprobada" || r.estado === "pendiente_modificacion")
  );

  if (miReserva) {
    if (miReserva.estado === "aprobada") {
      return { label: "Mi reserva", clase: "bg-emerald-100 border-emerald-300 text-emerald-700" };
    }
    if (miReserva.estado === "pendiente_modificacion") {
      return { label: "Modificación", clase: "bg-amber-100 border-amber-300 text-amber-700" };
    }
    return { label: "Mi solicitud", clase: "bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200" };
  }

  const reserva = disponibilidad.find(d => d.fecha === fechaStr && d.bloque_horario_id === bloqueId);
  if (!reserva) {
    return { label: "Libre", clase: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  }
  if (reserva.estado === "aprobada") {
    return { label: "Ocupado", clase: "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" };
  }
  if (reserva.estado === "pendiente") {
    return { label: "Pendiente", clase: "bg-amber-50 border-amber-200 text-amber-600" };
  }
  return { label: "Bloqueado", clase: "bg-red-50 border-red-200 text-red-500" };
}