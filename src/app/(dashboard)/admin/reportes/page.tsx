'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TablaReporte } from '@/components/reportes/TablaReporte';
import { CustomModal } from '@/components/ui/CustomModal';
import {
  getReporteLaboratorio, getReporteDocente, getReporteMateria,
  getReporteAusentismo, getReporteSolicitudesGlobales, getReporteDiasDemanda,
} from '@/lib/services/reporte.service';

// Carga dinamica requerida — @react-pdf/renderer no es compatible con SSR
const PDFExportButton = dynamic(
  () => import('@/components/reportes/PDFExportButton'),
  { ssr: false, loading: () => <span className="text-xs text-gray-400">Preparando PDF...</span> }
);

type TabActiva = 'laboratorio' | 'docente' | 'materia' | 'ausentismo' | 'solicitudes' | 'demanda';

const TABS: { key: TabActiva; label: string }[] = [
  { key: 'laboratorio', label: 'Uso por Laboratorio' },
  { key: 'docente', label: 'Uso por Docente' },
  { key: 'materia', label: 'Uso por Materia' },
  { key: 'ausentismo', label: 'Índice de Ausentismo' },
  { key: 'solicitudes', label: 'Solicitudes Globales' },
  { key: 'demanda', label: 'Días de Mayor Demanda' },
];

const COLUMNAS: Record<TabActiva, { key: string; label: string }[]> = {
  laboratorio: [
    { key: 'nombre', label: 'Laboratorio' }, { key: 'semestre', label: 'Semestre' },
    { key: 'periodo_anio', label: 'Año' }, { key: 'total_aprobadas', label: 'Aprobadas' },
    { key: 'total_rechazadas', label: 'Rechazadas' }, { key: 'total_canceladas', label: 'Canceladas' },
    { key: 'total_no_usadas', label: 'No usadas' },
  ],
  docente: [
    { key: 'nombre_completo', label: 'Docente' }, { key: 'semestre', label: 'Semestre' },
    { key: 'periodo_anio', label: 'Año' }, { key: 'total_aprobadas', label: 'Aprobadas' },
    { key: 'total_ausencias', label: 'Ausencias' },
  ],
  materia: [
    { key: 'materia_actividad', label: 'Materia' }, { key: 'semestre', label: 'Semestre' },
    { key: 'periodo_anio', label: 'Año' }, { key: 'total_reservas', label: 'Total reservas' },
  ],
  ausentismo: [
    { key: 'nombre_completo', label: 'Docente' }, { key: 'total_reservas_aprobadas', label: 'Aprobadas' },
    { key: 'total_no_usadas', label: 'No utilizadas' }, { key: 'porcentaje_ausentismo', label: '% Ausentismo' },
  ],
  solicitudes: [
    { key: 'estado', label: 'Estado' }, { key: 'total', label: 'Total' },
    { key: 'porcentaje', label: '% del total' },
  ],
  demanda: [
    { key: 'dia_nombre', label: 'Día' }, { key: 'total_reservas', label: 'Reservas aprobadas' },
  ],
};

function calcularIndicadores(tab: TabActiva, filas: any[]) {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTab('laboratorio'); }, []);

  const handleTab = (tabKey: TabActiva) => { setTab(tabKey); cargarTab(tabKey); };
  const indicadores = calcularIndicadores(tab, datos[tab]);
  const tabActual = TABS.find(t => t.key === tab)!;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Reportes</h1>
        <p className="text-sm text-gray-500">Estadísticas de uso del sistema de reservas.</p>
      </div>

      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => handleTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.key ? 'border-slate-800 text-slate-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {indicadores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {indicadores.map((ind, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white">
              <p className="text-xs text-gray-400 mb-1">{ind.label}</p>
              <p className="text-lg font-bold text-slate-800 truncate">{ind.valor}</p>
              <p className="text-xs text-gray-500 mt-1">{ind.nota}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        {datos[tab].length > 0 && (
          <div className="flex justify-end mb-4">
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
        <CustomModal isOpen={!!error} type="error" title="Error al cargar reporte"
          message={error} onClose={() => setError(null)} />
      )}
    </div>
  );
}