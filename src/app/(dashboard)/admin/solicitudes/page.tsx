"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSolicitudesPendientes,
    procesarTramiteAvanzado,
    SolicitudGrupo,
    TramiteProcesado
} from "@/lib/services/admin.service";
import { SolicitudListItem } from "@/components/solicitudes/SolicitudListItem";
import { SolicitudDetail } from "@/components/solicitudes/SolicitudDetail";
import { Loader2, ClipboardList, Inbox } from "lucide-react";

export default function GestionSolicitudesPage() {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 1. Fetching de datos (Trae el grupo consolidado)
    const { data: solicitudes, isLoading } = useQuery({
        queryKey: ['solicitudesPendientes'],
        queryFn: getSolicitudesPendientes
    });

    // 2. Encuentra el trámite seleccionado
    const selectedRequest = solicitudes?.find((r: SolicitudGrupo) => r.grupo_id === selectedGroupId);

    // 3. Mutación Maestra (Resuelve todo el paquete)
    const mutation = useMutation({
        mutationFn: (tramite: TramiteProcesado) => procesarTramiteAvanzado(tramite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitudesPendientes'] });
            setSelectedGroupId(null); // Resetea la UI devolviendo a la pantalla vacía
        }
    });

    const handleProcesarTramite = (tramiteFinal: TramiteProcesado) => {
        mutation.mutate(tramiteFinal);
    };

    return (
        <div className="flex w-full h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

            {/* PANEL IZQUIERDO: BANDEJA DE ENTRADA */}
            <aside className="w-[380px] bg-slate-50/30 flex flex-col border-r border-slate-200 shrink-0">
                <div className="p-5 border-b border-slate-200 bg-white shrink-0">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Inbox size={20} className="text-[#004B87]" /> Bandeja
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {solicitudes?.length || 0} trámites pendientes.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                            <Loader2 className="animate-spin text-[#004B87]" size={28} />
                            <span className="text-sm font-bold">Cargando...</span>
                        </div>
                    ) : solicitudes?.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm font-medium">
                            No hay nuevas solicitudes.
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

            {/* PANEL DERECHO: DETALLE */}
            <main className="flex-1 flex flex-col bg-slate-50 overflow-y-auto custom-scrollbar relative">
                {selectedRequest ? (
                    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
                        <SolicitudDetail
                            solicitud={selectedRequest}
                            onProcesarTramite={handleProcesarTramite}
                            isProcessing={mutation.isPending}
                        />
                    </div>
                ) : (
                    <div className="m-auto flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="w-20 h-20 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center">
                            <ClipboardList size={32} className="text-slate-300" />
                        </div>
                        <p className="font-black text-slate-500 text-lg">Selecciona un trámite</p>
                    </div>
                )}
            </main>
        </div>
    );
}