import { useState, useMemo } from "react";
import { CheckSquare, Square, SunMedium, CloudSun, Sunset, MoonStar } from "lucide-react";
import { formatearFecha } from "@/lib/utils/dateUtils";
import { getEstadoCelda as getEstadoCeldaBase } from "@/lib/utils/shiftCellState";
import { ShiftGridMobile } from "./ShiftGridMobile";

interface BloqueHorario {
  id: number;
  turno: string; // 'mañana' | 'mediodia' | 'tarde' | 'noche'
  hora_inicio: string;
  hora_fin: string;
}

interface Disponibilidad {
  fecha: string;
  bloque_horario_id: number;
  estado: string;
}

interface CeldaSeleccionada {
  fecha: string;
  bloqueId: number;
}

interface Props {
  bloques: BloqueHorario[];
  fechasVisibles: Date[];
  disponibilidad: Disponibilidad[];
  misReservas: any[];
  seleccion: CeldaSeleccionada[];
  turnoInicial: string;

  onToggleCelda: (fecha: string, bloqueId: number) => void;
  onToggleMulti: (
    celdas: CeldaSeleccionada[],
    action: 'add' | 'remove'
  ) => void;
}

const TURNOS = [
  { id: 'mañana', label: 'Mañana', icon: SunMedium },
  { id: 'mediodia', label: 'Mediodía', icon: CloudSun },
  { id: 'tarde', label: 'Tarde', icon: Sunset },
  { id: 'noche', label: 'Noche', icon: MoonStar }
];


export function ShiftGridSelector({ bloques, fechasVisibles, disponibilidad, misReservas, seleccion, turnoInicial, onToggleCelda, onToggleMulti }: Props) {
  const [activeShift, setActiveShift] = useState<string>(turnoInicial);

  // 1. Filtrar bloques solo para el turno activo
  const bloquesDelTurno = useMemo(() => {
    return bloques.filter(b => b.turno === activeShift);
  }, [bloques, activeShift]);

  // 2. Lógica del Botón Inteligente (Seleccionar Todo el Turno)
  const { libresDelTurno, isAllSelected } = useMemo(() => {
    const libres: CeldaSeleccionada[] = [];
    let seleccionadosEnTurno = 0;

    fechasVisibles.forEach(fechaObj => {
      const fechaStr = formatearFecha(fechaObj);
      bloquesDelTurno.forEach(bloque => {
        const ocupado = disponibilidad.some(
          d =>
            d.fecha === fechaStr &&
            d.bloque_horario_id === bloque.id
        );


        const esMiReserva = misReservas.some(
          r =>
            r.fecha === fechaStr &&
            r.bloque_horario_id === bloque.id &&
            (
              r.estado === "pendiente" ||
              r.estado === "aprobada" ||
              r.estado === "pendiente_modificacion"
            )
        );

        if (!ocupado && !esMiReserva) {

          libres.push({
            fecha: fechaStr,
            bloqueId: bloque.id
          });


          const isSelected = seleccion.some(
            s =>
              s.fecha === fechaStr &&
              s.bloqueId === bloque.id
          );


          if (isSelected) {
            seleccionadosEnTurno++;
          }

        }
      });
    });

    return {
      libresDelTurno: libres,
      isAllSelected: libres.length > 0 && seleccionadosEnTurno === libres.length
    };
  }, [fechasVisibles, bloquesDelTurno, disponibilidad, seleccion]);

  const handleMasterToggle = () => {
    if (isAllSelected) {
      onToggleMulti(libresDelTurno, 'remove'); // Limpia solo las de este turno
    } else {
      onToggleMulti(libresDelTurno, 'add'); // Selecciona todas las libres de este turno
    }
  };

  // Estado visual de cada celda — misma lógica, ahora compartida con la vista mobile
  const getEstadoCelda = (fechaStr: string, bloqueId: number) =>
    getEstadoCeldaBase(fechaStr, bloqueId, seleccion, misReservas, disponibilidad);


  const rangoTexto = () => {

    if (fechasVisibles.length === 0)
      return "";


    const inicio = fechasVisibles[0];

    const fin = fechasVisibles[
      fechasVisibles.length - 1
    ];


    return `

${inicio.toLocaleDateString(
      "es-ES",
      {
        day: "numeric",
        month: "short"
      }
    )}

-

${fin.toLocaleDateString(
      "es-ES",
      {
        day: "numeric",
        month: "short"
      }
    )}

`;

  }

  return (
    <div className="flex flex-col lg:h-full bg-white rounded-2xl shadow-sm border border-slate-200 lg:overflow-hidden">


      {/* Cabecera Superior: Tabs de Turnos y Botón Maestro */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-2.5 sm:p-3 lg:p-4 border-b border-slate-200 gap-2.5 sm:gap-3 lg:gap-4">

        {/* Selector de Turnos (Tabs) */}
        <div className="flex p-1 bg-slate-200/60 rounded-xl w-full sm:w-auto">

          {TURNOS.map(turno => {
            const Icon = turno.icon;
            const isActive = activeShift === turno.id;
            return (
              <button
                key={turno.id}
                onClick={() => setActiveShift(turno.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${isActive
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                <Icon size={16} className={isActive ? "text-blue-600" : ""} />
                <span className="hidden sm:inline">{turno.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botón Maestro Contextual */}
        <button
          onClick={handleMasterToggle}
          disabled={libresDelTurno.length === 0}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all w-full sm:w-auto ${isAllSelected
            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            : 'bg-[#001D4A] text-white hover:bg-[#001D4A]/90 shadow-md'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAllSelected ? <Square size={16} /> : <CheckSquare size={16} />}
          <span className="truncate">{isAllSelected ? `Limpiar Turno ${activeShift}` : `Seleccionar Todo (${activeShift})`}</span>
        </button>
      </div>
      <div className="flex justify-center">
        <p className="text-xs font-bold text-slate-400">
          {rangoTexto()}
        </p>
      </div>
      {/* Grilla Principal */}
      <div className="hidden lg:block flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[650px] sm:min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 sm:p-3 lg:p-4 border-b border-r border-slate-100 bg-white sticky left-0 z-20 w-24 sm:w-28 lg:w-32 shadow-[1px_0_0_0_#f1f5f9]">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Horario</span>
              </th>
              {fechasVisibles.map((fecha, idx) => (
                <th key={idx} className="p-2 sm:p-2.5 lg:p-3 border-b border-slate-100 bg-slate-50/50 min-w-[90px] sm:min-w-[105px] lg:min-w-[120px]">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{fecha.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                    <span className="text-base sm:text-lg font-black text-slate-800 leading-tight">{fecha.getDate()}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{fecha.toLocaleDateString('es-ES', { month: 'short' })}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-50/20">
            {bloquesDelTurno.map((bloque) => (
              <tr key={bloque.id} className="group">
                <td className="p-2.5 sm:p-3 lg:p-4 border-b border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9] group-hover:bg-slate-50 transition-colors">

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-700">
                      {bloque?.hora_inicio?.slice(0, 5)}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium pb-0.5">a</span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-700">
                      {bloque?.hora_fin?.slice(0, 5)}
                    </span>
                  </div>
                </td>

                {fechasVisibles.map((fecha, fIdx) => {
                  const fechaStr = formatearFecha(fecha);
                  const infoCelda = getEstadoCelda(fechaStr, bloque.id);
                  const isInteractable = infoCelda.label === 'Libre' || infoCelda.label === 'Seleccionado';

                  return (
                    <td key={`${fIdx}-${bloque.id}`} className="p-1.5 sm:p-2 border-b border-slate-100">
                      <button
                        type="button"
                        disabled={!isInteractable}
                        onClick={() => onToggleCelda(fechaStr, bloque.id)}
                        className={`w-full h-12 sm:h-14 lg:h-16 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${infoCelda.clase}`}
                      >
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase">
                          {infoCelda.label}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {bloquesDelTurno.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <p className="text-sm font-medium">No hay bloques configurados para este turno.</p>
          </div>
        )}
      </div>

      <div className="lg:hidden">
        <ShiftGridMobile
          bloquesDelTurno={bloquesDelTurno}
          fechasVisibles={fechasVisibles}
          disponibilidad={disponibilidad}
          misReservas={misReservas}
          seleccion={seleccion}
          onToggleCelda={onToggleCelda}
        />
      </div>
    </div>
  );
}