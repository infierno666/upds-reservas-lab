'use client';

interface Columna {
  key: string;
  label: string;
}

interface TablaReporteProps {
  columnas: Columna[];
  filas: Record<string, any>[];
  cargando: boolean;
  vacio?: string;
}

export function TablaReporte({ columnas, filas, cargando, vacio = 'Sin datos disponibles.' }: TablaReporteProps) {
  if (cargando) return <p className="text-sm text-gray-500 p-4">Cargando...</p>;
  if (filas.length === 0) return <p className="text-sm text-gray-400 p-4">{vacio}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead>
          <tr className="border-b bg-gray-50">
            {columnas.map(col => (
              <th key={col.key} className="text-left p-2 font-semibold text-gray-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              {columnas.map(col => (
                <td key={col.key} className="p-2">
                  {fila[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}