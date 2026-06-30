'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Lock, Unlock, Search, LayoutGrid, List as ListIcon, MapPin, Laptop, Users } from 'lucide-react';
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
    const [busqueda, setBusqueda] = useState('');
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

    // Lógica de filtro combinada
    const labsFiltrados = labs.filter(l => {
        const coincideFiltro = filtro === 'todos' || l.estado_operativo === filtro;
        const coincideBusqueda = l.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideFiltro && coincideBusqueda;
    });

    // ... (Mantienes tus funciones handleGuardar, handleHabilitar, handleDeshabilitar igual)
    const handleGuardar = async (form: LaboratorioFormData) => {
        try {
            if (labEditando) await editarLaboratorio(labEditando.id, form);
            else await crearLaboratorio(form);
            setFormAbierto(false); setLabEditando(null); await cargarLabs();
            setFeedback({ tipo: 'success', mensaje: 'Laboratorio guardado.' });
        } catch (err: any) { setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    const handleHabilitar = async (lab: Laboratorio) => {
        try { await habilitarLaboratorio(lab.id); await cargarLabs(); }
        catch (err: any) { setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    const handleDeshabilitar = async (motivo: string) => {
        if (!labDeshabilitando) return;
        try { await deshabilitarLaboratorio(labDeshabilitando.id, motivo); setLabDeshabilitando(null); await cargarLabs(); }
        catch (err: any) { setLabDeshabilitando(null); setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laboratorios</h1>
                    <p className="text-gray-500 text-sm">Gestión y monitoreo de espacios físicos.</p>
                </div>
                <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => { setLabEditando(null); setFormAbierto(true); }}>
                    <Plus size={16} className="mr-2" /> Agregar Laboratorio
                </Button>
            </div>

            {/* Controles: Filtros y Buscador */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex bg-white p-1 rounded-lg border w-fit">
                    {(['todos', 'activo', 'inactivo'] as Filtro[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filtro === f ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-gray-500 hover:text-slate-800'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid de Laboratorios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labsFiltrados.map(lab => (
                    <div key={lab.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{lab.nombre}</h2>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${lab.estado_operativo === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    ● {lab.estado_operativo}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={16} className="mr-2" /> Ubicación no definida
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg w-full">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Capacidad</p>
                                    <p className="text-sm font-semibold flex items-center"><Laptop size={14} className="mr-1" /> {lab.capacidad ?? 0} Equipos</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => { setLabEditando(lab); setFormAbierto(true); }}>
                                <Edit2 size={14} className="mr-2" /> Editar
                            </Button>
                            <Button
                                variant={lab.estado_operativo === 'activo' ? 'outline' : 'default'}
                                size="sm"
                                className="w-10 px-0"
                                onClick={() => lab.estado_operativo === 'activo' ? setLabDeshabilitando(lab) : handleHabilitar(lab)}>
                                {lab.estado_operativo === 'activo' ? <Lock size={14} /> : <Unlock size={14} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modales */}
            <CustomModal isOpen={formAbierto} type="form" title={labEditando ? 'Editar laboratorio' : 'Nuevo laboratorio'} message="" onClose={() => setFormAbierto(false)}>
                <LaboratorioForm laboratorio={labEditando} onSubmit={handleGuardar} onCancel={() => setFormAbierto(false)} />
            </CustomModal>

            <DeshabilitarModal isOpen={!!labDeshabilitando} nombreLaboratorio={labDeshabilitando?.nombre ?? ''} onClose={() => setLabDeshabilitando(null)} onConfirm={handleDeshabilitar} />

            {feedback && <CustomModal isOpen={!!feedback} type={feedback.tipo} title={feedback.tipo === 'success' ? 'Listo' : 'Error'} message={feedback.mensaje} onClose={() => setFeedback(null)} />}
        </div>
    );
}