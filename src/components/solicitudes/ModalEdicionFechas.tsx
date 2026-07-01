"use client";

import { useState, useMemo } from "react";
import { ReservaIndividual } from "@/lib/services/admin.service";
import { ShiftGridSelector } from "@/components/reservas/ShiftGridSelector";
import { X, Save, CalendarDays } from "lucide-react";

interface Props {
    reservasOriginales: ReservaIndividual[];
    reservasActivas: ReservaIndividual[];
    onSave: (nuevasReservasActivas: ReservaIndividual[]) => void;
    onCancel: () => void;
}

export function ModalEdicionFechas({ reservasOriginales, reservasActivas, onSave, onCancel }: Props) {
    // 1. ESTADO DE SELECCIÓN (Inicia con las que están actualmente activas en el borrador)
    const [seleccion, setSeleccion] = useState(
        reservasActivas.map(r => ({ fecha: r.fecha, bloqueId: r.bloque_horario_id }))
    );

    // 2. Extraer fechas únicas de la solicitud original para armar las columnas del Grid
    const fechasVisibles = useMemo(() => {
        const fechasSet = new Set(reservasOriginales.map(r => r.fecha));
        return Array.from(fechasSet).map(f => new Date(`${f}T12:00:00`)).sort((a, b) => a.getTime() - b.getTime());
    }, [reservasOriginales]);

    // 3. Extraer bloques únicos de la solicitud original para armar las filas del Grid
    const bloques = useMemo(() => {
        const map = new Map();
        reservasOriginales.forEach(r => {
            if (r.bloques_horarios && !map.has(r.bloque_horario_id)) {
                map.set(r.bloque_horario_id, {
                    id: r.bloques_horarios.id,
                    turno: r.bloques_horarios.turno,
                    hora_inicio: r.bloques_horarios.hora_inicio,
                    hora_fin: r.bloques_horarios.hora_fin
                });
            }
        });
        return Array.from(map.values());
    }, [reservasOriginales]);

    const turnoInicial = bloques.length > 0 ? bloques[0].turno : 'mañana';

    // 4. Handlers para atrapar los clics en la grilla y actualizar la selección
    const handleToggleCelda = (fechaStr: string, bloqueId: number) => {
        setSeleccion(prev => {
            const existe = prev.some(s => s.fecha === fechaStr && s.bloqueId === bloqueId);
            if (existe) {
                // Si estaba seleccionada, la quitamos (el Admin la está rechazando)
                return prev.filter(s => !(s.fecha === fechaStr && s.bloqueId === bloqueId));
            } else {
                // Validar que solo pueda marcar bloques que existan en la solicitud original
                const esParteOriginal = reservasOriginales.some(r => r.fecha === fechaStr && r.bloque_horario_id === bloqueId);
                if (esParteOriginal) {
                    return [...prev, { fecha: fechaStr, bloqueId }];
                }
                return prev;
            }
        });
    };

    const handleToggleMulti = (celdas: any[], action: 'add' | 'remove') => {
        if (action === 'remove') {
            const celdasSet = new Set(celdas.map(c => `${c.fecha}-${c.bloqueId}`));
            setSeleccion(prev => prev.filter(s => !celdasSet.has(`${s.fecha}-${s.bloqueId}`)));
        } else {
            const validCeldas = celdas.filter(c => reservasOriginales.some(r => r.fecha === c.fecha && r.bloque_horario_id === c.bloqueId));
            const nuevas = [...seleccion];
            validCeldas.forEach(c => {
                if (!nuevas.some(s => s.fecha === c.fecha && s.bloqueId === c.bloqueId)) {
                    nuevas.push(c);
                }
            });
            setSeleccion(nuevas);
        }
    };

    const handleGuardar = () => {
        // Reconstruimos los objetos completos basados en lo que quedó seleccionado
        const nuevasReservas = reservasOriginales.filter(r =>
            seleccion.some(s => s.fecha === r.fecha && s.bloqueId === r.bloque_horario_id)
        );
        onSave(nuevasReservas);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">

                {/* CABECERA DEL MODAL */}
                <div className="bg-white p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#004B87]/10 text-[#004B87] rounded-xl flex items-center justify-center">
                            <CalendarDays size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Editor de Fechas de la Solicitud</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                Desmarca en la cuadrícula los bloques que deseas rechazar. Solo se aprobarán los bloques azules.
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* CUERPO - LA GRILLA REUTILIZADA */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <ShiftGridSelector
                        bloques={bloques}
                        fechasVisibles={fechasVisibles}
                        disponibilidad={[]}
                        misReservas={[]}
                        seleccion={seleccion} // Se pintan azules las seleccionadas
                        turnoInicial={turnoInicial}
                        onToggleCelda={handleToggleCelda}
                        onToggleMulti={handleToggleMulti}
                    />
                </div>

                {/* PIE DEL MODAL */}
                <div className="bg-white p-5 border-t border-slate-200 flex justify-between items-center shrink-0">
                    <div className="text-sm font-bold text-slate-600">
                        Bloques que se aprobarán: <span className="text-[#004B87] text-xl font-black mx-1">{seleccion.length}</span> de {reservasOriginales.length}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={seleccion.length === 0}
                            className="px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white bg-[#004B87] hover:bg-[#003865] rounded-xl transition-all shadow-md shadow-[#004B87]/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> Terminar Edición
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}