"use client";

import React from "react";
import { AlertCircle, CalendarDays, Loader2 } from "lucide-react";
import { ReservaCard } from "./ReservaCard";

interface ReservasListMobileProps {
  isError: boolean;
  isLoading: boolean;
  error: unknown;
  gruposAgrupados: any[];
  expandedGroup: string | null;
  setExpandedGroup: (id: string | null) => void;
  setModalAction: (val: { isOpen: boolean; grupoId: string | null; motivo: string }) => void;
  setModalAsistencia: (val: { isOpen: boolean; reservaId: string; fecha: string; laboratorio: string }) => void;
}

// Lista de reservas en formato tarjeta para pantallas menores a "lg"
export function ReservasListMobile({
  isError, isLoading, error, gruposAgrupados,
  expandedGroup, setExpandedGroup, setModalAction, setModalAsistencia,
}: ReservasListMobileProps) {
  if (isError) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center px-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-slate-600 font-bold text-lg">Hubo un problema al cargar los datos</p>
        <p className="text-sm text-slate-400">{(error as Error).message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#001D4A]" size={40} />
        <span className="text-slate-500 font-medium">Procesando historial de reservas...</span>
      </div>
    );
  }

  if (gruposAgrupados.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center gap-3 text-center px-4">
        <CalendarDays size={50} className="text-slate-200" />
        <p className="text-lg font-medium text-slate-600">No se encontraron resultados</p>
        <p className="text-sm text-slate-500">Intente modificar los filtros o realice una nueva solicitud.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {gruposAgrupados.map((grupo: any) => (
        <ReservaCard
          key={grupo.id}
          grupo={grupo}
          expandedGroup={expandedGroup}
          setExpandedGroup={setExpandedGroup}
          setModalAction={setModalAction}
          setModalAsistencia={setModalAsistencia}
        />
      ))}
    </div>
  );
}