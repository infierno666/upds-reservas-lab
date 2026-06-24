"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSolicitudesPendientes, resolverSolicitud, Solicitud } from "@/lib/services/admin.service";
import { SolicitudListItem } from "@/components/solicitudes/SolicitudListItem";
import { SolicitudDetail } from "@/components/solicitudes/SolicitudDetail";
import { Loader2, ClipboardList, Search, Bell } from "lucide-react";

export default function GestionSolicitudesPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 1. Fetching de datos (Master)
    const { data: solicitudes, isLoading } = useQuery({
        queryKey: ['solicitudesPendientes'],
        queryFn: getSolicitudesPendientes
    });

    // 2. Encuentra el registro seleccionado (Detail)
    const selectedRequest = solicitudes?.find((r: Solicitud) => r.id === selectedId);

    // 3. Mutación para Aprobar/Rechazar
    const mutation = useMutation({
        mutationFn: ({ id, estado, motivo }: { id: string, estado: 'aprobada' | 'rechazada', motivo?: string }) =>
            resolverSolicitud(id, estado, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitudesPendientes'] });
            setSelectedId(null); // Limpiar la vista derecha tras procesar
        }
    });

    const handleAction = (estado: 'aprobada' | 'rechazada', motivo?: string) => {
        if (!selectedId) return;
        mutation.mutate({ id: selectedId, estado, motivo });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">

            {/* Header Superior (Tipo SaaS como en la imagen) */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
                <h1 className="text-xl font-bold text-slate-800">Gestión de Solicitudes</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar solicitudes..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                        />
                    </div>
                    <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            {/* Contenedor Principal (Master-Detail) */}
            <div className="flex flex-1 overflow-hidden">

                {/* PANEL IZQUIERDO: Bandeja de Entrada */}
                <aside className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-slate-800 text-lg">Bandeja de Entrada</h2>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                {solicitudes?.length || 0} Pendientes
                            </span>
                        </div>
                        {/* Filtros visuales como en la imagen */}
                        <div className="flex gap-2">
                            <button className="bg-slate-800 text-white text-xs font-medium px-4 py-1.5 rounded-full">Todas</button>
                            <button className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-4 py-1.5 rounded-full transition-colors">Pendientes</button>
                            <button className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-4 py-1.5 rounded-full transition-colors">Urgentes</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-sm">Cargando bandeja...</span>
                            </div>
                        ) : solicitudes?.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No hay solicitudes pendientes. ¡Todo al día!
                            </div>
                        ) : (
                            solicitudes?.map((item: Solicitud) => (
                                <SolicitudListItem
                                    key={item.id}
                                    data={item}
                                    isActive={selectedId === item.id}
                                    onClick={() => setSelectedId(item.id)}
                                />
                            ))
                        )}
                    </div>
                </aside>

                {/* PANEL DERECHO: Detalle */}
                <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50 relative">
                    {selectedRequest ? (
                        <div className="max-w-4xl mx-auto">
                            {/* Pasa la solicitud al componente hijo y los handlers */}
                            <SolicitudDetail
                                solicitud={selectedRequest}
                                onAction={handleAction}
                                isProcessing={mutation.isPending}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                <ClipboardList size={32} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-500">Seleccione una solicitud para revisar sus detalles</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}