'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TablaReporte } from '@/components/reportes/TablaReporte';
import { CustomModal } from '@/components/ui/CustomModal';
import {
    getReporteLaboratorio, getReporteDocente, getReporteMateria,
    getReporteAusentismo, getReporteSolicitudesGlobales, getReporteDiasDemanda,
} from '@/lib/services/reporte.service';
import { BarChart3, Users, BookOpen, UserX, Inbox, CalendarDays, FileText } from 'lucide-react';

// Carga dinámica requerida
const PDFExportButton = dynamic(
    () => import('@/components/reportes/PDFExportButton'),
    { ssr: false, loading: () => <span className="text-xs text-slate-400">Preparando PDF...</span> }
);

type TabActiva = 'laboratorio' | 'docente' | 'materia' | 'ausentismo' | 'solicitudes' | 'demanda';

const TABS: { key: TabActiva; label: string; icon: any }[] = [
    { key: 'laboratorio', label: 'Uso por Lab', icon: FlaskConicalIcon },
    { key: 'docente', label: 'Uso Docente', icon: Users },
    { key: 'materia', label: 'Uso Materia', icon: BookOpen },
    { key: 'ausentismo', label: 'Ausentismo', icon: UserX },
    { key: 'solicitudes', label: 'Solicitudes', icon: Inbox },
    { key: 'demanda', label: 'Demanda', icon: CalendarDays },
];

function FlaskConicalIcon({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18.001 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" /><path d="M6.45 6h11.1" /></svg>;
}

const COLUMNAS: Record<TabActiva, { key: string; label: string }[]> = {
    laboratorio: [{ key: 'nombre', label: 'Laboratorio' }, { key: 'semestre', label: 'Semestre' }, { key: 'periodo_anio', label: 'Año' }, { key: 'total_aprobadas', label: 'Aprobadas' }, { key: 'total_rechazadas', label: 'Rechazadas' }, { key: 'total_canceladas', label: 'Canceladas' }, { key: 'total_no_usadas', label: 'No usadas' }],
    docente: [{ key: 'nombre_completo', label: 'Docente' }, { key: 'semestre', label: 'Semestre' }, { key: 'periodo_anio', label: 'Año' }, { key: 'total_aprobadas', label: 'Aprobadas' }, { key: 'total_ausencias', label: 'Ausencias' }],
    materia: [{ key: 'materia_actividad', label: 'Materia' }, { key: 'semestre', label: 'Semestre' }, { key: 'periodo_anio', label: 'Año' }, { key: 'total_reservas', label: 'Total reservas' }],
    ausentismo: [{ key: 'nombre_completo', label: 'Docente' }, { key: 'total_reservas_aprobadas', label: 'Aprobadas' }, { key: 'total_no_usadas', label: 'No utilizadas' }, { key: 'porcentaje_ausentismo', label: '% Ausentismo' }],
    solicitudes: [{ key: 'estado', label: 'Estado' }, { key: 'total', label: 'Total' }, { key: 'porcentaje', label: '% del total' }],
    demanda: [{ key: 'dia_nombre', label: 'Día' }, { key: 'total_reservas', label: 'Reservas aprobadas' }],
};

function calcularIndicadores(tab: TabActiva, filas: any[]) {
    // ... (Tu lógica de cálculo se mantiene igual) ...
    if (filas.length === 0) return [];
    if (tab === 'laboratorio') {
        const masUsado = filas.reduce((a, b) => a.total_aprobadas > b.total_aprobadas ? a : b);
        const masCancelado = filas.reduce((a, b) => a.total_canceladas > b.total_canceladas ? a : b);
        const total = filas.reduce((s, f) => s + Number(f.total_aprobadas), 0);
        return [
            { label: 'Lab más utilizado', valor: masUsado.nombre, nota: `${masUsado.total_aprobadas} reservas aprobadas` },
            { label: 'Lab con más cancelaciones', valor: masCancelado.nombre, nota: `${masCancelado.total_canceladas} cancelaciones` },
            { label: 'Total aprobadas', valor: String(total), nota: 'Suma de todos los laboratorios' },
        ];
    }
    if (tab === 'docente') {
        const masActivo = filas.reduce((a, b) => a.total_aprobadas > b.total_aprobadas ? a : b);
        const masAusente = filas.reduce((a, b) => a.total_ausencias > b.total_ausencias ? a : b);
        return [
            { label: 'Docente más activo', valor: masActivo.nombre_completo, nota: `${masActivo.total_aprobadas} aprobadas` },
            { label: 'Mayor ausentismo', valor: masAusente.nombre_completo, nota: `${masAusente.total_ausencias} ausencias` },
        ];
    }
    if (tab === 'materia') {
        const masReservada = filas.reduce((a, b) => a.total_reservas > b.total_reservas ? a : b);
        return [{ label: 'Materia con más demanda', valor: masReservada.materia_actividad, nota: `${masReservada.total_reservas} reservas` }];
    }
    if (tab === 'ausentismo') {
        const critico = filas.reduce((a, b) => a.porcentaje_ausentismo > b.porcentaje_ausentismo ? a : b);
        const promedio = (filas.reduce((s, f) => s + Number(f.porcentaje_ausentismo), 0) / filas.length).toFixed(2);
        return [
            { label: 'Caso más crítico', valor: critico.nombre_completo, nota: `${critico.porcentaje_ausentismo}% ausentismo` },
            { label: 'Promedio institucional', valor: `${promedio}%`, nota: Number(promedio) > 20 ? 'Por encima del umbral' : 'Dentro del rango aceptable' },
        ];
    }
    if (tab === 'solicitudes') {
        const total = filas.reduce((s, f) => s + Number(f.total), 0);
        const aprobadas = filas.find(f => f.estado === 'aprobada');
        return [
            { label: 'Total solicitudes', valor: String(total), nota: 'Todos los estados' },
            { label: 'Tasa de aprobación', valor: aprobadas ? `${aprobadas.porcentaje}%` : '0%', nota: 'Del total de solicitudes' },
        ];
    }
    if (tab === 'demanda') {
        const diaPico = filas[0];
        return [{ label: 'Día de mayor demanda', valor: diaPico.dia_nombre, nota: `${diaPico.total_reservas} reservas aprobadas` }];
    }
    return [];
}

export default function ReportesPage() {
    const [tab, setTab] = useState<TabActiva>('laboratorio');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [datos, setDatos] = useState<Record<TabActiva, any[]>>({
        laboratorio: [], docente: [], materia: [], ausentismo: [], solicitudes: [], demanda: []
    });

    const cargarTab = async (tabKey: TabActiva) => {
        if (datos[tabKey].length > 0) return;
        setCargando(true);
        try {
            let resultado: any[] = [];
            if (tabKey === 'laboratorio') resultado = await getReporteLaboratorio();
            if (tabKey === 'docente') resultado = await getReporteDocente();
            if (tabKey === 'materia') resultado = await getReporteMateria();
            if (tabKey === 'ausentismo') resultado = await getReporteAusentismo();
            if (tabKey === 'solicitudes') resultado = await getReporteSolicitudesGlobales();
            if (tabKey === 'demanda') resultado = await getReporteDiasDemanda();
            setDatos(prev => ({ ...prev, [tabKey]: resultado }));
        } catch (err: any) { setError(err.message); } finally { setCargando(false); }
    };

    useEffect(() => { cargarTab('laboratorio'); }, []);

    const handleTab = (tabKey: TabActiva) => { setTab(tabKey); cargarTab(tabKey); };
    const indicadores = calcularIndicadores(tab, datos[tab]);
    const tabActual = TABS.find(t => t.key === tab)!;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Cabecera */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportes</h1>
                <p className="text-slate-500 font-medium mt-1">Estadísticas y analítica de uso del sistema.</p>
            </div>

            {/* Tabs Modernos */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto shadow-inner">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => handleTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${tab === t.key ? 'bg-white text-[#004B87] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}>
                        <t.icon size={16} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Indicadores */}
            {indicadores.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {indicadores.map((ind, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">{ind.label}</p>
                            <p className="text-xl font-black text-slate-800 truncate">{ind.valor}</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-1">{ind.nota}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabla */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {datos[tab].length > 0 && (
                    <div className="p-6 border-b border-slate-100 flex justify-end">
                        <PDFExportButton
                            titulo={tabActual.label}
                            columnas={COLUMNAS[tab]}
                            filas={datos[tab]}
                            nombreArchivo={`reporte-${tab}-${new Date().toISOString().split('T')[0]}.pdf`}
                        />
                    </div>
                )}
                <TablaReporte columnas={COLUMNAS[tab]} filas={datos[tab]} cargando={cargando} />
            </div>

            {error && (
                <CustomModal isOpen={!!error} type="error" title="Error"
                    message={error} onClose={() => setError(null)} />
            )}
        </div>
    );
}