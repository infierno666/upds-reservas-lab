// Wrapper que aísla @react-pdf/renderer del SSR de Next.js
// Este archivo NUNCA se importa directamente — solo via dynamic()

'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportePDF } from './ReportePDF';

interface PDFExportButtonProps {
  titulo: string;
  columnas: { key: string; label: string }[];
  filas: Record<string, any>[];
  nombreArchivo: string;
}

export default function PDFExportButton({ titulo, columnas, filas, nombreArchivo }: PDFExportButtonProps) {
  return (
    <PDFDownloadLink
      document={<ReportePDF titulo={titulo} columnas={columnas} filas={filas} />}
      fileName={nombreArchivo}
      className="px-4 py-2 text-sm border rounded bg-slate-800 text-white hover:bg-slate-700"
    >
      {({ loading }) => loading ? 'Generando PDF...' : 'Exportar PDF'}
    </PDFDownloadLink>
  );
}