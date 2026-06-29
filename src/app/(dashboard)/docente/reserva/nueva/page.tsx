"use client";

import { useState, useEffect } from "react";
import { Loader2, CalendarCheck } from "lucide-react";
import { 
    getLaboratorios, 
    getBloquesHorarios, 
    getDisponibilidadRango, 
    crearReservaMasiva, 
    actualizarReserva
} from "@/lib/services/reservaService";
import { calcularFechasVisibles, formatearFecha } from "@/lib/utils/dateUtils";
import { useSearchParams } from 'next/navigation'; // Importa esto
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
    const reservaId = searchParams.get('id');
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [bloques, setBloques] = useState<any[]>([]);

    const [vista, setVista] = useState<'semana' | 'mes'>('semana');
    const [fechaPivote, setFechaPivote] = useState(formatearFecha(new Date()));
    const [fechasVisibles, setFechasVisibles] = useState<Date[]>([]);

    const [disponibilidad, setDisponibilidad] = useState<any[]>([]);
    const [isLoadingGrid, setIsLoadingGrid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado del Modal
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'confirm';
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    const [labSeleccionado, setLabSeleccionado] = useState("");
    const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
    const [periodoModulo, setPeriodoModulo] = useState("1");
    const [periodoAnio, setPeriodoAnio] = useState(new Date().getFullYear().toString());
    const [seleccion, setSeleccion] = useState<CeldaSeleccionada[]>([]);

    // Efecto para precargar datos si es modo edición
    useEffect(() => {
        if (isEditMode) {
            setLabSeleccionado(searchParams.get('lab') || "");
            setMateriaSeleccionada(searchParams.get('materia') || "");
            setFechaPivote(searchParams.get('fecha') || formatearFecha(new Date()));
            // Aquí podrías marcar automáticamente el bloque en la grilla si quisieras
        }
    }, [isEditMode]);
    useEffect(() => {
        // Ya no traemos getMaterias, la base de datos espera texto libre
        Promise.all([getLaboratorios(), getBloquesHorarios()]).then(([labs, blqs]) => {
            setLaboratorios(labs);
            setBloques(blqs);
        });
    }, []);

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

    // Abre el modal de confirmación antes de enviar
    const solicitarConfirmacion = () => {
        if (seleccion.length === 0 || !materiaSeleccionada.trim()) {
            setModalConfig({
                isOpen: true, type: 'error', title: 'Datos Incompletos',
                message: 'Asegúrese de ingresar la Materia/Actividad y seleccionar al menos un bloque horario en la grilla.'
            });
            return;
        }

        setModalConfig({
            isOpen: true, type: 'confirm', title: 'Confirmar Reservas',
            message: `Va a registrar ${seleccion.length} bloques horarios para la actividad "${materiaSeleccionada}". Las solicitudes serán enviadas a administración para su evaluación.`,
            onConfirm: handleSubmitReal
        });
    };

    // Envío real a la Base de Datos
    const handleSubmitReal = async () => {
        setIsSubmitting(true);
        try {
            if (isEditMode && reservaId) {
                // MODO ACTUALIZACIÓN
                await actualizarReserva(reservaId, {
                    fecha: fechaPivote,
                    materia_actividad: materiaSeleccionada.trim(),
                    bloque_horario_id: seleccion[0]?.bloqueId // Asume edición de un solo bloque por ahora
                });

                setModalConfig({
                    isOpen: true, type: 'success', title: '¡Reserva Actualizada!',
                    message: 'La reserva ha sido modificada correctamente.'
                });
            } else {
                // MODO CREACIÓN MASIVA
                await crearReservaMasiva({
                    laboratorio_id: labSeleccionado,
                    materia_actividad: materiaSeleccionada.trim(),
                    periodo_modulo: parseInt(periodoModulo),
                    periodo_anio: parseInt(periodoAnio),
                    bloques_ids: [...new Set(seleccion.map(s => s.bloqueId))],
                    fechas: [...new Set(seleccion.map(s => s.fecha))]
                });

                setModalConfig({
                    isOpen: true, type: 'success', title: '¡Solicitud Exitosa!',
                    message: 'Sus reservas han sido procesadas correctamente.'
                });
            }

            // Flujo común tras éxito
            setSeleccion([]);
            const rango = calcularFechasVisibles(fechaPivote, vista);
            setDisponibilidad(await getDisponibilidadRango(labSeleccionado, rango.inicio, rango.fin));

        } catch (error: any) {
            setModalConfig({
                isOpen: true, type: 'error', title: 'Error en la operación',
                message: error.message || 'Ocurrió un problema al procesar la reserva.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full min-h-[calc(100vh-100px)] max-w-[1600px] mx-auto flex flex-col pb-6">

            <CustomModal
                isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message}
                onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
            />

            {/* Cabecera */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <CalendarCheck className="text-[#001D4A]" size={32} /> Nueva Reserva
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Busque disponibilidad real y asigne bloques masivos.</p>
                </div>

                <div className="flex bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/50 w-full sm:w-auto shadow-sm">
                    <button onClick={() => setVista('semana')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm rounded-lg font-bold transition-all ${vista === 'semana' ? 'bg-white shadow-sm text-[#001D4A]' : 'text-slate-500 hover:text-slate-700'}`}>Semana</button>
                    <button onClick={() => setVista('mes')} className={`flex-1 sm:flex-none px-6 py-2.5 text-sm rounded-lg font-bold transition-all ${vista === 'mes' ? 'bg-white shadow-sm text-[#001D4A]' : 'text-slate-500 hover:text-slate-700'}`}>Mes</button>
                </div>
            </div>

            {/* Layout Principal Flex */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">

                {/* Columna Izquierda: Configuración */}
                <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 flex flex-col gap-4 h-full">
                    <ReservaSidebarConfig
                        laboratorios={laboratorios}
                        labSeleccionado={labSeleccionado} setLabSeleccionado={setLabSeleccionado}
                        materiaSeleccionada={materiaSeleccionada} setMateriaSeleccionada={setMateriaSeleccionada}
                        periodoModulo={periodoModulo} setPeriodoModulo={setPeriodoModulo}
                        periodoAnio={periodoAnio} setPeriodoAnio={setPeriodoAnio}
                        fechaPivote={fechaPivote} setFechaPivote={setFechaPivote}
                        cantidadSeleccionada={seleccion.length}
                    />

                    <button
                        onClick={solicitarConfirmacion}
                        disabled={seleccion.length === 0 || !materiaSeleccionada.trim() || isSubmitting}
                        className="w-full bg-[#001D4A] hover:bg-[#001D4A]/90 text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-3"
                    >
                        {isSubmitting ? <Loader2 size={22} className="animate-spin" /> : <CalendarCheck size={22} />}
                        {isSubmitting ? "Procesando Sistema..." : `Procesar Solicitud`}
                    </button>
                </div>

                {/* Columna Derecha: Grilla interactiva */}
                <div className="flex-1 min-w-0 bg-white rounded-3xl flex flex-col h-full shadow-sm border border-slate-200 overflow-hidden">
                    {!labSeleccionado ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-5 p-8 bg-slate-50/50">
                            <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center border border-slate-100">
                                <CalendarCheck size={40} className="text-slate-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-700 mb-1">Sin espacio seleccionado</h3>
                                <p className="font-medium text-slate-500 max-w-sm">Por favor, seleccione un laboratorio en el panel izquierdo para cargar su disponibilidad.</p>
                            </div>
                        </div>
                    ) : isLoadingGrid ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                            <Loader2 size={48} className="animate-spin text-[#001D4A]" />
                            <p className="text-slate-500 font-medium animate-pulse">Sincronizando horarios...</p>
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