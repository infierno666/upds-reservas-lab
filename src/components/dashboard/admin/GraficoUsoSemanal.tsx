'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DatoGraficoSemanal } from '@/lib/services/dashboard.admin.service';

interface GraficoUsoSemanalProps {
  datos: DatoGraficoSemanal[];
}

export function GraficoUsoSemanal({ datos }: GraficoUsoSemanalProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
        Uso de laboratorios
      </p>
      <p className="text-lg font-black text-slate-800 mb-6">Reservas aprobadas — última semana</p>

      {datos.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Sin datos para mostrar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={datos} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
              labelStyle={{ fontWeight: 800, color: '#0f172a' }}
            />
            <Line
              type="monotone"
              dataKey="reservas"
              stroke="#004B87"
              strokeWidth={3}
              dot={{ r: 5, fill: '#004B87', strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#004B87' }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}