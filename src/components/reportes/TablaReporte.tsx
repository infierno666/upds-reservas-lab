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
  if (cargando) return <div className="p-8 text-center text-slate-500 font-medium">Cargando datos...</div>;
  if (filas.length === 0) return <div className="p-8 text-center text-slate-400 font-medium">{vacio}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columnas.map(col => (
              <th key={col.key} className="text-left p-4 font-black text-slate-500 uppercase text-[11px] tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {columnas.map(col => (
                <td key={col.key} className="p-4 text-slate-700 font-medium">
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