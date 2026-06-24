"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMisReservas } from "@/lib/services/reservaService";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar } from "@/components/reservas/FilterBar";
import { FlaskConical, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function MisReservasPage() {
    const [filters, setFilters] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: ['misReservas', filters],
        queryFn: () => getMisReservas(1, 10, filters),
    });

    return (
        <div className="p-8 w-full max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Reservas</h1>
                    <p className="text-slate-500">Gestiona tus solicitudes de espacio en laboratorios.</p>
                </div>
                <Link href="/docente/reserva/nueva" className="bg-upds-primary text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-upds-primary/90 transition-all font-medium">
                    <Plus size={18} /> Nueva Reserva
                </Link>
            </div>

            <FilterBar onFilterChange={(newF) => setFilters({ ...filters, ...newF })} />

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-upds-primary" size={32} /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-slate-600">CÓDIGO</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-600">LABORATORIO</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-600">FECHA / HORARIO</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-600">MATERIA</th>
                                <th className="px-6 py-4 text-left font-semibold text-slate-600">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data?.data.map((res: any) => (
                                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-700">RES-{res.id.slice(0, 4)}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="p-2 bg-slate-100 rounded-lg"><FlaskConical size={16} /></div>
                                        {res.laboratorios.nombre}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold">{res.fecha}</div>
                                        <div className="text-xs text-slate-500">{res.bloques_horarios.hora_inicio.slice(0, 5)} - {res.bloques_horarios.hora_fin.slice(0, 5)}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{res.materia_actividad}</td>
                                    <td className="px-6 py-4"><StatusBadge estado={res.estado} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}