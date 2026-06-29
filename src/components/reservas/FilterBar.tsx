"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export function FilterBar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [estado, setEstado] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Formatear manualmente la fecha para no depender de dependencias extra
            let fechaStr = "";
            if (date) {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                fechaStr = `${y}-${m}-${d}`;
            }

            onFilterChange({
                materia_actividad: searchTerm,
                estado: estado,
                fecha: fechaStr
            });
        }, 400); // Debounce de 400ms para UX óptima

        return () => clearTimeout(timeoutId);
    }, [searchTerm, estado, date]);

    const handleReset = () => {
        setSearchTerm("");
        setEstado("");
        setDate(undefined);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm w-full">

            {/* Buscador */}
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar materia o actividad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#001D4A]/20 transition-all font-medium text-slate-700 h-[42px]"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                {/* Select de Estados */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#001D4A]/20 appearance-none bg-white font-medium text-slate-600 min-w-[170px] h-[42px] cursor-pointer"
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                    </select>
                </div>

                {/* Filtro Fecha (Shadcn UI) */}
                {/* Filtro Fecha (Shadcn UI) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`h-[42px] min-w-[200px] justify-start text-left font-medium border-slate-200 rounded-xl hover:bg-slate-50 ${!date && "text-slate-500"}`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                            {date ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(date) : "Fecha de Solicitud"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-xl" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                        />
                    </PopoverContent>
                </Popover>

                {/* Botón Limpiar */}
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition-colors border border-slate-200 text-sm font-bold h-[42px]"
                >
                    <RotateCcw size={16} /> Limpiar
                </button>
            </div>
        </div>
    );
}