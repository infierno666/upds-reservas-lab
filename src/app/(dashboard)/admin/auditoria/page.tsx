'use client';

import { useState, useEffect } from 'react';
import { TablaReporte } from '@/components/reportes/TablaReporte';
import { CustomModal } from '@/components/ui/CustomModal';
import { getHistorialReservas, getLaboratoriosParaFiltro, FiltrosAuditoria } from '@/lib/services/auditoria.service';
import dynamic from 'next/dynamic';

const PDFExportButton = dynamic(
  () => import('@/components/reportes/PDFExportButton'),
  { ssr: false, loading: () => <span className="text-xs text-gray-400">Preparando PDF...</span> }
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Auditoría</h1>
        <p className="text-sm text-gray-500">Historial centralizado de todas las reservas del sistema.</p>
      </div>

      {/* Filtros de busqueda */}
      <div className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Estado</label>
          <select
            value={filtros.estado ?? ''}
            onChange={e => handleFiltro('estado', e.target.value)}
            className="w-full border rounded p-2 text-sm"
          >
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e === '' ? 'Todos' : e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Laboratorio</label>
          <select
            value={filtros.laboratorio_id ?? ''}
            onChange={e => handleFiltro('laboratorio_id', e.target.value)}
            className="w-full border rounded p-2 text-sm"
          >
            <option value="">Todos</option>
            {laboratorios.map(l => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Fecha desde</label>
          <input
            type="date"
            value={filtros.fecha_desde ?? ''}
            onChange={e => handleFiltro('fecha_desde', e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Fecha hasta</label>
          <input
            type="date"
            value={filtros.fecha_hasta ?? ''}
            onChange={e => handleFiltro('fecha_hasta', e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={limpiarFiltros}
            className="w-full border rounded p-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        {registros.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-gray-400">{registros.length} registros encontrados</p>
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