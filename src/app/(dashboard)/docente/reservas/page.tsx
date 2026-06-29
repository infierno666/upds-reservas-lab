"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMisReservas, cancelarReserva } from "@/lib/services/reservaService";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar } from "@/components/reservas/FilterBar";
import { CustomModal } from "@/components/ui/CustomModal";
import { FlaskConical, Loader2, Plus, Trash2, Edit2, Calendar } from "lucide-react";
import Link from "next/link";

export default function MisReservasPage() {
    const [filters, setFilters] = useState({});
    const queryClient = useQueryClient();

    const [modalAction, setModalAction] = useState<{
        isOpen: boolean;
        type: 'cancel';
        grupoId: string | null;
        reservaIds: string[];
        motivo?: string;
    }>({ isOpen: false, type: 'cancel', grupoId: null, reservaIds: [] });

    const { data, isLoading } = useQuery({
        queryKey: ['misReservas', filters],
        queryFn: () => getMisReservas(1, 50, filters),
    });

    // Lógica para agrupar reservas
    const reservasAgrupadas = useMemo(() => {
        if (!data?.data) return [];
        const grupos = data.data.reduce((acc: any, r: any) => {
            if (!acc[r.grupo_solicitud_id]) {
                acc[r.grupo_solicitud_id] = {
                    id: r.grupo_solicitud_id,
                    materia: r.materia_actividad,
                    laboratorio: r.laboratorios.nombre,
                    labId: r.laboratorio_id,
                    estado: r.estado,
                    reservas: []
                };
            }
            acc[r.grupo_solicitud_id].reservas.push(r);
            return acc;
        }, {});
        return Object.values(grupos);
    }, [data]);

    const handleConfirmCancel = async () => {
        if (!modalAction.motivo || modalAction.reservaIds.length === 0) return;
        try {
            // Cancelamos todas las reservas del grupo
            await Promise.all(modalAction.reservaIds.map(id => cancelarReserva(id, modalAction.motivo!)));
            queryClient.invalidateQueries({ queryKey: ['misReservas'] });
            setModalAction({ isOpen: false, type: 'cancel', grupoId: null, reservaIds: [] });
        } catch (error: any) {
            alert("Error al cancelar: " + error.message);
        }
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto space-y-6">
            <CustomModal
                isOpen={modalAction.isOpen}
                type="confirm"
                title="Cancelar Grupo de Reservas"
                message="Esta acción cancelará todas las fechas seleccionadas en este grupo. Por favor, indique el motivo:"
                onClose={() => setModalAction({ ...modalAction, isOpen: false })}
                onConfirm={handleConfirmCancel}
            >
                <textarea
                    className="w-full mt-2 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#001D4A]/20"
                    rows={3}
                    placeholder="Motivo de la cancelación masiva..."
                    value={modalAction.motivo || ''}
                    onChange={(e) => setModalAction({ ...modalAction, motivo: e.target.value })}
                />
            </CustomModal>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Reservas</h1>
                    <p className="text-slate-500">Gestión consolidada de solicitudes.</p>
                </div>
                <Link href="/docente/reserva/nueva" className="bg-[#001D4A] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#001D4A]/90 font-bold shadow-lg">
                    <Plus size={18} /> Nueva Reserva
                </Link>
            </div>

            <FilterBar onFilterChange={(newF: any) => setFilters({ ...filters, ...newF })} />

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#001D4A]" size={32} /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[11px]">Grupo ID</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[11px]">Laboratorio</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[11px]">Fechas Programadas</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[11px]">Materia</th>
                                <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase text-[11px]">Estado</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-[11px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reservasAgrupadas.map((grupo: any) => (
                                <tr key={grupo.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-700">GRP-{grupo.id.slice(0, 4)}</td>
                                    <td className="px-6 py-4 flex items-center gap-2"><FlaskConical size={16} className="text-slate-400" /> {grupo.laboratorio}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {grupo.reservas.map((r: any) => (
                                                <span key={r.id} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600 border border-slate-200">
                                                    {r.fecha}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{grupo.materia}</td>
                                    <td className="px-6 py-4 text-center"><StatusBadge estado={grupo.estado} /></td>
                                    <td className="px-6 py-4 text-right">
                                        {grupo.estado !== 'cancelada' && (
                                            <button
                                                onClick={() => setModalAction({
                                                    isOpen: true, type: 'cancel',
                                                    grupoId: grupo.id,
                                                    reservaIds: grupo.reservas.map((r: any) => r.id)
                                                })}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}