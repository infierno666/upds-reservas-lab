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

  if (cargando) return (
    <div className="dashboard-shell w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
      <div className="kpi-grid grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[120px] bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="main-grid grid grid-cols-1 gap-6">
        <div className="h-[200px] bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-[200px] bg-slate-100 rounded-2xl animate-pulse" />
      </div>
      <div className="h-[300px] bg-slate-100 rounded-2xl animate-pulse" />
      <style jsx global>{`
        .dashboard-shell { container-type: inline-size; container-name: dashboard; }
        @container dashboard (min-width: 600px) {
          .kpi-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @container dashboard (min-width: 900px) {
          .main-grid { grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); }
        }
      `}</style>
    </div>
  );

  return (
    <div className="dashboard-shell w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-hidden">
      <div className="min-w-0 flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
          Hola, {nombreDocente}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Aquí tienes el resumen de tus actividades en laboratorios.
        </p>
      </div>

      {/* Eliminamos el grid interno forzado y dejamos que el contenedor CSS lo controle */}
      {kpis && (
        <div className="w-full">
          <StatsCardsDocente kpis={kpis} />
        </div>
      )}

      {kpis && (
        <div className="main-grid grid grid-cols-1 gap-6 items-stretch">
          <div className="main-col-primary min-w-0 h-full">
            <ProximaReserva kpis={kpis} />
          </div>
          <div className="min-w-0 h-full">
            <AccionesRapidas />
          </div>
        </div>
      )}

      <div className="w-full min-w-0 overflow-hidden">
        <UltimasSolicitudes solicitudes={solicitudes} />
      </div>

      {error && (
        <CustomModal isOpen={!!error} type="error"
          title="Error al cargar dashboard"
          message={error}
          onClose={() => setError(null)} />
      )}

      <style jsx global>{`
        .dashboard-shell {
          container-type: inline-size;
          container-name: dashboard;
        }

        /* Responsive interno basado en el ESPACIO DISPONIBLE, no en la pantalla */
        @container dashboard (min-width: 600px) {
          .kpi-grid { 
            grid-template-columns: repeat(4, minmax(0, 1fr)); 
          }
        }

        @container dashboard (min-width: 950px) {
          .main-grid {
            grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
          }
        }

        @container dashboard (min-width: 1280px) {
          .main-grid {
            grid-template-columns: minmax(0, 2.5fr) minmax(350px, 1fr);
          }
        }
      `}</style>
    </div>
  );
}