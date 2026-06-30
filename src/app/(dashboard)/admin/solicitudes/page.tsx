"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSolicitudesPendientes, resolverSolicitudesMasivas, SolicitudGrupo, resolucionParcial } from "@/lib/services/admin.service";
import { SolicitudListItem } from "@/components/solicitudes/SolicitudListItem";
import { SolicitudDetail } from "@/components/solicitudes/SolicitudDetail";
import { Loader2, ClipboardList, Search, Bell, Inbox } from "lucide-react";

export default function GestionSolicitudesPage() {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 1. Fetching de datos (Ahora trae SolicitudGrupo[])
    const { data: solicitudes, isLoading } = useQuery({
        queryKey: ['solicitudesPendientes'],
        queryFn: getSolicitudesPendientes
    });

    // 2. Encuentra el registro seleccionado
    const selectedRequest = solicitudes?.find((r: SolicitudGrupo) => r.grupo_id === selectedGroupId);

    // 3. NUEVO: Mutación para Aprobar/Rechazar MASIVAMENTE
    const mutation = useMutation({
        mutationFn: ({ ids, estado, motivo }: { ids: string[], estado: 'aprobada' | 'rechazada', motivo?: string }) =>
            resolverSolicitudesMasivas(ids, estado, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitudesPendientes'] });
            setSelectedGroupId(null); // Limpiar la vista derecha tras procesar
        }
    });

    const mutationParcial = useMutation({
        mutationFn: ({ aprobados, rechazados, motivo }: { aprobados: string[], rechazados: string[], motivo: string }) =>
            resolucionParcial(aprobados, rechazados, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitudesPendientes'] });
            setSelectedGroupId(null);
        }
    });

    const handleActionParcial = (aprobados: string[], rechazados: string[], motivo: string) => {
        mutationParcial.mutate({ aprobados, rechazados, motivo });
    };

    const handleAction = (estado: 'aprobada' | 'rechazada', motivo?: string) => {
        if (!selectedRequest) return;

        // MAGIA: Extraemos TODOS los IDs de las reservas dentro de este grupo
        const reservaIds = selectedRequest.reservas.map(r => r.id);
        mutation.mutate({ ids: reservaIds, estado, motivo });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
        
            <div className="flex flex-1 overflow-hidden">
                {/* PANEL IZQUIERDO: Bandeja Agrupada */}
                <aside className="w-[400px] bg-white border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <Inbox size={20} className="text-[#004B87]" /> Bandeja
                            </h2>
                            <span className="bg-[#004B87] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                {solicitudes?.length || 0} Trámites
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                                <Loader2 className="animate-spin text-[#004B87]" size={28} />
                                <span className="text-sm font-bold">Organizando expedientes...</span>
                            </div>
                        ) : solicitudes?.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm font-medium">
                                No hay trámites pendientes. ¡Estás al día!
                            </div>
                        ) : (
                            solicitudes?.map((item: SolicitudGrupo) => (
                                <SolicitudListItem
                                    key={item.grupo_id}
                                    data={item}
                                    isActive={selectedGroupId === item.grupo_id}
                                    onClick={() => setSelectedGroupId(item.grupo_id)}
                                />
                            ))
                        )}
                    </div>
                </aside>

                {/* PANEL DERECHO: Detalle (Lo refactorizaremos en Fase 3) */}
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 relative">
                    {selectedRequest ? (
                        <div className="max-w-4xl mx-auto">
                            {/* Le pasamos el objeto entero (Usamos 'any' por ahora para que no rompa TypeScript antes de la Fase 3) */}
                            <SolicitudDetail
                                solicitud={selectedRequest as any}
                                onAction={handleAction}
                                onActionParcial={handleActionParcial} // <-- NUEVA PROP
                                isProcessing={mutation.isPending || mutationParcial.isPending}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center">
                                <ClipboardList size={40} className="text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-500 text-lg">Seleccione un trámite de la bandeja</p>
                            <p className="text-sm font-medium opacity-80">Podrá revisar fechas, turnos y disponibilidad.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}