'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomModal } from '@/components/ui/CustomModal';
import { LaboratorioForm } from '@/components/laboratorios/LaboratorioForm';
import { DeshabilitarModal } from '@/components/laboratorios/DeshabilitarModal';
import { Laboratorio, LaboratorioFormData } from '@/types/laboratory';
import {
  getLaboratorios, crearLaboratorio, editarLaboratorio,
  habilitarLaboratorio, deshabilitarLaboratorio
} from '@/lib/services/laboratorio.service';

type Filtro = 'todos' | 'activo' | 'inactivo';

export default function LaboratoriosPage() {
  const [labs, setLabs] = useState<Laboratorio[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [formAbierto, setFormAbierto] = useState(false);
  const [labEditando, setLabEditando] = useState<Laboratorio | null>(null);
  const [labDeshabilitando, setLabDeshabilitando] = useState<Laboratorio | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarLabs = async () => {
    try {
      setLabs(await getLaboratorios());
    } catch (err: any) {
      setFeedback({ tipo: 'error', mensaje: err.message });
    }
  };

  useEffect(() => { cargarLabs(); }, []);

  const labsFiltrados = labs.filter(l => filtro === 'todos' || l.estado_operativo === filtro);

  const handleGuardar = async (form: LaboratorioFormData) => {
    try {
      if (labEditando) await editarLaboratorio(labEditando.id, form);
      else await crearLaboratorio(form);
      setFormAbierto(false);
      setLabEditando(null);
      await cargarLabs();
      setFeedback({ tipo: 'success', mensaje: 'Laboratorio guardado correctamente.' });
    } catch (err: any) {
      setFeedback({ tipo: 'error', mensaje: err.message });
    }
  };

  const handleHabilitar = async (lab: Laboratorio) => {
    try {
      await habilitarLaboratorio(lab.id);
      await cargarLabs();
      setFeedback({ tipo: 'success', mensaje: 'Laboratorio habilitado.' });
    } catch (err: any) {
      setFeedback({ tipo: 'error', mensaje: err.message });
    }
  };

  const handleDeshabilitar = async (motivo: string) => {
    if (!labDeshabilitando) return;
    try {
      await deshabilitarLaboratorio(labDeshabilitando.id, motivo);
      setLabDeshabilitando(null);
      await cargarLabs();
      setFeedback({ tipo: 'success', mensaje: 'Laboratorio deshabilitado y reservas canceladas.' });
    } catch (err: any) {
      setLabDeshabilitando(null);
      setFeedback({ tipo: 'error', mensaje: err.message });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Laboratorios</h1>
        <Button onClick={() => { setLabEditando(null); setFormAbierto(true); }}>
          <Plus size={16} /> Agregar laboratorio
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['todos', 'activo', 'inactivo'] as Filtro[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-3 py-1 border rounded text-sm ${filtro === f ? 'bg-slate-200' : ''}`}>
            {f}
          </button>
        ))}
      </div>

      <table className="w-full border text-sm">
        <thead><tr className="border-b"><th className="text-left p-2">Nombre</th><th className="text-left p-2">Capacidad</th><th className="text-left p-2">Estado</th><th className="p-2">Acciones</th></tr></thead>
        <tbody>
          {labsFiltrados.map(lab => (
            <tr key={lab.id} className="border-b">
              <td className="p-2">{lab.nombre}</td>
              <td className="p-2">{lab.capacidad ?? '-'}</td>
              <td className="p-2">{lab.estado_operativo}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button onClick={() => { setLabEditando(lab); setFormAbierto(true); }}><Edit2 size={16} /></button>
                {lab.estado_operativo === 'activo'
                  ? <button onClick={() => setLabDeshabilitando(lab)}><Lock size={16} /></button>
                  : <button onClick={() => handleHabilitar(lab)}><Unlock size={16} /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CustomModal isOpen={formAbierto} type="form" title={labEditando ? 'Editar laboratorio' : 'Nuevo laboratorio'} message="" onClose={() => setFormAbierto(false)}>
        <LaboratorioForm laboratorio={labEditando} onSubmit={handleGuardar} onCancel={() => setFormAbierto(false)} />
      </CustomModal>

      <DeshabilitarModal isOpen={!!labDeshabilitando} nombreLaboratorio={labDeshabilitando?.nombre ?? ''} onClose={() => setLabDeshabilitando(null)} onConfirm={handleDeshabilitar} />

      {feedback && <CustomModal isOpen={!!feedback} type={feedback.tipo} title={feedback.tipo === 'success' ? 'Listo' : 'Error'} message={feedback.mensaje} onClose={() => setFeedback(null)} />}
    </div>
  );
}