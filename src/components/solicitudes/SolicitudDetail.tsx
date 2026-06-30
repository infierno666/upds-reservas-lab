"use client";

import { useState } from "react";
import { SolicitudGrupo } from "@/lib/services/admin.service";
import { AvailabilityCheck } from "./AvailabilityCheck";
import { Check, X, Calendar, Clock, Edit3, AlertTriangle } from "lucide-react";
import { PartialApprovalModal } from "./PartialApprovalModal";

interface Props {
    solicitud: SolicitudGrupo;
    onAction: (estado: 'aprobada' | 'rechazada', motivo?: string) => void;
    onActionParcial: (aprobados: string[], rechazados: string[], motivo: string) => void;
    isProcessing?: boolean;
}

export function SolicitudDetail({ solicitud, onAction, onActionParcial, isProcessing = false }: Props) {
    const [popupActivo, setPopupActivo] = useState<'aprobada' | 'rechazada' | null>(null);
    const [motivo, setMotivo] = useState("");
    const [showPartialModal, setShowPartialModal] = useState(false);

    const handleConfirmarAccion = () => {
        if (popupActivo === 'rechazada' && !motivo.trim()) return;
        onAction(popupActivo!, popupActivo === 'rechazada' ? motivo : undefined);
        setPopupActivo(null);
        setMotivo("");
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">

            {/* CABECERA DEL TRÁMITE */}
            <div className="border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#004B87]/10 text-[#004B87] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        TRÁMITE REQ-{solicitud.grupo_id.slice(0, 5)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                        {new Date(solicitud.fecha_creacion).toLocaleString()}
                    </span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {solicitud.laboratorio_nombre}
                </h2>
            </div>

            {/* INFORMACIÓN GENERAL */}
            <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-wider mb-1.5">Docente Responsable</p>
                    <p className="text-base font-bold text-[#004B87]">
                        {solicitud.docente_nombre}
                    </p>
                </div>
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-wider mb-1.5">Materia / Actividad</p>
                    <p className="text-base font-bold text-slate-700">
                        {solicitud.materia_actividad}
                    </p>
                </div>
            </div>

            {/* DESGLOSE DE FECHAS (GRID) */}
            <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Desglose de Fechas ({solicitud.total_bloques} bloques)
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {solicitud.reservas.map((res) => (
                            <div key={res.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-[#004B87]/30 transition-colors">
                                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                                    <Calendar size={16} className="text-slate-400" />
                                    {res.fecha}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#004B87] bg-[#004B87]/5 px-2.5 py-1 rounded-md">
                                    <Clock size={14} />
                                    {res.bloques_horarios?.hora_inicio.slice(0, 5)} - {res.bloques_horarios?.hora_fin.slice(0, 5)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ANÁLISIS DE DISPONIBILIDAD */}
            <AvailabilityCheck
                reservas={solicitud.reservas}
                nombreLaboratorio={solicitud.laboratorio_nombre}
                conflictosIds={[]} // Por ahora vacío, en Fase 4 lo conectaremos a validación real
            />

            {/* BOTONES DE ACCIÓN MASIVA */}
            <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button
                    onClick={() => setShowPartialModal(true)}
                    disabled={isProcessing}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-black uppercase tracking-wider disabled:opacity-50"
                >
                    <Edit3 size={18} /> Modificar Fechas
                </button>
                <button
                    onClick={() => setPopupActivo('rechazada')}
                    disabled={isProcessing}
                    className="flex-1 bg-white border-2 border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all text-sm font-black uppercase tracking-wider disabled:opacity-50"
                >
                    <X size={20} /> Rechazar Todo
                </button>
                <button
                    onClick={() => setPopupActivo('aprobada')}
                    disabled={isProcessing}
                    className="flex-1 bg-[#004B87] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#003865] shadow-lg shadow-[#004B87]/20 transition-all text-sm font-black uppercase tracking-wider disabled:opacity-50"
                >
                    <Check size={20} /> Aprobar Todo
                </button>
            </div>
            {showPartialModal && (
                <PartialApprovalModal
                    reservas={solicitud.reservas}
                    isProcessing={isProcessing}
                    onCancel={() => setShowPartialModal(false)}
                    onConfirm={(aprobados, rechazados, motivoRechazo) => {
                        // Este evento lo pasaremos al padre (page.tsx)
                        onActionParcial?.(aprobados, rechazados, motivoRechazo);
                        setShowPartialModal(false);
                    }}
                />
            )}

            {/* MODALES DE CONFIRMACIÓN */}
            {popupActivo && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8">
                            {popupActivo === 'aprobada' ? (
                                <>
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                        <Check size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">¿Aprobar paquete completo?</h3>
                                    <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
                                        Estás a punto de aprobar <strong>{solicitud.total_bloques} reservas</strong> para el <strong>{solicitud.laboratorio_nombre}</strong>. El docente será notificado inmediatamente.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                        <AlertTriangle size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Rechazar paquete completo</h3>
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium">
                                        Se cancelarán las {solicitud.total_bloques} reservas. Debes justificar el motivo para notificar al docente.
                                    </p>
                                    <div className="mb-8">
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Motivo del rechazo *</label>
                                        <textarea
                                            className="w-full text-sm font-medium text-slate-700 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 resize-none transition-all"
                                            placeholder="Ej: El laboratorio entra en mantenimiento preventivo esas semanas..."
                                            rows={4}
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setPopupActivo(null)}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmarAccion}
                                    disabled={isProcessing || (popupActivo === 'rechazada' && !motivo.trim())}
                                    className={`px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white rounded-xl transition-all shadow-md disabled:opacity-50 disabled:shadow-none ${popupActivo === 'aprobada'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                        }`}
                                >
                                    {isProcessing ? "Procesando..." : "Confirmar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}