'use client';

import React from 'react';
import { Search, Plus, Grid3X3, List, Edit2, FileText, Lock, Laptop, Users } from 'lucide-react';
// Asegúrate de que esta ruta sea correcta o define la interface aquí mismo si prefieres
import { Laboratory } from '@/types/laboratory';

const laboratories: Laboratory[] = [
    {
        id: '1', name: 'Lab-102', status: 'Operativo', location: 'Bloque B, Planta Alta',
        equipmentCount: 30, occupied: 0, capacity: 30, tags: ['AutoCAD 2024', 'MATLAB', 'i7 / 16GB RAM'], isLocked: false
    },
    {
        id: '2', name: 'Lab-105', status: 'Mantenimiento', location: 'Bloque A, Planta Baja',
        equipmentCount: 25, occupied: 0, capacity: 0, tags: ['Cisco Packet Tracer', 'Switches Cisco Catalyst'], isLocked: true
    },
    {
        id: '3', name: 'Lab-Redes', status: 'Operativo', location: 'Bloque C, Subsuelo',
        equipmentCount: 20, occupied: 18, capacity: 20, tags: ['Racks de Servidores', 'Patch Panels Cat6'], isLocked: false
    }
];

export default function LaboratoriosPage() {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laboratorios</h1>
                    <p className="text-gray-500">Gestión y monitoreo de espacios físicos y equipamiento.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="text" placeholder="Buscar laboratorio..." className="pl-10 pr-4 py-2 border rounded-lg" />
                    </div>
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Plus size={18} /> Agregar Laboratorio
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex justify-between mb-6">
                <div className="flex gap-2">
                    {['Todos', 'Operativos', 'Mantenimiento'].map(filter => (
                        <button key={filter} className="px-4 py-1 border rounded-full bg-white">{filter}</button>
                    ))}
                </div>
                <div className="flex bg-white border rounded-lg p-1">
                    <Grid3X3 className="p-1 cursor-pointer" />
                    <List className="p-1 cursor-pointer text-gray-400" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {laboratories.map((lab) => (
                    <div key={lab.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold">{lab.name}</h2>
                                <span className={`text-xs px-2 py-0.5 rounded ${lab.status === 'Operativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    ● {lab.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-gray-400">...</div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4 flex items-center">📍 {lab.location}</p>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg w-full">
                                <p className="text-xs text-gray-400">Capacidad</p>
                                <p className="font-bold flex items-center gap-1"><Laptop size={16} /> {lab.capacity} Equipos</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg w-full">
                                <p className="text-xs text-gray-400">Ocupación</p>
                                <p className={`font-bold flex items-center gap-1 ${lab.status === 'Mantenimiento' ? 'text-gray-400' : ''}`}>
                                    <Users size={16} /> {lab.status === 'Mantenimiento' ? 'Cerrado' : `${lab.occupied} / ${lab.capacity}`}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-semibold mb-2">EQUIPAMIENTO DESTACADO</p>
                            <div className="flex flex-wrap gap-2">
                                {lab.tags.map(tag => <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>)}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 border py-2 rounded-lg flex items-center justify-center gap-2"><Edit2 size={16} /> Editar</button>
                            <button className="flex-1 border py-2 rounded-lg flex items-center justify-center gap-2"><FileText size={16} /> Inventario</button>
                            <button className={`p-2 rounded-lg ${lab.isLocked ? 'bg-blue-900 text-white' : 'border'}`}>
                                <Lock size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}