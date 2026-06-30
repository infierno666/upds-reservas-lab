'use client';

import React from 'react';
import { Laptop, Calendar, Inbox, BarChart3, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-1">Vista General</h1>
            <p className="text-gray-500 mb-6">Resumen del estado actual de los laboratorios e instalaciones.</p>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { title: "Laboratorios Activos", val: "12", sub: "/ 15 Total", icon: Laptop },
                    { title: "Reservas Hoy", val: "48", sub: "↑ 12%", icon: Calendar },
                    { title: "Solicitudes Pendientes", val: "7", sub: "Requieren atención", icon: Inbox },
                    { title: "Ocupación Promedio", val: "76%", sub: "----", icon: BarChart3 },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <stat.icon className="text-blue-900" size={24} />
                        </div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.val}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-bold mb-6">Uso de Laboratorios por Semana</h3>
                    {/* Placeholder gráfico */}
                    <div className="h-48 bg-slate-50 border-dashed border-2 flex items-center justify-center text-gray-400">
                        [Gráfico de líneas aquí - Recharts]
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-bold mb-6">Distribución por Horarios</h3>
                    <div className="h-48 bg-slate-50 border-dashed border-2 flex items-center justify-center text-gray-400">
                        [Gráfico Donut aquí - Recharts]
                    </div>
                </div>
            </div>

            {/* Solicitudes Urgentes */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2"><AlertCircle size={20} className="text-red-500" /> Solicitudes Urgentes</h3>
                    <a href="#" className="text-sm text-blue-600 font-semibold">VER TODAS</a>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-bold">Ing. Carlos Mendoza</p>
                            <p className="text-sm text-gray-500">Cambio de proyector en Lab 3 - Ingeniería</p>
                        </div>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">ALTA PRIORIDAD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}