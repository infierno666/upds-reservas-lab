"use client";

import { useState } from "react";
import { Solicitud } from "@/lib/services/admin.service";
import { AvailabilityCheck } from "./AvailabilityCheck";
import { Check, X, Mail, AlertTriangle } from "lucide-react";

interface Props {
    solicitud: Solicitud;
    onAction: (estado: 'aprobada' | 'rechazada', motivo?: string) => void;
    isProcessing?: boolean;
}

export function SolicitudDetail({ solicitud, onAction, isProcessing = false }: Props) {
    const [popupActivo, setPopupActivo] = useState<'aprobada' | 'rechazada' | null>(null);
    const [motivo, setMotivo] = useState("");

    // Extracción segura (Resuelve el problema de que no se vean los horarios)
    const getSafeValue = (field: any) => Array.isArray(field) ? field[0] : field;

    const perfil = getSafeValue(solicitud.perfiles);
    const lab = getSafeValue(solicitud.laboratorios);
    const bloque = getSafeValue(solicitud.bloques_horarios);

    const handleConfirmarAccion = () => {
        if (popupActivo === 'rechazada' && !motivo.trim()) return;
        onAction(popupActivo!, popupActivo === 'rechazada' ? motivo : undefined);
        setPopupActivo(null);
        setMotivo("");
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">

            <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    ID: {solicitud.id.split('-')[0]}
                </span>
                <h2 className="text-2xl font-bold mt-1 text-slate-800">
                    Solicitud de {lab?.nombre ?? "Laboratorio"}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Docente Solicitante</p>
                    <p className="text-sm font-semibold text-slate-700">
                        {perfil?.nombre_completo ?? "Desconocido"}
                    </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Materia / Actividad</p>
                    <p className="text-sm font-semibold text-slate-700">
                        {solicitud.materia_actividad}
                    </p>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">Fecha Solicitada</p>
                    <p className="text-sm font-bold text-slate-800">
                        {solicitud.fecha}
                    </p>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">
                        Horario • Turno <span className="capitalize">{bloque?.turno ?? "N/A"}</span>
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                        {bloque ? `${bloque.hora_inicio.slice(0, 5)} - ${bloque.hora_fin.slice(0, 5)}` : "Horario no definido"}
                    </p>
                </div>
            </div>

            <AvailabilityCheck
                isAvailable={true}
                nombreLaboratorio={lab?.nombre}
            />

            <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors text-sm font-medium">
                    <Mail size={16} /> Contactar
                </button>
                <button
                    onClick={() => setPopupActivo('rechazada')}
                    disabled={isProcessing}
                    className="flex-1 bg-white border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-all text-sm font-bold disabled:opacity-50"
                >
                    <X size={18} /> Rechazar
                </button>
                <button
                    onClick={() => setPopupActivo('aprobada')}
                    disabled={isProcessing}
                    className="flex-1 bg-upds-primary text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-upds-primary/90 transition-all text-sm font-bold shadow-sm disabled:opacity-50"
                >
                    <Check size={18} /> Aprobar Solicitud
                </button>
            </div>

            {popupActivo && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            {popupActivo === 'aprobada' ? (
                                <>
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                        <Check size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">¿Aprobar esta solicitud?</h3>
                                    <p className="text-sm text-slate-600 mb-6">
                                        Al confirmar, la reserva del <strong>{solicitud.fecha}</strong> de <strong>{bloque ? `${bloque.hora_inicio.slice(0, 5)} a ${bloque.hora_fin.slice(0, 5)}` : ""}</strong> quedará aprobada.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">¿Seguro que deseas rechazar?</h3>
                                    <div className="mb-6 mt-4">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo del rechazo *</label>
                                        <textarea
                                            className="w-full text-sm p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                                            placeholder="Escriba el motivo aquí..."
                                            rows={3}
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex gap-3 justify-end mt-2">
                                <button onClick={() => setPopupActivo(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                                <button
                                    onClick={handleConfirmarAccion}
                                    disabled={isProcessing || (popupActivo === 'rechazada' && !motivo.trim())}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${popupActivo === 'aprobada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {isProcessing ? "Procesando..." : "Confirmar Acción"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}