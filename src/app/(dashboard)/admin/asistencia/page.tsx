'use client';

import { useState, useEffect } from 'react';
import { CustomModal } from '@/components/ui/CustomModal';
import { getReservasAsistencia, RegistroAsistencia } from '@/lib/services/asistencia.service';
import dynamic from 'next/dynamic';

const PDFExportButton = dynamic(
  () => import('@/components/reportes/PDFExportButton'),
  { ssr: false, loading: () => <span className="text-xs text-gray-400">Preparando PDF...</span> }
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

// Traduce el estado de asistencia a texto legible para el admin
function resolverEstado(reg: RegistroAsistencia): string {
  if (reg.asistencia_resuelta_por_timeout) return 'No confirmada (timeout)';
  if (reg.asistencia_confirmada === true) return 'Confirmada';
  if (reg.asistencia_confirmada === false) return 'No asistió';
  return 'Pendiente de confirmación';
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

  // Filtro aplicado en memoria sobre los datos ya cargados
  const registrosFiltrados = registros.filter(r => {
    if (filtro === 'confirmada') return r.asistencia_confirmada === true;
    if (filtro === 'no_confirmada') return r.asistencia_confirmada === false || r.asistencia_resuelta_por_timeout;
    if (filtro === 'pendiente') return r.asistencia_confirmada === null && !r.asistencia_resuelta_por_timeout;
    return true;
  });

  // Normaliza filas para la tabla y el PDF agregando el campo calculado
  const filas = registrosFiltrados.map(r => ({
    ...r,
    estado_asistencia: resolverEstado(r),
  }));

  // Indicadores de resumen para el admin
  const totalConfirmadas = registros.filter(r => r.asistencia_confirmada === true).length;
  const totalNoAsistio = registros.filter(r => r.asistencia_confirmada === false).length;
  const totalPendiente = registros.filter(r => r.asistencia_confirmada === null && !r.asistencia_resuelta_por_timeout).length;
  const totalTimeout = registros.filter(r => r.asistencia_resuelta_por_timeout).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Asistencia</h1>
        <p className="text-sm text-gray-500">Control de uso real de reservas aprobadas.</p>
      </div>

      {/* Indicadores de resumen */}
      {!cargando && registros.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4 bg-white">
            <p className="text-xs text-gray-400 mb-1">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">{totalConfirmadas}</p>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <p className="text-xs text-gray-400 mb-1">No asistió</p>
            <p className="text-2xl font-bold text-red-500">{totalNoAsistio}</p>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <p className="text-xs text-gray-400 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-500">{totalPendiente}</p>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <p className="text-xs text-gray-400 mb-1">Timeout</p>
            <p className="text-2xl font-bold text-gray-400">{totalTimeout}</p>
            <p className="text-xs text-gray-400">Sin confirmar a tiempo</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(['todos', 'confirmada', 'no_confirmada', 'pendiente'] as FiltroAsistencia[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1 text-sm border rounded ${filtro === f ? 'bg-slate-800 text-white' : 'bg-white text-gray-600'}`}>
            {f === 'todos' ? 'Todos' : f === 'confirmada' ? 'Confirmadas' : f === 'no_confirmada' ? 'No asistió' : 'Pendientes'}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4">
        {filas.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-gray-400">{filas.length} registros</p>
            <PDFExportButton
              titulo="Asistencia — Control de Reservas"
              columnas={COLUMNAS}
              filas={filas}
              nombreArchivo={`asistencia-${new Date().toISOString().split('T')[0]}.pdf`}
            />
          </div>
        )}

        {cargando && <p className="text-sm text-gray-500 p-4">Cargando...</p>}

        {!cargando && filas.length === 0 && (
          <p className="text-sm text-gray-400 p-4">
            No hay reservas aprobadas que mostrar.
            {filtro !== 'todos' && ' Prueba cambiando el filtro.'}
          </p>
        )}

        {!cargando && filas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  {COLUMNAS.map(col => (
                    <th key={col.key} className="text-left p-2 font-semibold text-gray-600">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2">{fila.fecha}</td>
                    <td className="p-2">{fila.docente_nombre}</td>
                    <td className="p-2">{fila.laboratorio_nombre}</td>
                    <td className="p-2">{fila.bloque_inicio}</td>
                    <td className="p-2">{fila.bloque_fin}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${fila.estado_asistencia === 'Confirmada' ? 'bg-green-100 text-green-700' :
                          fila.estado_asistencia === 'No asistió' ? 'bg-red-100 text-red-700' :
                            fila.estado_asistencia.includes('timeout') ? 'bg-gray-100 text-gray-500' :
                              'bg-yellow-100 text-yellow-700'
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
        <CustomModal isOpen={!!error} type="error" title="Error"
          message={error} onClose={() => setError(null)} />
      )}
    </div>
  );
}