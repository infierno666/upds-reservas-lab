"use client";

import { Search, RotateCcw } from "lucide-react";

export function FilterBar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
            {/* Buscador */}
            <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    placeholder="Buscar materia..."
                    onChange={(e) => onFilterChange({ materia: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-upds-primary/20"
                />
            </div>

            {/* Filtros */}
            <select className="px-3 py-2 border rounded-lg text-sm" onChange={(e) => onFilterChange({ estado: e.target.value })}>
                <option value="">Todos los Estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
            </select>

            <input type="date" className="px-3 py-2 border rounded-lg text-sm" onChange={(e) => onFilterChange({ fecha: e.target.value })} />

            <button className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors" onClick={() => window.location.reload()}>
                <RotateCcw size={16} /> Limpiar Filtros
            </button>
        </div>
    );
}