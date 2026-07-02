'use client';

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/admin/StatsCards';
import { GraficoUsoSemanal } from '@/components/dashboard/admin/GraficoUsoSemanal';
import { GraficoDistribucionHorarios } from '@/components/dashboard/admin/GraficoDistribucionHorarios';
import { SolicitudesUrgentes } from '@/components/dashboard/admin/SolicitudesUrgentes';
import {
    getKPIsAdmin, getDatosGraficoSemanal, getDatosGraficoHorarios,
    KPIsAdmin, DatoGraficoSemanal, DatoGraficoHorarios
} from '@/lib/services/dashboard.admin.service';
import { getSolicitudesPendientes, SolicitudGrupo } from '@/lib/services/admin.service';
import { CustomModal } from '@/components/ui/CustomModal';

export default function AdminDashboard() {
    const [kpis, setKpis] = useState<KPIsAdmin | null>(null);
    const [graficoSemanal, setGraficoSemanal] = useState<DatoGraficoSemanal[]>([]);
    const [graficoHorarios, setGraficoHorarios] = useState<DatoGraficoHorarios[]>([]);
    const [solicitudes, setSolicitudes] = useState<SolicitudGrupo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargar = async () => {
            setCargando(true);
            try {
                // Carga todos los datos en paralelo para minimizar tiempo de espera
                const [k, gs, gh, sol] = await Promise.all([
                    getKPIsAdmin(),
                    getDatosGraficoSemanal(),
                    getDatosGraficoHorarios(),
                    getSolicitudesPendientes(),
                ]);
                setKpis(k);
                setGraficoSemanal(gs);
                setGraficoHorarios(gh);
                setSolicitudes(sol);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    if (cargando) return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-64 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            {/* Cabecera */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vista General</h1>
                <p className="text-slate-500 font-medium mt-1">Resumen del estado actual de los laboratorios.</p>
            </div>

            {/* KPIs */}
            {kpis && <StatsCards kpis={kpis} />}

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GraficoUsoSemanal datos={graficoSemanal} />
                </div>
                <GraficoDistribucionHorarios datos={graficoHorarios} />
            </div>

            {/* Solicitudes pendientes */}
            <SolicitudesUrgentes solicitudes={solicitudes} />

            {error && (
                <CustomModal isOpen={!!error} type="error" title="Error al cargar dashboard"
                    message={error} onClose={() => setError(null)} />
            )}
        </div>
    );
}