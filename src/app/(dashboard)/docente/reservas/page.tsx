"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMisReservas, cancelarGrupoReservas, confirmarAsistencia } from "@/lib/services/reservaService";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar } from "@/components/reservas/FilterBar";
import { CustomModal } from "@/components/ui/CustomModal";
import { Toast, ToastType } from "@/components/ui/toast";
import { ConfirmarAsistenciaModal } from "@/components/reservas/ConfirmarAsistenciaModal";
import { ReservasListMobile } from "@/components/reservas/ReservasListMobile";
import {
  FlaskConical, Loader2, Plus, Trash2, CalendarDays,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock, AlertCircle, CalendarRange, Edit2
} from "lucide-react";
import Link from "next/link";

export default function MisReservasPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({});

  // Paginación
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 500;
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Modal de cancelación de grupo
  const [modalAction, setModalAction] = useState<{
    isOpen: boolean;
    grupoId: string | null;
    motivo: string;
  }>({ isOpen: false, grupoId: null, motivo: "" });

  // Modal de confirmación de asistencia por día
  const [modalAsistencia, setModalAsistencia] = useState<{
    isOpen: boolean;
    reservaId: string;
    fecha: string;
    laboratorio: string;
  }>({ isOpen: false, reservaId: "", fecha: "", laboratorio: "" });

  // Notificaciones flotantes
  const [toast, setToast] = useState<{ show: boolean; type: ToastType; message: string }>({
    show: false, type: "success", message: "",
  });

  const showToast = (type: ToastType, message: string) => {
    setToast({ show: true, type, message });
  };

  // Confirma o rechaza la asistencia del docente a una reserva puntual
  const handleAsistencia = async (asistio: boolean) => {
    try {
      await confirmarAsistencia(modalAsistencia.reservaId, asistio);
      setModalAsistencia({ isOpen: false, reservaId: "", fecha: "", laboratorio: "" });
      queryClient.invalidateQueries({ queryKey: ["misReservas"] });
      showToast("success", asistio ? "Asistencia confirmada." : "Inasistencia registrada.");
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Consulta paginada de reservas del docente autenticado
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["misReservas", filters, page],
    queryFn: () => getMisReservas(page, PAGE_SIZE, filters),
  });

  // Agrupa las reservas crudas por grupo_solicitud_id para mostrar en tabla
  const gruposAgrupados = useMemo(() => {
    if (!data?.data) return [];

    const map = data.data.reduce((acc: any, r: any) => {
      if (!acc[r.grupo_solicitud_id]) {
        const fechaSolicitud = r.created_at
          ? new Intl.DateTimeFormat("es-ES", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }).format(new Date(r.created_at))
          : "N/A";

        acc[r.grupo_solicitud_id] = {
          id: r.grupo_solicitud_id,
          materia: r.materias?.nombre || r.materia_actividad || "Sin asignar",
          laboratorio: r.laboratorios?.nombre || "Lab. Desconocido",
          estado: r.estado,
          fechaSolicitud,
          totalBloques: 0,
          reservasCrudas: [],
        };
      }
      acc[r.grupo_solicitud_id].reservasCrudas.push(r);
      acc[r.grupo_solicitud_id].totalBloques += 1;
      return acc;
    }, {});

    const gruposArray = Object.values(map).map((grupo: any) => {
      const porFecha = grupo.reservasCrudas.reduce((fAcc: any, res: any) => {
        const fecha = res.fecha;
        const turno = res.bloques_horarios?.turno || "Desconocido";
        const periodo = res.bloques_horarios?.periodo || 1;

        if (!fAcc[fecha]) fAcc[fecha] = {};
        if (!fAcc[fecha][turno]) fAcc[fecha][turno] = [];

        fAcc[fecha][turno].push(periodo);
        return fAcc;
      }, {});

      const diasProcesados = Object.entries(porFecha).map(([fecha, turnosObj]) => {
        const entriesValidas = Object.entries(turnosObj as Record<string, any[]>);
        const etiquetasTurnos = entriesValidas.map(([turno, periodos]) => {
          const tipo = periodos.length === 2 ? "Completo" : "Medio";
          const turnoCapitalized = turno.charAt(0).toUpperCase() + turno.slice(1);
          return `Turno ${turnoCapitalized} (${tipo})`;
        });
        return { fecha, etiquetas: etiquetasTurnos };
      });

      diasProcesados.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      return { ...grupo, diasAgrupados: diasProcesados };
    });

    return gruposArray;
  }, [data]);

  const totalRecords = data?.count || 0;
  const hasNextPage = page * PAGE_SIZE < totalRecords;

  // Cancela todas las reservas de un grupo con justificación obligatoria
  const handleConfirmCancel = async () => {
    if (!modalAction.grupoId || !modalAction.motivo.trim()) {
      showToast("error", "Por favor, escriba una justificación válida para la cancelación.");
      return;
    }
    try {
      await cancelarGrupoReservas(modalAction.grupoId, modalAction.motivo);
      queryClient.invalidateQueries({ queryKey: ["misReservas"] });
      setModalAction({ isOpen: false, grupoId: null, motivo: "" });
      setExpandedGroup(null);
      showToast("success", "La solicitud de reserva ha sido cancelada exitosamente.");
    } catch (err: any) {
      showToast("error", err.message || "Ocurrió un problema al intentar cancelar la solicitud.");
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-[95%] xl:max-w-[1800px] mx-auto flex flex-col lg:h-full space-y-6 animate-in fade-in duration-500">
      {/* Notificaciones flotantes */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Modal de cancelación de grupo */}
      <CustomModal
        isOpen={modalAction.isOpen}
        type="confirm"
        title="Cancelar Solicitud Definitivamente"
        message="Esta acción cancelará TODAS las fechas y turnos programados en este grupo. Por favor, indique el motivo:"
        onClose={() => setModalAction({ ...modalAction, isOpen: false, motivo: "" })}
        onConfirm={handleConfirmCancel}
        isDestructive={true}
        confirmText="Sí, Cancelar Reserva"
        cancelText="Volver atrás"
      >
        <textarea
          className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/30 transition-all text-slate-700 resize-none text-sm font-medium"
          rows={3}
          placeholder="Ej. Cambio de planificación académica..."
          value={modalAction.motivo}
          onChange={(e) => setModalAction({ ...modalAction, motivo: e.target.value })}
        />
      </CustomModal>

      {/* Modal de confirmación de asistencia por día */}
      <ConfirmarAsistenciaModal
        isOpen={modalAsistencia.isOpen}
        fecha={modalAsistencia.fecha}
        laboratorio={modalAsistencia.laboratorio}
        onClose={() => setModalAsistencia({ isOpen: false, reservaId: "", fecha: "", laboratorio: "" })}
        onConfirmar={handleAsistencia}
      />

      {/* Cabecera */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Mis Solicitudes</h1>
          <p className="text-slate-500 font-medium mt-1">Historial completo de reservas de laboratorios.</p>
        </div>
        <Link
          href="/docente/reserva/nueva"
          className="bg-[#001D4A] hover:bg-[#001D4A]/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus size={20} /> Solicitar Laboratorio
        </Link>
      </div>

      <FilterBar onFilterChange={(newF: any) => { setFilters({ ...filters, ...newF }); setPage(1); }} />

      {/* Tabla principal */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col lg:flex-1 lg:overflow-hidden">
        <div className="overflow-x-auto flex-1 hidden lg:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Trámite</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Laboratorio</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Materia / Actividad</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Fecha de Solicitud</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-center">Volumen</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-center">Estado</th>
                <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isError ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={40} className="text-red-400" />
                      <p className="text-slate-600 font-bold text-lg">Hubo un problema al cargar los datos</p>
                      <p className="text-sm text-slate-400 max-w-md">{(error as Error).message}</p>
                    </div>
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={7} className="py-32 text-center">
                    <Loader2 className="animate-spin text-[#001D4A] mx-auto mb-4" size={40} />
                    <span className="text-slate-500 font-medium">Procesando historial de reservas...</span>
                  </td>
                </tr>
              ) : gruposAgrupados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-32 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <CalendarDays size={50} className="text-slate-200" />
                      <p className="text-lg font-medium text-slate-600">No se encontraron resultados</p>
                      <p className="text-sm">Intente modificar los filtros o realice una nueva solicitud.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                gruposAgrupados.map((grupo: any) => (
                  <React.Fragment key={grupo.id}>
                    <tr className={`transition-colors ${expandedGroup === grupo.id ? "bg-blue-50/20" : "hover:bg-slate-50/70"}`}>
                      <td className="px-6 py-5 font-mono font-bold text-slate-700">REQ-{grupo.id.slice(0, 5)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 font-semibold text-slate-800">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                            <FlaskConical size={18} />
                          </div>
                          {grupo.laboratorio}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-800">{grupo.materia}</td>
                      <td className="px-6 py-5 text-slate-500 font-medium whitespace-nowrap">{grupo.fechaSolicitud}</td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => setExpandedGroup(expandedGroup === grupo.id ? null : grupo.id)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-xs"
                        >
                          <CalendarRange size={14} className="text-[#001D4A]" />
                          {grupo.diasAgrupados.length} Días
                          {expandedGroup === grupo.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-center"><StatusBadge estado={grupo.estado} /></td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(() => {
                            const reservaBase = grupo.reservasCrudas?.[0];
                            if (!reservaBase) return null;
                            return (
                              <>
                                {/* Editar — solo disponible en estado pendiente */}
                                {grupo.estado === "pendiente" && (
                                  <Link
                                    href={{
                                      pathname: "/docente/reserva/nueva",
                                      query: {
                                        edit: "true",
                                        grupoId: grupo.id,
                                        lab: reservaBase.laboratorio_id,
                                        materiaId: reservaBase.materias?.id || reservaBase.materia_id,
                                        fecha: reservaBase.fecha,
                                        turno: reservaBase.bloques_horarios?.turno,
                                        vista: "semana",
                                      },
                                    }}
                                    className="p-2.5 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm"
                                    title="Editar Solicitud"
                                  >
                                    <Edit2 size={18} />
                                  </Link>
                                )}
                                {/* Cancelar — oculto si ya está cancelada o rechazada */}
                                {grupo.estado !== "cancelada" && grupo.estado !== "rechazada" && (
                                  <button
                                    onClick={() => setModalAction({ isOpen: true, grupoId: grupo.id, motivo: "" })}
                                    className="p-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-xl transition-all shadow-sm"
                                    title="Cancelar Solicitud"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>

                    {/* Acordeón con detalle de fechas, turnos y confirmación de asistencia */}
                    {expandedGroup === grupo.id && (
                      <tr className="bg-slate-50/50 border-b-0 animate-in slide-in-from-top-2">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <CalendarDays size={16} className="text-[#001D4A]" /> Detalle de Fechas y Turnos
                              </h4>
                              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                                Total: {grupo.totalBloques} bloques consumidos
                              </span>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {grupo.diasAgrupados.map((dia: any, idx: number) => (
                                  <div key={idx} className="flex flex-col bg-slate-50 border border-slate-100 p-4 rounded-xl hover:border-[#001D4A]/20 transition-colors shadow-xs">
                                    <span className="font-black text-slate-800 border-b border-slate-200 pb-2 mb-2">{dia.fecha}</span>
                                    <div className="flex flex-col gap-1.5">
                                      {dia.etiquetas.map((etiqueta: string, tIdx: number) => (
                                        <span key={tIdx} className="text-xs text-[#001D4A] font-bold flex items-center gap-1.5 bg-blue-50/50 w-fit px-2.5 py-1.5 rounded-lg border border-blue-100">
                                          <Clock size={12} className="text-blue-500" />
                                          {etiqueta}
                                        </span>
                                      ))}
                                    </div>

                                    {/*
                                      Botón de asistencia: aparece si la reserva es aprobada,
                                      la fecha ya pasó y el docente aún no ha confirmado ni
                                      fue cerrada por timeout automático
                                    */}
                                    {grupo.estado === "aprobada" &&
                                      new Date(dia.fecha) < new Date() &&
                                      grupo.reservasCrudas.some(
                                        (r: any) =>
                                          r.fecha === dia.fecha &&
                                          r.asistencia_confirmada === null &&
                                          !r.asistencia_resuelta_por_timeout
                                      ) && (
                                        <button
                                          onClick={() =>
                                            setModalAsistencia({
                                              isOpen: true,
                                              reservaId: grupo.reservasCrudas.find((r: any) => r.fecha === dia.fecha)?.id || "",
                                              fecha: dia.fecha,
                                              laboratorio: grupo.laboratorio,
                                            })
                                          }
                                          className="mt-3 text-xs font-bold text-[#001D4A] border border-[#001D4A]/20 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 w-full transition-all"
                                        >
                                          ¿Asististe este día?
                                        </button>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vista mobile: tarjetas */}
        <div className="lg:hidden">
          <ReservasListMobile
            isError={isError}
            isLoading={isLoading}
            error={error}
            gruposAgrupados={gruposAgrupados}
            expandedGroup={expandedGroup}
            setExpandedGroup={setExpandedGroup}
            setModalAction={setModalAction}
            setModalAsistencia={setModalAsistencia}
          />
        </div>

        {/* Paginación */}
        <div className="bg-white px-8 py-5 border-t border-slate-200 flex justify-between items-center shrink-0">
          <p className="text-sm font-medium text-slate-500">
            Visualizando página{" "}
            <span className="font-bold text-[#001D4A] bg-[#001D4A]/5 px-2.5 py-1 rounded-lg ml-1">{page}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}