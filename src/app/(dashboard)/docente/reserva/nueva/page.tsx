"use client";

import { useState, useEffect } from "react";
import { Calendar, FlaskConical, BookOpen, Clock, Send, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { getLaboratorios, getBloquesHorarios, getDisponibilidad, crearSolicitudReserva } from "@/lib/services/reservaService";

export default function NuevaReservaPage() {
    // --- ESTADOS DE CATÁLOGOS Y DATA ---
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [bloques, setBloques] = useState<any[]>([]);
    const [disponibilidad, setDisponibilidad] = useState<any[]>([]);

    // --- ESTADOS DEL FORMULARIO (Adaptado al SQL de Nicolás) ---
    const [fecha, setFecha] = useState("");
    const [labSeleccionado, setLabSeleccionado] = useState("");
    const [materiaActividad, setMateriaActividad] = useState("");
    const [periodoModulo, setPeriodoModulo] = useState("1"); // 1 al 12
    const [periodoAnio, setPeriodoAnio] = useState(new Date().getFullYear().toString()); // Año actual

    const [bloquesSeleccionados, setBloquesSeleccionados] = useState<number[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // --- EFECTO INICIAL ---
    useEffect(() => {
        const initData = async () => {
            try {
                const [labsData, bloquesData] = await Promise.all([
                    getLaboratorios(),
                    getBloquesHorarios()
                ]);
                setLaboratorios(labsData);
                setBloques(bloquesData);
            } catch (error) {
                console.error("Error cargando catálogos:", error);
            }
        };
        initData();
    }, []);

    // --- CARGA DE DISPONIBILIDAD ---
    useEffect(() => {
        setBloquesSeleccionados([]);
        setErrorMessage(null);

        if (fecha && labSeleccionado) {
            const fetchDisponibilidad = async () => {
                setIsLoading(true);
                try {
                    const data = await getDisponibilidad(labSeleccionado, fecha);
                    setDisponibilidad(data);
                } catch (error) {
                    console.error("Error:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDisponibilidad();
        }
    }, [fecha, labSeleccionado]);

    // --- LÓGICA DE CLICKS EN LA GRILLA (Máx 2 Continuos) ---
    const handleBloqueClick = (bloqueId: number) => {
        setErrorMessage(null);

        if (bloquesSeleccionados.includes(bloqueId)) {
            setBloquesSeleccionados(bloquesSeleccionados.filter(id => id !== bloqueId));
            return;
        }

        if (bloquesSeleccionados.length >= 2) {
            setErrorMessage("Regla de negocio: Solo está permitido reservar un máximo de 2 periodos continuos.");
            return;
        }

        if (bloquesSeleccionados.length === 1) {
            const primerId = bloquesSeleccionados[0];
            const idxPrimer = bloques.findIndex(b => b.id === primerId);
            const idxSegundo = bloques.findIndex(b => b.id === bloqueId);

            if (Math.abs(idxPrimer - idxSegundo) !== 1) {
                setErrorMessage("Regla de negocio: Los 2 periodos deben ser continuos.");
                return;
            }
        }

        setBloquesSeleccionados([...bloquesSeleccionados, bloqueId].sort((a, b) => a - b));
    };

    const getEstadoBloque = (bloqueId: number) => {
        if (bloquesSeleccionados.includes(bloqueId)) {
            return { clase: "bg-blue-600 text-white font-bold ring-2 ring-blue-600", texto: "Seleccionado", estado: "seleccionado" };
        }
        const registro = disponibilidad.find(d => d.bloque_horario_id === bloqueId);
        if (!registro) return { clase: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer", texto: "Libre", estado: "libre" };
        if (registro.estado === 'aprobada') return { clase: "bg-red-50 text-red-700 border-red-200 opacity-60 cursor-not-allowed", texto: "Reservado", estado: "ocupado" };
        if (registro.estado === 'pendiente') return { clase: "bg-yellow-50 text-yellow-700 border-yellow-200 opacity-60 cursor-not-allowed", texto: "Pendiente", estado: "pendiente" };
        return { clase: "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed", texto: "Mantenimiento", estado: "bloqueado" };
    };

    // --- ENVIAR SOLICITUD ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!fecha || !labSeleccionado || !materiaActividad || !periodoModulo || !periodoAnio) {
            setErrorMessage("Complete todos los campos del formulario.");
            return;
        }
        if (bloquesSeleccionados.length === 0) {
            setErrorMessage("Seleccione al menos 1 o 2 periodos en la grilla.");
            return;
        }

        setIsSubmitting(true);
        try {
            await crearSolicitudReserva({
                laboratorio_id: labSeleccionado,
                fecha,
                materia_actividad: materiaActividad,
                periodo_modulo: parseInt(periodoModulo),
                periodo_anio: parseInt(periodoAnio),
                bloques_ids: bloquesSeleccionados
            });

            // Éxito
            setBloquesSeleccionados([]);
            setMateriaActividad("");
            setShowSuccessPopup(true);

            // Refrescar grilla
            const data = await getDisponibilidad(labSeleccionado, fecha);
            setDisponibilidad(data);

        } catch (err: any) {
            setErrorMessage(err.message || "Error al procesar la reserva.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full relative">
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-start gap-3 shadow-xs">
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <p className="text-sm font-medium">{errorMessage}</p>
                </div>
            )}

            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Nueva Reserva</h2>
                <p className="text-sm md:text-base text-slate-500 mt-1">Seleccione la fecha y laboratorio para ver la disponibilidad.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

                {/* PANEL IZQUIERDO: Formulario */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 md:p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <BookOpen className="text-upds-primary" size={22} />
                        <h3 className="font-semibold text-slate-800 text-base md:text-lg">Detalles Requeridos</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Fecha y Laboratorio */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha Requerida *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-upds-primary/20 outline-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Laboratorio *</label>
                            <div className="relative">
                                <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select value={labSeleccionado} onChange={(e) => setLabSeleccionado(e.target.value)} required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-upds-primary/20 outline-none appearance-none">
                                    <option value="" disabled>Seleccione un laboratorio...</option>
                                    {laboratorios.map(lab => (
                                        <option key={lab.id} value={lab.id}>{lab.nombre} (Cap: {lab.capacidad})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Módulo y Año en 2 columnas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Módulo *</label>
                                <select value={periodoModulo} onChange={(e) => setPeriodoModulo(e.target.value)} required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                        <option key={num} value={num}>Módulo {num}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Año *</label>
                                <input type="number" value={periodoAnio} onChange={(e) => setPeriodoAnio(e.target.value)} required min="2024" max="2030"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                            </div>
                        </div>

                        {/* Materia / Actividad */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Materia o Actividad *</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Ej. Redes de Computadoras" value={materiaActividad} onChange={(e) => setMateriaActividad(e.target.value)} required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={isSubmitting}
                                className="w-full bg-upds-primary hover:bg-upds-primary/95 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-75">
                                <Send size={18} />
                                {isSubmitting ? "Enviando Solicitud..." : "Enviar Solicitud"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* PANEL DERECHO: La Grilla */}
                <div className="lg:col-span-2 flex flex-col gap-6 w-full min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-slate-600">Libre</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-xs text-slate-600">Seleccionado</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-slate-600">Ocupado</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs text-slate-600">Pendiente</span></div>
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">Matriz de Turnos</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 md:p-6 min-h-[350px] flex flex-col justify-center">
                        {!fecha || !labSeleccionado ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                                <Clock size={44} className="opacity-40" />
                                <p className="text-sm">Seleccione fecha y laboratorio para cargar la grilla.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-upds-primary"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                {bloques.map((bloque) => {
                                    const estadoInfo = getEstadoBloque(bloque.id);
                                    return (
                                        <button key={bloque.id} type="button"
                                            disabled={estadoInfo.estado !== 'libre' && estadoInfo.estado !== 'seleccionado'}
                                            onClick={() => handleBloqueClick(bloque.id)}
                                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${estadoInfo.clase}`}>
                                            <span className="text-xs font-bold opacity-75">{bloque.hora_inicio.slice(0, 5)} - {bloque.hora_fin.slice(0, 5)}</span>
                                            <span className="font-semibold text-sm">{estadoInfo.texto}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* POPUP DE ÉXITO */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 relative text-center flex flex-col items-center">
                        <button onClick={() => setShowSuccessPopup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={28} /></div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">¡Solicitud Enviada!</h4>
                        <p className="text-sm text-slate-500 mb-6">La reserva de laboratorio se registró con estado <span className="text-yellow-600 font-semibold">Pendiente</span> para evaluación.</p>
                        <button onClick={() => setShowSuccessPopup(false)} className="w-full bg-upds-primary hover:bg-upds-primary/95 text-white font-medium py-2.5 px-4 rounded-xl text-sm">Entendido</button>
                    </div>
                </div>
            )}
        </div>
    );
}