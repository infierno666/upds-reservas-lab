'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Lock, Unlock, Search, Laptop, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomModal } from '@/components/ui/CustomModal';
import { LaboratorioForm } from '@/components/laboratorios/LaboratorioForm';
import { DeshabilitarModal } from '@/components/laboratorios/DeshabilitarModal';
import { BloqueoModal } from '@/components/laboratorios/BloqueoModal';
import { Laboratorio, LaboratorioFormData } from '@/types/laboratory';
import {
    getLaboratorios, crearLaboratorio, editarLaboratorio,
    habilitarLaboratorio, deshabilitarLaboratorio, crearBloqueoPreventivo
} from '@/lib/services/laboratorio.service';

type Filtro = 'todos' | 'activo' | 'inactivo';

export default function LaboratoriosPage() {
    const [labs, setLabs] = useState<Laboratorio[]>([]);
    const [filtro, setFiltro] = useState<Filtro>('todos');
    const [busqueda, setBusqueda] = useState('');
    const [formAbierto, setFormAbierto] = useState(false);
    const [labEditando, setLabEditando] = useState<Laboratorio | null>(null);
    const [labDeshabilitando, setLabDeshabilitando] = useState<Laboratorio | null>(null);
    const [labBloqueando, setLabBloqueando] = useState<Laboratorio | null>(null);
    const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

    const cargarLabs = async () => {
        try { setLabs(await getLaboratorios()); }
        catch (err: any) { setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    useEffect(() => { cargarLabs(); }, []);

    const labsFiltrados = labs.filter(l => {
        const coincideFiltro = filtro === 'todos' || l.estado_operativo === filtro;
        const coincideBusqueda = l.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideFiltro && coincideBusqueda;
    });

    const handleGuardar = async (form: LaboratorioFormData) => {
        try {
            if (labEditando) await editarLaboratorio(labEditando.id, form);
            else await crearLaboratorio(form);
            setFormAbierto(false); setLabEditando(null); await cargarLabs();
            setFeedback({ tipo: 'success', mensaje: 'Laboratorio guardado.' });
        } catch (err: any) { setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    const handleHabilitar = async (lab: Laboratorio) => {
        try { await habilitarLaboratorio(lab.id); await cargarLabs(); setFeedback({ tipo: 'success', mensaje: 'Laboratorio habilitado.' }); }
        catch (err: any) { setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    const handleDeshabilitar = async (motivo: string) => {
        if (!labDeshabilitando) return;
        try {
            await deshabilitarLaboratorio(labDeshabilitando.id, motivo);
            setLabDeshabilitando(null); await cargarLabs();
            setFeedback({ tipo: 'success', mensaje: 'Laboratorio deshabilitado y reservas canceladas.' });
        } catch (err: any) { setLabDeshabilitando(null); setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    const handleBloqueo = async (fechas: string[], motivo: string) => {
        if (!labBloqueando) return;
        try {
            await crearBloqueoPreventivo(labBloqueando.id, fechas, motivo);
            setLabBloqueando(null);
            setFeedback({ tipo: 'success', mensaje: `Bloqueo aplicado en ${fechas.length} día(s). Las reservas activas en esas fechas fueron canceladas.` });
        } catch (err: any) { setLabBloqueando(null); setFeedback({ tipo: 'error', mensaje: err.message }); }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laboratorios</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestión y monitoreo de espacios físicos.</p>
                </div>
                <Button
                    className="bg-[#004B87] hover:bg-[#003a6b] text-white font-bold rounded-xl px-5"
                    onClick={() => { setLabEditando(null); setFormAbierto(true); }}>
                    <Plus size={16} className="mr-2" /> Agregar Laboratorio
                </Button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-fit shadow-inner">
                    {(['todos', 'activo', 'inactivo'] as Filtro[]).map(f => (
                        <button key={f} onClick={() => setFiltro(f)}
                            className={`px-5 py-2.5 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${filtro === f ? 'bg-white text-[#004B87] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none bg-white"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {/* Sin resultados */}
            {labsFiltrados.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
                    <p className="text-slate-400 font-medium">No se encontraron laboratorios.</p>
                </div>
            )}

            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labsFiltrados.map(lab => (
                    <div key={lab.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                        {/* Nombre y estado */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight">{lab.nombre}</h2>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider mt-1 inline-block ${lab.estado_operativo === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    ● {lab.estado_operativo}
                                </span>
                            </div>
                        </div>

                        {/* Capacidad */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Capacidad</p>
                            <p className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                                <Laptop size={14} /> {lab.capacidad ?? 0} Equipos
                            </p>
                        </div>

                        {/* Características */}
                        {lab.caracteristicas && (
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">{lab.caracteristicas}</p>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                            <Button variant="outline" size="sm"
                                className="flex-1 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                                onClick={() => { setLabEditando(lab); setFormAbierto(true); }}>
                                <Edit2 size={14} className="mr-1.5" /> Editar
                            </Button>

                            {/* Bloqueo por fechas — solo si está activo */}
                            {lab.estado_operativo === 'activo' && (
                                <Button variant="outline" size="sm"
                                    className="w-10 px-0 rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50"
                                    title="Bloquear en fechas específicas"
                                    onClick={() => setLabBloqueando(lab)}>
                                    <CalendarOff size={14} />
                                </Button>
                            )}

                            {/* Habilitar / Deshabilitar */}
                            <Button variant={lab.estado_operativo === 'activo' ? 'outline' : 'default'} size="sm"
                                className={`w-10 px-0 rounded-xl ${lab.estado_operativo === 'activo' ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-[#004B87] hover:bg-[#003a6b] text-white'}`}
                                title={lab.estado_operativo === 'activo' ? 'Deshabilitar' : 'Habilitar'}
                                onClick={() => lab.estado_operativo === 'activo' ? setLabDeshabilitando(lab) : handleHabilitar(lab)}>
                                {lab.estado_operativo === 'activo' ? <Lock size={14} /> : <Unlock size={14} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modales */}
            <CustomModal isOpen={formAbierto} type="form"
                title={labEditando ? 'Editar laboratorio' : 'Nuevo laboratorio'}
                message="" onClose={() => { setFormAbierto(false); setLabEditando(null); }}>
                <LaboratorioForm laboratorio={labEditando} onSubmit={handleGuardar}
                    onCancel={() => { setFormAbierto(false); setLabEditando(null); }} />
            </CustomModal>

            <DeshabilitarModal isOpen={!!labDeshabilitando}
                nombreLaboratorio={labDeshabilitando?.nombre ?? ''}
                onClose={() => setLabDeshabilitando(null)}
                onConfirm={handleDeshabilitar} />

            <BloqueoModal isOpen={!!labBloqueando}
                nombreLaboratorio={labBloqueando?.nombre ?? ''}
                onClose={() => setLabBloqueando(null)}
                onConfirm={handleBloqueo} />

            {feedback && (
                <CustomModal isOpen={!!feedback} type={feedback.tipo}
                    title={feedback.tipo === 'success' ? 'Listo' : 'Error'}
                    message={feedback.mensaje}
                    onClose={() => setFeedback(null)} />
            )}
        </div>
    );
}