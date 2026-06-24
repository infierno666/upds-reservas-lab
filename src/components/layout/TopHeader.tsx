"use client";

import { Bell, Search, LogOut, User } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export default function TopHeader() {
    return (
        <header className="h-[64px] w-full bg-white border-b border-slate-200 shadow-xs flex justify-between items-center px-6 transition-all">

            {/* Buscador */}
            <div className="hidden sm:flex relative items-center w-full max-w-sm">
                <Search className="absolute left-3 text-slate-400" size={18} />
                <input
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-upds-primary/20 outline-none bg-slate-50 transition-all"
                    placeholder="Buscar disponibilidad..."
                    type="text"
                />
            </div>

            {/* Perfil y Notificaciones */}
            <div className="flex items-center gap-6 ml-auto">
                <button type="button" className="text-slate-400 hover:text-upds-primary transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700">
                        <User size={18} />
                        <span>Perfil</span>
                    </div>

                    <form action={logoutAction} className="inline-block">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                            <span className="hidden md:inline">Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </div>

        </header>
    );
}