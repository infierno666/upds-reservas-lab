"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, CalendarCheck, CalendarDays, CalendarRange, MapPin, Edit3 } from "lucide-react";
import {
  getLaboratorios,
  getBloquesHorarios,
  getMaterias,
  getDisponibilidadRango,
  crearReservaMasiva,
  getReservasPorGrupo,
  actualizarGrupoPendiente,
  getMisReservasRango
} from "@/lib/services/reservaService";
import { calcularFechasVisibles, formatearFecha } from "@/lib/utils/dateUtils";
import { useSearchParams, useRouter } from 'next/navigation';
import { ReservaSidebarConfig } from "@/components/reservas/ReservaSidebarConfig";
import { ShiftGridSelector } from "@/components/reservas/ShiftGridSelector";
import { CustomModal } from "@/components/ui/CustomModal";
import { CalendarNavigator } from "@/components/reservas/CalendarNavigator";
import { LaboratoryHorizontalSelector } from "@/components/reservas/LaboratoryHorizontalSelector";

interface CeldaSeleccionada {
  fecha: string;
  bloqueId: number;
}

export default function NuevaReservaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const turnoEditar = searchParams.get("turno");
  const vistaEditar = searchParams.get("vista");

  const isEditMode = searchParams.get('edit') === 'true';
  const editGrupoId = searchParams.get('grupoId');

  const [laboratorios, setLaboratorios] = useState<any[]>([]);
  const [bloques, setBloques] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);

  const [vista, setVista] = useState<'semana' | 'mes'>('semana');
  const [fechaPivote, setFechaPivote] = useState(formatearFecha(new Date()));
  const [fechasVisibles, setFechasVisibles] = useState<Date[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<any[]>([]);
  const [misReservas, setMisReservas] = useState<any[]>([]);

  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const dataLoaded = useRef(false);
  const [turnoInicial, setTurnoInicial] = useState("mañana");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean; type: 'success' | 'error' | 'confirm'; title: string; message: string; onConfirm?: () => void;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const [labSeleccionado, setLabSeleccionado] = useState("");
  const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState("");
  const [periodoModulo, setPeriodoModulo] = useState("1");
  const [periodoAnio, setPeriodoAnio] = useState(new Date().getFullYear().toString());

  const [seleccion, setSeleccion] = useState<CeldaSeleccionada[]>([]);
  const [bloquesOriginales, setBloquesOriginales] = useState<CeldaSeleccionada[]>([]);

  useEffect(() => {
    setIsLoadingCatalogs(true);
    Promise.all([getLaboratorios(), getBloquesHorarios(), getMaterias()])
      .then(([labs, blqs, mats]) => {
        setLaboratorios((labs || []).filter((lab: any) => lab.estado_operativo === "activo"));
        setBloques(blqs);
        setMaterias(mats);
      })
      .catch(console.error)
      .finally(() => setIsLoadingCatalogs(false));
  }, []);

  useEffect(() => {
    if (turnoEditar) setTurnoInicial(turnoEditar);
  }, [turnoEditar]);

  useEffect(() => {
    if (vistaEditar) setVista(vistaEditar as "semana" | "mes");
  }, [vistaEditar]);

  useEffect(() => {
    if (isEditMode && editGrupoId && !dataLoaded.current && laboratorios.length > 0) {
      setLabSeleccionado(searchParams.get('lab') || "");
      setMateriaIdSeleccionada(searchParams.get('materiaId') || "");
      setFechaPivote(searchParams.get('fecha') || formatearFecha(new Date()));

      getReservasPorGrupo(editGrupoId).then(data => {
        if (data && data.length > 0) {
          setPeriodoModulo(data[0].periodo_modulo.toString());
          setPeriodoAnio(data[0].periodo_anio.toString());

          const seleccionesPrevias = data.map((r: any) => ({
            fecha: r.fecha,
            bloqueId: r.bloque_horario_id
          }));

          setBloquesOriginales(seleccionesPrevias);
          setSeleccion(seleccionesPrevias);
          dataLoaded.current = true;
        }
      }).catch(console.error);
    }
  }, [isEditMode, editGrupoId, searchParams, laboratorios]);

  useEffect(() => {
    if (!labSeleccionado || !fechaPivote) return;

    const cargarGrilla = async () => {
      setIsLoadingGrid(true);
      try {
        const rango = calcularFechasVisibles(fechaPivote, vista);
        setFechasVisibles(rango.fechas);

        const dispo = await getDisponibilidadRango(labSeleccionado, rango.inicio, rango.fin);
        const propias = getMisReservasRango ? await getMisReservasRango(labSeleccionado, rango.inicio, rango.fin) : [];

        if (isEditMode && bloquesOriginales.length > 0) {
          setDisponibilidad(dispo.filter((d: any) => !bloquesOriginales.some(o => o.fecha === d.fecha && o.bloqueId === d.bloque_horario_id)));
          setMisReservas(propias.filter((p: any) => !bloquesOriginales.some(o => o.fecha === p.fecha && o.bloqueId === p.bloque_horario_id)));
        } else {
          setDisponibilidad(dispo);
          setMisReservas(propias);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingGrid(false);
      }
    };
    cargarGrilla();
  }, [labSeleccionado, fechaPivote, vista, isEditMode, bloquesOriginales]);

  const handleToggleCelda = (fecha: string, bloqueId: number) => {
    setSeleccion(prev => {
      const existe = prev.some(s => s.fecha === fecha && s.bloqueId === bloqueId);
      return existe
        ? prev.filter(s => !(s.fecha === fecha && s.bloqueId === bloqueId))
        : [...prev, { fecha, bloqueId }];
    });
  };

  const handleToggleMulti = (celdas: CeldaSeleccionada[], action: 'add' | 'remove') => {
    setSeleccion(prev => {
      if (action === "remove") {
        return prev.filter(p => !celdas.some(c => c.fecha === p.fecha && c.bloqueId === p.bloqueId));
      } else {
        const nuevos = celdas.filter(c => !prev.some(p => p.fecha === c.fecha && p.bloqueId === c.bloqueId));
        return [...prev, ...nuevos];
      }
    });
  };

  const solicitarConfirmacion = () => {
    if (seleccion.length === 0 || !materiaIdSeleccionada) {
      setModalConfig({
        isOpen: true, type: 'error', title: 'Datos Incompletos',
        message: 'Asegúrese de seleccionar una asignatura de su plan académico y marcar al menos un bloque en la grilla.'
      });
      return;
    }

    const mat = materias.find(m => m.id === materiaIdSeleccionada);
    setModalConfig({
      isOpen: true, type: 'confirm',
      title: isEditMode ? 'Confirmar Edición Masiva' : 'Confirmar Reservas Masivas',
      message: isEditMode
        ? `Va a reescribir esta solicitud guardando ${seleccion.length} bloques para la asignatura "${mat?.nombre}". Esto reemplazará sus turnos anteriores manteniendo el código de seguimiento intacto.`
        : `Va a registrar un lote de ${seleccion.length} bloques para la asignatura "${mat?.nombre}". Todas se consolidarán bajo un único número de trámite agrupado.`,
      onConfirm: handleSubmitReal
    });
  };

  const handleSubmitReal = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        laboratorio_id: labSeleccionado,
        materia_id: materiaIdSeleccionada,
        periodo_modulo: parseInt(periodoModulo),
        periodo_anio: parseInt(periodoAnio),
        selecciones: seleccion
      };

      if (isEditMode && editGrupoId) {
        await actualizarGrupoPendiente(editGrupoId, payload);
        setModalConfig({
          isOpen: true, type: 'success', title: '¡Modificación Exitosa!',
          message: 'La reserva ha sido actualizada correctamente en el sistema.',
          onConfirm: () => router.push('/docente/reservas')
        });
      } else {
        await crearReservaMasiva(payload);
        setModalConfig({
          isOpen: true, type: 'success', title: '¡Operación Exitosa!',
          message: 'Las solicitudes de espacio han sido consolidadas y enviadas a administración.',
          onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });

        setSeleccion([]);
        const rango = calcularFechasVisibles(fechaPivote, vista);
        setDisponibilidad(await getDisponibilidadRango(labSeleccionado, rango.inicio, rango.fin));
      }
    } catch (error: any) {
      setModalConfig({
        isOpen: true, type: 'error', title: 'Error del Sistema',
        message: error.message || 'Ocurrió un problema inesperado al registrar el lote.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCatalogs) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <Loader2 size={48} className="animate-spin text-[#001D4A]" />
        <p className="text-slate-500 font-bold tracking-tight animate-pulse">Sincronizando infraestructura...</p>
      </div>
    );
  }

  return (
    // Removido h-full, min-h-[calc...], y pb-6. Añadido max-w-[1600px]
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-500">

      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {isEditMode ? <Edit3 className="text-blue-600 shrink-0" size={28} /> : <CalendarCheck className="text-[#001D4A] shrink-0" size={28} />}
            <span className="truncate">{isEditMode ? 'Editor de Reservas' : 'Planificador de Espacios'}</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {isEditMode ? `Modificando la solicitud ${editGrupoId?.split('-')[0]}` : 'Gestione la ocupación y asigne bloques masivos por rangos de tiempo.'}
          </p>
        </div>

        <div className="flex w-full md:w-auto bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 shadow-sm shrink-0">
          <button
            onClick={() => setVista('semana')}
            className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-5 py-2 text-sm rounded-lg font-bold transition-all ${vista === 'semana' ? 'bg-white shadow-sm text-[#001D4A]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <CalendarDays size={16} /><span>Semana</span>
          </button>
          <button
            onClick={() => setVista('mes')}
            className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-5 py-2 text-sm rounded-lg font-bold transition-all ${vista === 'mes' ? 'bg-white shadow-sm text-[#001D4A]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <CalendarRange size={16} /><span>Mes</span>
          </button>
        </div>
      </div>

      <div className="w-full">
        <LaboratoryHorizontalSelector
          laboratorios={laboratorios}
          laboratorioSeleccionado={labSeleccionado}
          setLaboratorioSeleccionado={setLabSeleccionado}
        />
      </div>

      {/* Removido min-h-[500px] y cambiado a flex-col lg:flex-row */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start w-full">

        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-4">
          <ReservaSidebarConfig
            materias={materias}
            materiaIdSeleccionada={materiaIdSeleccionada} setMateriaIdSeleccionada={setMateriaIdSeleccionada}
            periodoModulo={periodoModulo} setPeriodoModulo={setPeriodoModulo}
            periodoAnio={periodoAnio} setPeriodoAnio={setPeriodoAnio}
            fechaPivote={fechaPivote} setFechaPivote={setFechaPivote}
            cantidadSeleccionada={seleccion.length}
            onLimpiarSeleccion={() => setSeleccion([])}
          />
        </div>

        <div className="w-full flex-1 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <CalendarNavigator fechaPivote={fechaPivote} vista={vista} setFechaPivote={setFechaPivote} />
          </div>

          <div className="w-full flex flex-col">
            {!labSeleccionado ? (
              <div className="w-full flex flex-col items-center justify-center text-slate-400 gap-4 p-8 min-h-[400px]">
                <div className="w-16 h-16 bg-slate-50 shadow-sm rounded-full flex items-center justify-center border border-slate-200/60">
                  <MapPin size={30} className="text-slate-400" />
                </div>
                <div className="text-center max-w-sm px-4">
                  <h3 className="text-lg sm:text-xl font-black text-slate-700 mb-1.5">Sin espacio seleccionado</h3>
                  <p className="text-sm font-medium text-slate-400">Elija un laboratorio arriba para cargar la disponibilidad.</p>
                </div>
              </div>
            ) : isLoadingGrid ? (
              <div className="w-full flex flex-col items-center justify-center gap-4 p-8 min-h-[400px]">
                <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
                  <Loader2 size={36} className="animate-spin text-[#001D4A]" />
                </div>
                <p className="text-slate-500 text-sm font-bold animate-pulse">Sincronizando matriz compartida...</p>
              </div>
            ) : (
              <>
                {/* Contenedor con scroll solo horizontal interno */}
                <div className="w-full overflow-x-auto custom-scrollbar p-2 sm:p-4">
                  <ShiftGridSelector
                    bloques={bloques}
                    fechasVisibles={fechasVisibles}
                    disponibilidad={disponibilidad}
                    misReservas={misReservas}
                    seleccion={seleccion}
                    turnoInicial={turnoInicial}
                    onToggleCelda={handleToggleCelda}
                    onToggleMulti={handleToggleMulti}
                  />
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                  <button
                    onClick={solicitarConfirmacion}
                    disabled={seleccion.length === 0 || !materiaIdSeleccionada || isSubmitting}
                    className={`w-full text-white font-black py-3.5 px-6 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-md flex justify-center items-center gap-3 text-sm sm:text-base tracking-wide ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#001D4A] hover:bg-[#004B87]'}`}
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (isEditMode ? <Edit3 size={20} /> : <CalendarCheck size={20} />)}
                    <span>{isSubmitting ? "Procesando..." : (isEditMode ? "Guardar Modificaciones" : "Procesar Reservas")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}