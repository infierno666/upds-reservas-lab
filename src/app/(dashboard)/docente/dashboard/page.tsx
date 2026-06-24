"use client";

import { useEffect, useState } from "react";
import { getLaboratorios, getBloquesHorarios, getDisponibilidad } from "@/lib/services/labService";

export default function DocenteDashboard() {
    const [laboratorios, setLaboratorios] = useState<any[]>([]);
    const [bloques, setBloques] = useState<any[]>([]);
    const [disponibilidad, setDisponibilidad] = useState<any[]>([]);
    const [selectedLab, setSelectedLab] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        // Carga inicial de catálogos
        getLaboratorios().then(setLaboratorios);
        getBloquesHorarios().then(setBloques);
    }, []);

    useEffect(() => {
        // Carga dinámica cuando cambia el laboratorio o la fecha
        if (selectedLab && selectedDate) {
            getDisponibilidad(selectedLab, selectedDate).then(setDisponibilidad);
        }
    }, [selectedLab, selectedDate]);

    // Función para determinar el estado de un bloque[cite: 3]
    const getBlockState = (bloqueId: number) => {
        const status = disponibilidad.find(d => d.bloque_horario_id === bloqueId);
        if (!status) return { label: "Libre", color: "bg-green-100 text-green-700 border-green-200" };
        if (status.estado === 'aprobada') return { label: "Ocupado", color: "bg-red-100 text-red-700 border-red-200" };
        if (status.estado === 'pendiente') return { label: "En Espera", color: "bg-amber-100 text-amber-700 border-amber-200" };
        return { label: "N/A", color: "bg-gray-100" };
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-upds-primary">Nueva Reserva de Laboratorio</h1>

            {/* Filtros */}
            <div className="flex gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <select
                    onChange={(e) => setSelectedLab(e.target.value)}
                    className="p-2 border rounded-lg w-full"
                >
                    <option value="">Selecciona un Laboratorio</option>
                    {laboratorios.map(lab => <option key={lab.id} value={lab.id}>{lab.nombre}</option>)}
                </select>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded-lg"
                />
            </div>

            {/* Grilla Horaria[cite: 3] */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bloques.map((bloque) => {
                    const state = getBlockState(bloque.id);
                    return (
                        <div key={bloque.id} className={`p-4 border rounded-xl flex justify-between items-center ${state.color}`}>
                            <div>
                                <p className="font-bold">{bloque.descripcion}</p>
                                <p className="text-sm">{bloque.hora_inicio.slice(0, 5)} - {bloque.hora_fin.slice(0, 5)}</p>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded">{state.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}