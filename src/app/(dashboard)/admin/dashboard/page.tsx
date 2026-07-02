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

    // =========================================================================
    // SKELETON DE CARGA (Pixel-perfect respecto al diseño final responsivo)
    // =========================================================================
    if (cargando) return (
        <div className="w-full p-4 sm:p-6 xl:p-8 max-w-[1600px] mx-auto flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-500">
            {/* Cabecera Skeleton */}
            <div className="space-y-2 mb-2">
                <div className="h-8 sm:h-10 w-48 sm:w-64 bg-slate-200/70 rounded-xl animate-pulse" />
                <div className="h-4 w-64 sm:w-96 bg-slate-100 rounded-lg animate-pulse" />
            </div>

            {/* KPIs Skeleton (1 col móvil, 2 cols tablet, 4 cols desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/50" />
                ))}
            </div>

            {/* Gráficos Skeleton (1 col hasta laptop, 3 cols en monitor grande) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="xl:col-span-2 h-[350px] sm:h-[400px] bg-slate-100 rounded-2xl animate-pulse border border-slate-200/50" />
                <div className="xl:col-span-1 h-[350px] sm:h-[400px] bg-slate-100 rounded-2xl animate-pulse border border-slate-200/50" />
            </div>

            {/* Tabla Skeleton */}
            <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse border border-slate-200/50" />
        </div>
    );

    // =========================================================================
    // RENDER PRINCIPAL (Responsivo y fluido)
    // =========================================================================
    return (
        <div className="w-full min-h-0 relative p-4 sm:p-6 xl:p-8 max-w-[1600px] mx-auto flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-500">

            {/* Cabecera Responsiva */}
            <div className="shrink-0">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Vista General
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    Resumen en tiempo real del estado de los laboratorios.
                </p>
            </div>

            {/* KPIs - Se delega la responsabilidad del grid a StatsCards o al padre si es necesario */}
            {/* Nota: Asegúrate de que StatsCards internamente tenga clases como: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 */}
            <div className="w-full shrink-0">
                {kpis && <StatsCards kpis={kpis} />}
            </div>

            {/* Contenedor de Gráficos (min-w-0 evita que Recharts o Chart.js rompan el flexbox en móviles) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 shrink-0">
                <div className="xl:col-span-2 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <GraficoUsoSemanal datos={graficoSemanal} />
                </div>

                <div className="xl:col-span-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <GraficoDistribucionHorarios datos={graficoHorarios} />
                </div>
            </div>

            {/* Tabla de Solicitudes (Aseguramos scroll horizontal si la tabla es muy ancha en móviles) */}
            <div className="w-full min-w-0 overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200/60">
                <SolicitudesUrgentes solicitudes={solicitudes} />
            </div>

            {/* Manejo de Errores */}
            {error && (
                <CustomModal
                    isOpen={!!error}
                    type="error"
                    title="Error de Sincronización"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
}