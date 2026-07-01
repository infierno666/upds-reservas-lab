"use client";

import { useState, useEffect } from "react";
import { SolicitudGrupo, ReservaIndividual, TramiteProcesado } from "@/lib/services/admin.service";
import { AvailabilityCheck } from "./AvailabilityCheck";
import { ModalEdicionFechas } from "./ModalEdicionFechas";
import { Check, X, Calendar, Clock, Edit3, AlertTriangle, Info } from "lucide-react";

interface Props {
    solicitud: SolicitudGrupo;
    onProcesarTramite: (tramite: TramiteProcesado) => void;
    isProcessing?: boolean;
}

export function SolicitudDetail({ solicitud, onProcesarTramite, isProcessing = false }: Props) {

    // ========================================================================
    // 1. ESTADO "BORRADOR" (Local)
    // ========================================================================
    const [borrador, setBorrador] = useState({
        laboratorio_nombre: solicitud.laboratorio_nombre,
        materia_actividad: solicitud.materia_actividad,
        reservas_activas: solicitud.reservas
    });

    // Sincronizar el borrador cada vez que el admin selecciona un trámite diferente
    useEffect(() => {
        setBorrador({
            laboratorio_nombre: solicitud.laboratorio_nombre,
            materia_actividad: solicitud.materia_actividad,
            reservas_activas: solicitud.reservas
        });
        setPopupActivo(null);
        setShowEditorFechas(false);
    }, [solicitud]);

    // Detectar si el admin hizo cambios locales
    const hayCambiosLocales =
        borrador.laboratorio_nombre !== solicitud.laboratorio_nombre ||
        borrador.materia_actividad !== solicitud.materia_actividad ||
        borrador.reservas_activas.length !== solicitud.reservas.length;

    // ========================================================================
    // 2. ESTADOS DE UI (Modales y Popups)
    // ========================================================================
    const [popupActivo, setPopupActivo] = useState<'aprobada' | 'rechazada' | null>(null);
    const [showEditorFechas, setShowEditorFechas] = useState(false);
    const [motivo, setMotivo] = useState("");

    // FASE 4: EL CONSTRUCTOR DEL PAQUETE FINAL
    const handleConfirmarAccion = () => {
        if (popupActivo === 'rechazada' && !motivo.trim()) return;

        // Construimos los arreglos de IDs
        const aprobadosIds = popupActivo === 'aprobada'
            ? borrador.reservas_activas.map(r => r.id)
            : []; // Si rechaza todo, aprobados está vacío

        const rechazadosIds = popupActivo === 'rechazada'
            ? solicitud.reservas.map(r => r.id) // Si rechaza todo, van todos los IDs originales
            : solicitud.reservas.filter(r => !borrador.reservas_activas.find(b => b.id === r.id)).map(r => r.id); // Si aprueba, los que faltan en el borrador son los rechazados

        const tramiteFinal: TramiteProcesado = {
            aprobadosIds,
            rechazadosIds,
            motivoRechazo: motivo,
            nuevaMateria: borrador.materia_actividad,
            nuevoLaboratorioNombre: borrador.laboratorio_nombre
        };

        onProcesarTramite(tramiteFinal);
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">

            {/* ALERTA DE CAMBIOS LOCALES */}
            {hayCambiosLocales && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                    <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-800">Modo Edición Activo</h4>
                        <p className="text-xs font-medium text-blue-600 mt-1">
                            Has realizado cambios en el laboratorio o materia. Estos cambios solo se guardarán al confirmar la aprobación del trámite.
                        </p>
                    </div>
                </div>
            )}

            {/* CABECERA DEL TRÁMITE */}
            <div className="border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#004B87]/10 text-[#004B87] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        TRÁMITE REQ-{solicitud.grupo_id.slice(0, 5)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                        Ingresado el {new Date(solicitud.fecha_creacion).toLocaleString()}
                    </span>
                </div>

                {/* EDITOR DE LABORATORIO (Borrador) */}
                <div className="mt-4">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                        Laboratorio Asignado
                    </label>
                    <select
                        value={borrador.laboratorio_nombre}
                        onChange={(e) => setBorrador({ ...borrador, laboratorio_nombre: e.target.value })}
                        className={`w-full max-w-md text-2xl font-black text-slate-800 bg-transparent border-b-2 outline-none transition-colors ${hayCambiosLocales ? 'border-[#004B87] bg-blue-50/30' : 'border-transparent hover:border-slate-200 focus:border-[#004B87]'}`}
                    >
                        {/* En un caso real, esto se mapearía desde la base de datos */}
                        <option value={solicitud.laboratorio_nombre}>{solicitud.laboratorio_nombre} (Original)</option>
                        <option value="Laboratorio Cisco">Laboratorio Cisco</option>
                        <option value="Laboratorio Mac">Laboratorio Mac</option>
                        <option value="Laboratorio Redes">Laboratorio Redes</option>
                    </select>
                </div>
            </div>

            {/* INFORMACIÓN GENERAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-wider mb-1.5">Docente Responsable</p>
                    <p className="text-base font-bold text-[#004B87]">
                        {solicitud.docente_nombre}
                    </p>
                </div>

                {/* EDITOR DE MATERIA (Borrador) */}
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-wider mb-1.5">Materia / Actividad</p>
                    <input
                        type="text"
                        value={borrador.materia_actividad}
                        onChange={(e) => setBorrador({ ...borrador, materia_actividad: e.target.value })}
                        className={`w-full text-base font-bold text-slate-700 bg-transparent border-b outline-none transition-colors ${borrador.materia_actividad !== solicitud.materia_actividad ? 'border-[#004B87]' : 'border-transparent focus:border-slate-300'}`}
                    />
                </div>
            </div>

            {/* DESGLOSE DE FECHAS (GRID) */}
            <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Desglose de Fechas ({solicitud.total_bloques} bloques)
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {solicitud.reservas.map((res) => (
                            <div key={res.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Calendar size={14} className="text-slate-400" />
                                    {res.fecha}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#004B87] bg-[#004B87]/5 px-2 py-1 rounded">
                                    <Clock size={12} />
                                    {res.bloques_horarios?.hora_inicio.slice(0, 5)} - {res.bloques_horarios?.hora_fin.slice(0, 5)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ANÁLISIS DE DISPONIBILIDAD */}
            {/* Pasamos el nombre del laboratorio del borrador para que revalúe si se cambia */}
            <AvailabilityCheck
                reservas={solicitud.reservas}
                nombreLaboratorio={borrador.laboratorio_nombre}
                conflictosIds={[]} // Fase 4
            />

            {/* BOTONES DE ACCIÓN MASIVA */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
                <button
                    onClick={() => setShowEditorFechas(true)}
                    disabled={isProcessing}
                    className="flex-1 min-w-[200px] bg-white border-2 border-slate-200 text-slate-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-black uppercase tracking-wider disabled:opacity-50"
                >
                    <Edit3 size={18} /> Editar Fechas
                </button>
                <button
                    onClick={() => {
                        setPopupActivo('rechazada');
                        setMotivo(""); // Limpiar motivo al abrir
                    }}
                    disabled={isProcessing}
                    className="flex-1 min-w-[200px] bg-white border-2 border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all text-sm font-black uppercase tracking-wider disabled:opacity-50"
                >
                    <X size={20} /> Rechazar Trámite
                </button>
                <button
                    onClick={() => {
                        setPopupActivo('aprobada');
                        // Si hay rechazados implícitos (por la edición de la grilla), requerimos motivo obligatoriamente
                        if (borrador.reservas_activas.length < solicitud.reservas.length) {
                            setMotivo("Bloques no disponibles por mantenimiento/conflicto de horarios.");
                        }
                    }}
                    disabled={isProcessing || borrador.reservas_activas.length === 0}
                    className="flex-1 min-w-[200px] bg-[#004B87] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#003865] shadow-lg shadow-[#004B87]/20 transition-all text-sm font-black uppercase tracking-wider disabled:opacity-50"
                >
                    <Check size={20} /> Confirmar Aprobación
                </button>
            </div>

            {/* MODAL DE CONFIRMACIÓN FINAL */}
            {popupActivo && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                        <div className="p-8">
                            {popupActivo === 'aprobada' ? (
                                <>
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                        <Check size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Confirmar Aprobación</h3>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-2">
                                        <p className="text-sm font-bold text-slate-700 flex justify-between">
                                            <span>Bloques a aprobar:</span>
                                            <span className="text-emerald-600">{borrador.reservas_activas.length}</span>
                                        </p>

                                        {/* Mostrar cuántos se están rechazando por edición */}
                                        {borrador.reservas_activas.length < solicitud.reservas.length && (
                                            <p className="text-sm font-bold text-slate-700 flex justify-between">
                                                <span>Bloques a rechazar:</span>
                                                <span className="text-red-500">{solicitud.reservas.length - borrador.reservas_activas.length}</span>
                                            </p>
                                        )}
                                    </div>

                                    {hayCambiosLocales && (
                                        <div className="bg-blue-50 text-blue-800 text-xs font-bold p-3 rounded-lg mb-4 border border-blue-200">
                                            ⚠️ La solicitud se guardará con los cambios aplicados en el borrador (Laboratorio, Materia o Fechas editadas).
                                        </div>
                                    )}

                                    {/* Mostrar input de motivo si se rechazaron fechas parcialmente */}
                                    {borrador.reservas_activas.length < solicitud.reservas.length && (
                                        <div className="mb-6">
                                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Motivo del rechazo parcial *</label>
                                            <textarea
                                                className="w-full text-sm font-medium text-slate-700 p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#004B87]/20 resize-none transition-all"
                                                rows={2}
                                                value={motivo}
                                                onChange={(e) => setMotivo(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* UI DEL RECHAZO TOTAL (Idéntico a fases anteriores) */}
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                        <AlertTriangle size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Rechazar paquete completo</h3>
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium">
                                        Se cancelarán las {solicitud.reservas.length} reservas. Debes justificar el motivo para notificar al docente.
                                    </p>
                                    <div className="mb-8">
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Motivo del rechazo *</label>
                                        <textarea
                                            className="w-full text-sm font-medium text-slate-700 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 resize-none transition-all"
                                            placeholder="Ej: El laboratorio entra en mantenimiento preventivo..."
                                            rows={4}
                                            value={motivo}
                                            onChange={(e) => setMotivo(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* BOTONES DEL MODAL */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setPopupActivo(null)}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmarAccion}
                                    disabled={isProcessing || (popupActivo === 'rechazada' && !motivo.trim()) || (popupActivo === 'aprobada' && borrador.reservas_activas.length < solicitud.reservas.length && !motivo.trim())}
                                    className={`px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white rounded-xl transition-all shadow-md disabled:opacity-50 disabled:shadow-none ${popupActivo === 'aprobada'
                                        ? 'bg-[#004B87] hover:bg-[#003865] shadow-[#004B87]/20'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                        }`}
                                >
                                    {isProcessing ? "Procesando..." : "Confirmar Orden"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* INVOCACIÓN DEL NUEVO MODAL DE EDICIÓN CON GRILLA */}
            {/* ====================================================== */}
            {showEditorFechas && (
                <ModalEdicionFechas
                    reservasOriginales={solicitud.reservas} // Le pasamos todas para que arme la grilla
                    reservasActivas={borrador.reservas_activas} // Le pasamos las activas para marcarlas
                    onCancel={() => setShowEditorFechas(false)}
                    onSave={(nuevasReservasActivas) => {
                        // AQUÍ ES LA MAGIA: Actualizamos el borrador local y cerramos el modal
                        setBorrador({ ...borrador, reservas_activas: nuevasReservasActivas });
                        setShowEditorFechas(false);
                    }}
                />
            )}

        </div>
    );
}