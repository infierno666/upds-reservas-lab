'use client';

import { useState, useEffect } from 'react';
import { StatsCardsDocente } from '@/components/dashboard/docente/StatsCards';
import { ProximaReserva } from '@/components/dashboard/docente/ProximaReserva';
import { AccionesRapidas } from '@/components/dashboard/docente/AccionesRapidas';
import { UltimasSolicitudes } from '@/components/dashboard/docente/UltimasSolicitudes';
import { CustomModal } from '@/components/ui/CustomModal';
import {
  getKPIsDocente, getUltimasSolicitudes,
  KPIsDocente, UltimaSolicitud
} from '@/lib/services/dashboard.docente.service';
import { createClient } from '@/lib/supabase/client';

export default function DocenteDashboard() {
  const [kpis, setKpis] = useState<KPIsDocente | null>(null);
  const [solicitudes, setSolicitudes] = useState<UltimaSolicitud[]>([]);
  const [nombreDocente, setNombreDocente] = useState('Docente');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        // Obtiene el nombre del docente autenticado
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('nombre_completo')
            .eq('id', user.id)
            .single();
          if (perfil?.nombre_completo) {
            setNombreDocente(perfil.nombre_completo.split(' ')[0]);
          }
        }

        // Carga KPIs y solicitudes en paralelo
        const [k, sol] = await Promise.all([
          getKPIsDocente(),
          getUltimasSolicitudes(),
        ]);
        setKpis(k);
        setSolicitudes(sol);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Skeleton de carga responsive
  if (cargando) return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse lg:col-span-1" />
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
        Hola, {nombreDocente}
      </h1>
      <p className="text-slate-500 font-medium mt-1">
        Aquí tienes el resumen de tus actividades en laboratorios.
      </p>

      {/* KPIs — 2 columnas en móvil, 4 en desktop */}
      {kpis && <StatsCardsDocente kpis={kpis} />}

      {/* Fila principal — stack en móvil, 3 columnas en desktop */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Próxima reserva — ocupa 2 columnas en desktop */}
          <div className="md:col-span-2">
            <ProximaReserva kpis={kpis} />
          </div>
          {/* Acciones rápidas */}
          <AccionesRapidas />
        </div>
      )}

      {/* Últimas solicitudes — tabla en desktop, cards en móvil */}
      <UltimasSolicitudes solicitudes={solicitudes} />

      {error && (
        <CustomModal isOpen={!!error} type="error"
          title="Error al cargar dashboard"
          message={error}
          onClose={() => setError(null)} />
      )}
    </div>
  );
}