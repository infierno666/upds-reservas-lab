"use client";

import { useState } from "react";
import { ReservaIndividual } from "@/lib/services/admin.service";
import { AlertTriangle, Calendar, Check, Clock, X } from "lucide-react";

interface Props {
    reservas: ReservaIndividual[];
    onConfirm: (aprobadosIds: string[], rechazadosIds: string[], motivo: string) => void;
    onCancel: () => void;
    isProcessing: boolean;
}

export function PartialApprovalModal({ reservas, onConfirm, onCancel, isProcessing }: Props) {
    // Inicialmente, todos los IDs están marcados para ser APROBADOS
    const [aprobados, setAprobados] = useState<Set<string>>(new Set(reservas.map(r => r.id)));
    const [motivo, setMotivo] = useState("");

    const rechazadosCount = reservas.length - aprobados.size;

    const toggleReserva = (id: string) => {
        const newAprobados = new Set(aprobados);
        if (newAprobados.has(id)) {
            newAprobados.delete(id); // La pasamos a rechazadas
        } else {
            newAprobados.add(id); // La volvemos a aprobar
        }
        setAprobados(newAprobados);
    };

    const handleConfirm = () => {
        if (rechazadosCount > 0 && !motivo.trim()) return; // Validación de motivo obligatorio

        const aprobadosIds = Array.from(aprobados);
        const rechazadosIds = reservas.filter(r => !aprobados.has(r.id)).map(r => r.id);

        onConfirm(aprobadosIds, rechazadosIds, motivo);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* CABECERA */}
                <div className="p-6 border-b border-slate-100 flex items-start gap-4 bg-slate-50/50">
                    <div className="w-12 h-12 bg-blue-100 text-[#004B87] rounded-xl flex items-center justify-center shrink-0">
                        <Calendar size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Resolución Parcial</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Haz clic en las fechas para <strong className="text-red-500">rechazar</strong> bloques conflictivos y aprobar el resto.
                        </p>
                    </div>
                </div>

                {/* CUERPO CON SCROLL */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    {/* GRILLA INTERACTIVA */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {reservas.map((res) => {
                            const isAprobado = aprobados.has(res.id);
                            return (
                                <button
                                    key={res.id}
                                    onClick={() => toggleReserva(res.id)}
                                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${isAprobado
                                            ? 'border-[#004B87]/30 bg-[#004B87]/5 hover:bg-[#004B87]/10'
                                            : 'border-red-300 bg-red-50 opacity-90'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-xs font-black ${isAprobado ? 'text-[#004B87]' : 'text-red-600 line-through'}`}>
                                            {res.fecha}
                                        </span>
                                        {isAprobado ? <Check size={16} className="text-[#004B87]" /> : <X size={16} className="text-red-600" />}
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${isAprobado ? 'text-slate-600' : 'text-red-500/70 line-through'}`}>
                                        <Clock size={12} />
                                        {res.bloques_horarios?.hora_inicio.slice(0, 5)} - {res.bloques_horarios?.hora_fin.slice(0, 5)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ZONA DE MOTIVO (Solo visible si hay rechazos) */}
                    {rechazadosCount > 0 && (
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={18} className="text-amber-600" />
                                <h4 className="text-sm font-bold text-amber-800">
                                    Justificación requerida para {rechazadosCount} bloque(s)
                                </h4>
                            </div>
                            <textarea
                                className="w-full text-sm font-medium text-slate-700 p-3 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 resize-none transition-all"
                                placeholder="Indica al docente por qué se descartaron estas fechas (ej. Mantenimiento)..."
                                rows={3}
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 shrink-0">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing || (rechazadosCount > 0 && !motivo.trim())}
                        className="px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white bg-[#004B87] hover:bg-[#003865] rounded-xl transition-all shadow-md shadow-[#004B87]/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? "Procesando..." : "Confirmar Resolución"}
                    </button>
                </div>
            </div>
        </div>
    );
}