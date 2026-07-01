'use client';

import { useState, useEffect } from 'react';
import { TablaReporte } from '@/components/reportes/TablaReporte';
import { CustomModal } from '@/components/ui/CustomModal';
import { getHistorialReservas, getLaboratoriosParaFiltro, FiltrosAuditoria } from '@/lib/services/auditoria.service';
import dynamic from 'next/dynamic';
import { Filter, Calendar, FlaskConical, Search, Download, ClipboardList } from 'lucide-react';

const PDFExportButton = dynamic(
    () => import('@/components/reportes/PDFExportButton'),
    { ssr: false, loading: () => <span className="text-xs text-slate-400">Cargando...</span> }
);

const COLUMNAS = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'docente_nombre', label: 'Docente' },
    { key: 'laboratorio_nombre', label: 'Laboratorio' },
    { key: 'bloque_inicio', label: 'Inicio' },
    { key: 'bloque_fin', label: 'Fin' },
    { key: 'estado', label: 'Estado' },
    { key: 'motivo_rechazo', label: 'Motivo rechazo' },
    { key: 'motivo_cancelacion', label: 'Motivo cancelación' },
];

const ESTADOS = ['', 'pendiente', 'aprobada', 'rechazada', 'cancelada', 'pendiente_modificacion'];

export default function AuditoriaPage() {
    const [registros, setRegistros] = useState<any[]>([]);
    const [laboratorios, setLaboratorios] = useState<{ id: string; nombre: string }[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<FiltrosAuditoria>({});

    const cargarLaboratorios = async () => {
        try {
            setLaboratorios(await getLaboratoriosParaFiltro());
        } catch (err: any) {
            setError(err.message);
        }
    };

    const cargarHistorial = async (f: FiltrosAuditoria) => {
        setCargando(true);
        try {
            setRegistros(await getHistorialReservas(f));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLaboratorios();
        cargarHistorial({});
    }, []);

    const handleFiltro = (key: keyof FiltrosAuditoria, valor: string) => {
        const nuevos = { ...filtros, [key]: valor || undefined };
        setFiltros(nuevos);
        cargarHistorial(nuevos);
    };

    const limpiarFiltros = () => {
        setFiltros({});
        cargarHistorial({});
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Cabecera */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Auditoría</h1>
                    <p className="text-slate-500 font-medium mt-1">Historial centralizado de todas las reservas del sistema.</p>
                </div>
            </div>

            {/* Filtros de búsqueda (UI Mejorada) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-slate-800 font-black uppercase text-xs tracking-widest">
                    <Filter size={16} /> Panel de Filtrado
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase">Estado</label>
                        <select
                            value={filtros.estado ?? ''}
                            onChange={e => handleFiltro('estado', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004B87]/20"
                        >
                            {ESTADOS.map(e => (
                                <option key={e} value={e}>{e === '' ? 'Todos los estados' : e.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase">Laboratorio</label>
                        <select
                            value={filtros.laboratorio_id ?? ''}
                            onChange={e => handleFiltro('laboratorio_id', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004B87]/20"
                        >
                            <option value="">Todos los laboratorios</option>
                            {laboratorios.map(l => (
                                <option key={l.id} value={l.id}>{l.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase">Fecha Desde</label>
                        <input
                            type="date"
                            value={filtros.fecha_desde ?? ''}
                            onChange={e => handleFiltro('fecha_desde', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004B87]/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase">Fecha Hasta</label>
                        <input
                            type="date"
                            value={filtros.fecha_hasta ?? ''}
                            onChange={e => handleFiltro('fecha_hasta', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004B87]/20"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={limpiarFiltros}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm py-3 px-4 rounded-xl transition-all"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla Contenedora */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {registros.length > 0 && (
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-400 uppercase">{registros.length} registros encontrados</p>
                        <PDFExportButton
                            titulo="Auditoría — Historial de Reservas"
                            columnas={COLUMNAS}
                            filas={registros}
                            nombreArchivo={`auditoria-${new Date().toISOString().split('T')[0]}.pdf`}
                        />
                    </div>
                )}
                <TablaReporte columnas={COLUMNAS} filas={registros} cargando={cargando} />
            </div>

            {error && (
                <CustomModal isOpen={!!error} type="error" title="Error"
                    message={error} onClose={() => setError(null)} />
            )}
        </div>
    );
}