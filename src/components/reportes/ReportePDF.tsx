// Componente de exportacion a PDF usando @react-pdf/renderer
// Recibe el titulo del reporte, las columnas y las filas — es generico igual que TablaReporte

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { fontSize: 10, color: '#6b7280', marginBottom: 20 },
  fecha: { fontSize: 9, color: '#9ca3af', marginBottom: 16 },
  headerRow: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 6, borderRadius: 2 },
  headerCell: { flex: 1, color: '#ffffff', fontWeight: 'bold', fontSize: 9 },
  fila: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filaPar: { backgroundColor: '#f8fafc' },
  celda: { flex: 1, fontSize: 9, color: '#374151' },
  footer: { marginTop: 20, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
});

interface Columna { key: string; label: string; }

interface ReportePDFProps {
  titulo: string;
  columnas: Columna[];
  filas: Record<string, any>[];
}

export function ReportePDF({ titulo, columnas, filas }: ReportePDFProps) {
  const fechaGeneracion = new Date().toLocaleDateString('es-BO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>UPDS Lab — {titulo}</Text>
        <Text style={styles.subtitulo}>Sistema de Reserva de Laboratorios</Text>
        <Text style={styles.fecha}>Generado el {fechaGeneracion}</Text>

        {/* Encabezado de tabla */}
        <View style={styles.headerRow}>
          {columnas.map(col => (
            <Text key={col.key} style={styles.headerCell}>{col.label}</Text>
          ))}
        </View>

        {/* Filas de datos */}
        {filas.map((fila, i) => (
          <View key={i} style={[styles.fila, i % 2 === 0 ? styles.filaPar : {}]}>
            {columnas.map(col => (
              <Text key={col.key} style={styles.celda}>
                {fila[col.key] ?? '-'}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          Universidad Privada Domingo Savio — Reporte generado automáticamente
        </Text>
      </Page>
    </Document>
  );
}