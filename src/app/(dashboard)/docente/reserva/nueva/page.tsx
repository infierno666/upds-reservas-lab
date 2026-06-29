"use client";

import React, { useState, useEffect } from "react";
// SOLUCIÓN: Agregamos las importaciones de los íconos faltantes que TypeScript reclama
import { Loader2, CalendarCheck, CalendarDays, CalendarRange, MapPin } from "lucide-react";
import {
    getLaboratorios,
    getBloquesHorarios,
    getMaterias,
    getDisponibilidadRango,
    crearReservaMasiva
} from "@/lib/services/reservaService";
import { calcularFechasVisibles, formatearFecha } from "@/lib/utils/dateUtils";
import { useSearchParams } from 'next/navigation';
import { ReservaSidebarConfig } from "@/components/reservas/ReservaSidebarConfig";
import { ShiftGridSelector } from "@/components/reservas/ShiftGridSelector";
import { CustomModal } from "@/components/ui/CustomModal";

interface CeldaSeleccionada {
    fecha: string;
    bloqueId: number;
}

export default function NuevaReservaPage() {
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    
    // Catálogos e Infraestructura
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [bloques, setBloques] = useState<any[]>([]);
    const [materias, setMaterias] = useState<any[]>([]);

    // Estados de Control de la Grilla de Tiempo
    const [vista, setVista] = useState<'semana' | 'mes'>('semana');
    const [fechaPivote, setFechaPivote] = useState(formatearFecha(new Date()));
    const [fechasVisibles, setFechasVisibles] = useState<Date[]>([]);
    const [disponibilidad, setDisponibilidad] = useState<any[]>([]);
    
    // Estados de Carga y Sincronización
    const [isLoadingGrid, setIsLoadingGrid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

    // Configuración del Feedback Operativo (Modal)
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean; 
        type: 'success' | 'error' | 'confirm'; 
        title: string; 
        message: string; 
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // Estado de selección del Formulario Relacional
    const [labSeleccionado, setLabSeleccionado] = useState("");
    const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState("");
    const [periodoModulo, setPeriodoModulo] = useState("1");
    const [periodoAnio, setPeriodoAnio] = useState(new Date().getFullYear().toString());
    const [seleccion, setSeleccion] = useState<CeldaSeleccionada[]>([]);

    // Carga de datos de edición (Query Parameters)
    useEffect(() => {
        if (isEditMode) {
            setLabSeleccionado(searchParams.get('lab') || "");
            setMateriaIdSeleccionada(searchParams.get('materiaId') || "");
            setFechaPivote(searchParams.get('fecha') || formatearFecha(new Date()));
        }
    }, [isEditMode, searchParams]);

    // Consumo paralelo de catálogos relacionales del sistema
    useEffect(() => {
        setIsLoadingCatalogs(true);
        Promise.all([getLaboratorios(), getBloquesHorarios(), getMaterias()])
            .then(([labs, blqs, mats]) => {
                setLaboratorios(labs);
                setBloques(blqs);
                setMaterias(mats);
            })
            .catch(console.error)
            .finally(() => setIsLoadingCatalogs(false));
    }, []);

    // Sincronización de la grilla horaria interactiva
    useEffect(() => {
        if (!labSeleccionado || !fechaPivote) return;
        const cargarGrilla = async () => {
            setIsLoadingGrid(true);
            try {
                const rango = calcularFechasVisibles(fechaPivote, vista);
                setFechasVisibles(rango.fechas);
                const dispo = await getDisponibilidadRango(labSeleccionado, rango.inicio, rango.fin);
                setDisponibilidad(dispo);
                setSeleccion([]); 
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingGrid(false);
            }
        };
        cargarGrilla();
    }, [labSeleccionado, fechaPivote, vista]);

    const handleToggleCelda = (fecha: string, bloqueId: number) => {
        setSeleccion(prev => {
            const existe = prev.some(s => s.fecha === fecha && s.bloqueId === bloqueId);
            if (existe) return prev.filter(s => !(s.fecha === fecha && s.bloqueId === bloqueId));
            return [...prev, { fecha, bloqueId }];
        });
    };

    const handleToggleMulti = (celdas: CeldaSeleccionada[], action: 'add' | 'remove') => {
        setSeleccion(prev => {
            if (action === 'remove') {
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
            isOpen: true, type: 'confirm', title: 'Confirmar Reservas Masivas',
            message: `Va a registrar un lote de ${seleccion.length} bloques para la asignatura "${mat?.nombre}". Todas se consolidarán bajo un único número de trámite agrupado.`,
            onConfirm: handleSubmitReal
        });
    };

    const handleSubmitReal = async () => {
        setIsSubmitting(true);
        try {
            await crearReservaMasiva({
                laboratorio_id: labSeleccionado,
                materia_id: materiaIdSeleccionada,
                periodo_modulo: parseInt(periodoModulo),
                periodo_anio: parseInt(periodoAnio),
                selecciones: seleccion 
            });

            setModalConfig({
                isOpen: true, type: 'success', title: '¡Operación Exitosa!',
                message: 'Las solicitudes de espacio han sido consolidadas y enviadas a administración de manera correcta.'
            });

            setSeleccion([]);
            const rango = calcularFechasVisibles(fechaPivote, vista);
            setDisponibilidad(await getDisponibilidadRango(labSeleccionado, rango.inicio, rango.fin));
        } catch (error: any) {
            setModalConfig({
                isOpen: true, type: 'error', title: 'Error de Asignación',
                message: error.message || 'Ocurrió un problema inesperado al registrar el lote en el servidor.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingCatalogs) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
                <Loader2 size={48} className="animate-spin text-[#001D4A]" />
                <p className="text-slate-500 font-bold tracking-tight animate-pulse">Sincronizando catálogos de infraestructura...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[calc(100vh-100px)] max-w-[95%] xl:max-w-[1800px] mx-auto flex flex-col pb-6 animate-in fade-in duration-500">

            <CustomModal
                isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message}
                onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
            />

            {/* Cabecera Dinámica */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <CalendarCheck className="text-[#001D4A]" size={36} /> Planificador de Espacios
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Gestione la ocupación y asigne bloques masivos por rangos de tiempo.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => setVista('semana')} className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-2.5 text-sm rounded-lg font-bold transition-all ${vista === 'semana' ? 'bg-white shadow-sm text-[#001D4A]' : 'text-slate-500 hover:text-slate-700'}`}>
                        <CalendarDays size={16}/> Semana
                    </button>
                    <button onClick={() => setVista('mes')} className={`flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-2.5 text-sm rounded-lg font-bold transition-all ${vista === 'mes' ? 'bg-white shadow-sm text-[#001D4A]' : 'text-slate-500 hover:text-slate-700'}`}>
                        <CalendarRange size={16}/> Mes
                    </button>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-[600px]">
                
                {/* Panel de Parámetros Lateral */}
                <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-5 h-full">
                    <ReservaSidebarConfig
                        laboratorios={laboratorios}
                        materias={materias}
                        labSeleccionado={labSeleccionado} setLabSeleccionado={setLabSeleccionado}
                        materiaIdSeleccionada={materiaIdSeleccionada} setMateriaIdSeleccionada={setMateriaIdSeleccionada}
                        periodoModulo={periodoModulo} setPeriodoModulo={setPeriodoModulo}
                        periodoAnio={periodoAnio} setPeriodoAnio={setPeriodoAnio}
                        fechaPivote={fechaPivote} setFechaPivote={setFechaPivote}
                        cantidadSeleccionada={seleccion.length}
                        onLimpiarSeleccion={() => setSeleccion([])}
                    />

                    <button
                        onClick={solicitarConfirmacion}
                        disabled={seleccion.length === 0 || !materiaIdSeleccionada || isSubmitting}
                        className="w-full bg-[#001D4A] hover:bg-[#001D4A]/90 text-white font-black py-4.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#001D4A]/20 hover:shadow-2xl hover:-translate-y-0.5 flex justify-center items-center gap-3 text-lg"
                    >
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <CalendarCheck size={24} />}
                        {isSubmitting ? "Procesando Solicitud..." : `Procesar Reservas`}
                    </button>
                </div>

                {/* Grilla Interactiva */}
                <div className="flex-1 min-w-0 bg-white rounded-3xl flex flex-col h-full shadow-sm border border-slate-200 overflow-hidden">
                    {!labSeleccionado ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-5 p-8 bg-slate-50/50">
                            <div className="w-24 h-24 bg-white shadow-md rounded-full flex items-center justify-center border border-slate-100">
                                <MapPin size={40} className="text-slate-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-slate-700 mb-2">Sin espacio seleccionado</h3>
                                <p className="font-medium text-slate-500 max-w-sm">Por favor, seleccione un laboratorio en el panel izquierdo para cargar la matriz de disponibilidad en tiempo real.</p>
                            </div>
                        </div>
                    ) : isLoadingGrid ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                            <Loader2 size={48} className="animate-spin text-[#001D4A]" />
                            <p className="text-slate-500 font-bold animate-pulse">Sincronizando matriz de horarios compartidos...</p>
                        </div>
                    ) : (
                        <ShiftGridSelector
                            bloques={bloques}
                            fechasVisibles={fechasVisibles}
                            disponibilidad={disponibilidad}
                            seleccion={seleccion}
                            onToggleCelda={handleToggleCelda}
                            onToggleMulti={handleToggleMulti}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}