'use client';

import { useState, useEffect } from 'react';
import { CustomModal } from '@/components/ui/CustomModal';
import { getReservasAsistencia, RegistroAsistencia } from '@/lib/services/asistencia.service';
import dynamic from 'next/dynamic';
import {
    CheckCircle2, XCircle, Clock, AlertTriangle, FileText,
    Filter, Download, ChevronDown
} from 'lucide-react';

const PDFExportButton = dynamic(
    () => import('@/components/reportes/PDFExportButton'),
    { ssr: false, loading: () => <span className="text-xs text-slate-400">Preparando PDF...</span> }
);

type FiltroAsistencia = 'todos' | 'confirmada' | 'no_confirmada' | 'pendiente';

const COLUMNAS = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'docente_nombre', label: 'Docente' },
    { key: 'laboratorio_nombre', label: 'Laboratorio' },
    { key: 'bloque_inicio', label: 'Inicio' },
    { key: 'bloque_fin', label: 'Fin' },
    { key: 'estado_asistencia', label: 'Asistencia' },
];

function resolverEstado(reg: RegistroAsistencia): string {
    if (reg.asistencia_resuelta_por_timeout) return 'No confirmada (timeout)';
    if (reg.asistencia_confirmada === true) return 'Confirmada';
    if (reg.asistencia_confirmada === false) return 'No asistió';
    return 'Pendiente';
}

export default function AsistenciaPage() {
    const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<FiltroAsistencia>('todos');

    useEffect(() => {
        const cargar = async () => {
            setCargando(true);
            try {
                setRegistros(await getReservasAsistencia());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    const registrosFiltrados = registros.filter(r => {
        if (filtro === 'confirmada') return r.asistencia_confirmada === true;
        if (filtro === 'no_confirmada') return r.asistencia_confirmada === false || r.asistencia_resuelta_por_timeout;
        if (filtro === 'pendiente') return r.asistencia_confirmada === null && !r.asistencia_resuelta_por_timeout;
        return true;
    });

    const filas = registrosFiltrados.map(r => ({
        ...r,
        estado_asistencia: resolverEstado(r),
    }));

    const totalConfirmadas = registros.filter(r => r.asistencia_confirmada === true).length;
    const totalNoAsistio = registros.filter(r => r.asistencia_confirmada === false).length;
    const totalPendiente = registros.filter(r => r.asistencia_confirmada === null && !r.asistencia_resuelta_por_timeout).length;
    const totalTimeout = registros.filter(r => r.asistencia_resuelta_por_timeout).length;

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-[1800px] mx-auto">
            {/* Cabecera */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Asistencia</h1>
                <p className="text-slate-500 font-medium">Control de uso real y verificación de reservas aprobadas.</p>
            </div>

            {/* Indicadores de resumen */}
            {!cargando && registros.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: 'Confirmadas', value: totalConfirmadas, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                        { title: 'No asistió', value: totalNoAsistio, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
                        { title: 'Pendientes', value: totalPendiente, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                        { title: 'Timeout', value: totalTimeout, color: 'text-slate-500', bg: 'bg-slate-100', icon: AlertTriangle },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{stat.title}</p>
                                <p className={`text-3xl font-black ${stat.color} mt-1`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filtros y Tabla */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        {(['todos', 'confirmada', 'no_confirmada', 'pendiente'] as FiltroAsistencia[]).map(f => (
                            <button key={f} onClick={() => setFiltro(f)}
                                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${filtro === f
                                    ? 'bg-[#004B87] text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {f === 'todos' ? 'Todos' : f === 'confirmada' ? 'Confirmados' : f === 'no_confirmada' ? 'Ausencias' : 'Pendientes'}
                            </button>
                        ))}
                    </div>

                    {filas.length > 0 && (
                        <PDFExportButton
                            titulo="Reporte de Asistencia"
                            columnas={COLUMNAS}
                            filas={filas}
                            nombreArchivo={`asistencia-${new Date().toISOString().split('T')[0]}.pdf`}
                        />
                    )}
                </div>

                {cargando ? (
                    <div className="py-20 text-center text-slate-400 font-medium">Procesando registros...</div>
                ) : filas.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center text-slate-400">
                        <FileText size={40} className="mb-2 opacity-50" />
                        <p>No se encontraron registros de asistencia.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {COLUMNAS.map(col => (
                                        <th key={col.key} className="text-left p-4 font-black text-slate-500 uppercase text-[11px] tracking-wider">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filas.map((fila, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{fila.fecha}</td>
                                        <td className="p-4 text-slate-600 font-semibold">{fila.docente_nombre}</td>
                                        <td className="p-4 text-slate-600">{fila.laboratorio_nombre}</td>
                                        <td className="p-4 text-slate-500">{fila.bloque_inicio}</td>
                                        <td className="p-4 text-slate-500">{fila.bloque_fin}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${fila.estado_asistencia === 'Confirmada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    fila.estado_asistencia === 'No asistió' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        fila.estado_asistencia.includes('timeout') ? 'bg-slate-100 text-slate-600' :
                                                            'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                {fila.estado_asistencia}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {error && (
                <CustomModal isOpen={!!error} type="error" title="Error de Sistema"
                    message={error} onClose={() => setError(null)} />
            )}
        </div>
    );
}