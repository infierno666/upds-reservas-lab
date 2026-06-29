import { MapPin, CalendarDays, BookOpen, Clock } from "lucide-react";

interface Props {
    laboratorios: any[];
    labSeleccionado: string;
    setLabSeleccionado: (val: string) => void;
    materiaSeleccionada: string;
    setMateriaSeleccionada: (val: string) => void;
    periodoModulo: string;
    setPeriodoModulo: (val: string) => void;
    periodoAnio: string;
    setPeriodoAnio: (val: string) => void;
    fechaPivote: string;
    setFechaPivote: (val: string) => void;
    cantidadSeleccionada: number;
}

export function ReservaSidebarConfig({
    laboratorios,
    labSeleccionado, setLabSeleccionado,
    materiaSeleccionada, setMateriaSeleccionada,
    periodoModulo, setPeriodoModulo,
    periodoAnio, setPeriodoAnio,
    fechaPivote, setFechaPivote,
    cantidadSeleccionada
}: Props) {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6 h-full min-h-[600px]">
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <MapPin size={20} className="text-[#001D4A]" /> Configuración
                </h3>
                <p className="text-sm text-slate-500">Defina los parámetros para su reserva.</p>
            </div>

            <div className="space-y-5 flex-1">
                {/* Laboratorio */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Laboratorio Requerido</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-[#001D4A]/50 outline-none transition-all cursor-pointer"
                        value={labSeleccionado}
                        onChange={(e) => setLabSeleccionado(e.target.value)}
                    >
                        <option value="">Seleccione un espacio...</option>
                        {laboratorios.map(lab => (
                            <option key={lab.id} value={lab.id}>{lab.nombre} (Cap: {lab.capacidad})</option>
                        ))}
                    </select>
                </div>

                {/* Materia / Actividad (Texto Libre) */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <BookOpen size={16} className="text-slate-400" /> Materia o Actividad
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ej. Programación Web II, Examen..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-700 focus:ring-2 focus:ring-[#001D4A]/50 outline-none transition-all"
                            value={materiaSeleccionada}
                            onChange={(e) => setMateriaSeleccionada(e.target.value)}
                            maxLength={100}
                        />
                        <BookOpen size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    </div>
                </div>

                {/* Periodo y Año */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Módulo</label>
                        <input type="number" min="1" max="12"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-[#001D4A]/50 outline-none"
                            value={periodoModulo} onChange={(e) => setPeriodoModulo(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Año</label>
                        <input type="number" min="2024"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-[#001D4A]/50 outline-none"
                            value={periodoAnio} onChange={(e) => setPeriodoAnio(e.target.value)}
                        />
                    </div>
                </div>

                {/* Fecha Pivote */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <CalendarDays size={16} className="text-slate-400" /> Fecha de Referencia
                    </label>
                    <input type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-[#001D4A]/50 outline-none cursor-pointer"
                        value={fechaPivote} onChange={(e) => setFechaPivote(e.target.value)}
                    />
                </div>
            </div>

            {/* Panel de Resumen (Llena el espacio visual) */}
            <div className="mt-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3 flex items-center gap-2">
                    <Clock size={14} /> Resumen en Tiempo Real
                </h4>
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-sm font-bold text-slate-600">Bloques Elegidos</span>
                    <span className={`text-2xl font-black ${cantidadSeleccionada > 0 ? 'text-[#001D4A]' : 'text-slate-300'}`}>
                        {cantidadSeleccionada}
                    </span>
                </div>
                {cantidadSeleccionada === 0 && (
                    <p className="text-xs text-slate-400 mt-4 text-center px-2">Haga clic en la grilla de la derecha para seleccionar horarios disponibles.</p>
                )}
            </div>
        </div>
    );
}