"use client";

import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { FlaskConical, CalendarRange, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { ReservaCardDetalle } from "./ReservaCardDetalle";

interface ReservaCardProps {
  grupo: any;
  expandedGroup: string | null;
  setExpandedGroup: (id: string | null) => void;
  setModalAction: (val: { isOpen: boolean; grupoId: string | null; motivo: string }) => void;
  setModalAsistencia: (val: { isOpen: boolean; reservaId: string; fecha: string; laboratorio: string }) => void;
}

// Tarjeta de solicitud de reserva para vista mobile/tablet (< lg)
export function ReservaCard({
  grupo, expandedGroup, setExpandedGroup, setModalAction, setModalAsistencia,
}: ReservaCardProps) {
  const isExpanded = expandedGroup === grupo.id;
  const reservaBase = grupo.reservasCrudas?.[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-start">
        <span className="font-mono font-bold text-slate-700 text-sm">REQ-{grupo.id.slice(0, 5)}</span>
        <StatusBadge estado={grupo.estado} />
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-xl text-slate-600 shrink-0">
          <FlaskConical size={16} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate">{grupo.laboratorio}</p>
          <p className="text-sm text-slate-500 truncate">{grupo.materia}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-medium">
        Solicitado: <span className="text-slate-600 font-semibold">{grupo.fechaSolicitud}</span>
      </p>

      <button
        onClick={() => setExpandedGroup(isExpanded ? null : grupo.id)}
        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-xs"
      >
        <CalendarRange size={14} className="text-[#001D4A]" />
        {grupo.diasAgrupados.length} Días
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <ReservaCardDetalle grupo={grupo} setModalAsistencia={setModalAsistencia} />
      )}

      {reservaBase && (
        <div className="flex gap-2 pt-1">
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-500 hover:text-blue-600 rounded-xl transition-all text-xs font-bold"
            >
              <Edit2 size={16} /> Editar
            </Link>
          )}
          {grupo.estado !== "cancelada" && grupo.estado !== "rechazada" && (
            <button
              onClick={() => setModalAction({ isOpen: true, grupoId: grupo.id, motivo: "" })}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-xl transition-all text-xs font-bold"
            >
              <Trash2 size={16} /> Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}