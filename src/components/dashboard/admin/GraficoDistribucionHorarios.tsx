'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatoGraficoHorarios } from '@/lib/services/dashboard.admin.service';

interface GraficoDistribucionHorariosProps {
  datos: DatoGraficoHorarios[];
}

// Colores por turno — orden: mañana, mediodia, tarde
const COLORES = ['#004B87', '#0ea5e9', '#f59e0b'];

export function GraficoDistribucionHorarios({ datos }: GraficoDistribucionHorariosProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
        Distribución
      </p>
      <p className="text-lg font-black text-slate-800 mb-6">Reservas por turno — últimos 30 días</p>

      {datos.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Sin datos para mostrar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={datos}
              dataKey="total"
              nameKey="turno"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              animationBegin={0}
              animationDuration={800}
            >
              {datos.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}