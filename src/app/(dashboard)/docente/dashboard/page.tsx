'use client';

import React from 'react';
import { Calendar, Clock, Inbox, CheckCircle2, ChevronRight, Plus, Table, AlertCircle } from 'lucide-react';

export default function DocenteDashboard() {
    const solicitudes = [
        { lab: "Lab 1 - Cómputo", fecha: "20/06/2026", hora: "08:00 - 10:00", estado: "Pendiente" },
        { lab: "Lab 3 - Física", fecha: "18/06/2026", hora: "10:00 - 12:00", estado: "Aprobado" },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-2">Hola, Docente</h1>
            <p className="text-gray-500 mb-6">Aquí tienes el resumen de tus actividades en laboratorios.</p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { title: "Siguiente Reserva", val: "Lab 3 - Física", sub: "18/06/2026 • 10:00", icon: Calendar },
                    { title: "Solicitudes Pendientes", val: "3", sub: "Requieren atención", icon: Inbox },
                    { title: "Reservas Aprobadas", val: "12", sub: "Este mes", icon: CheckCircle2 },
                    { title: "Horas Utilizadas", val: "24.5", sub: "Hrs totales", icon: Clock },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <stat.icon className="text-blue-600" size={24} />
                        </div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-xl font-bold mt-1">{stat.val}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h3 className="font-bold mb-4">Acciones Rápidas</h3>
                        <button className="w-full bg-blue-950 text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-3">
                            <Plus size={18} /> NUEVA RESERVA
                        </button>
                        <button className="w-full border py-3 rounded-lg flex items-center justify-center gap-2 mb-3"><Calendar size={18} /> Ver Calendario</button>
                        <button className="w-full border py-3 rounded-lg flex items-center justify-center gap-2"><Table size={18} /> Mis Reservas</button>
                    </div>
                </div>

                {/* Right Col */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold">Últimas Solicitudes</h3>
                        <a href="#" className="text-sm text-blue-600">Ver todas</a>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b">
                                <th className="text-left pb-3">LABORATORIO</th>
                                <th className="text-left pb-3">FECHA</th>
                                <th className="text-left pb-3">HORARIO</th>
                                <th className="text-left pb-3">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map((s, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-4 font-medium">{s.lab}</td>
                                    <td className="py-4 text-gray-600">{s.fecha}</td>
                                    <td className="py-4 text-gray-600">{s.hora}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${s.estado === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            ● {s.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}