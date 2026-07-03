"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X } from "lucide-react";
import { NotificacionesBell } from "@/components/layout/NotificacionesBell";

type Role = "admin" | "docente";

type Props = {
    children: React.ReactNode;
    role: Role;
    userEmail?: string;
};

function DashboardLayoutWrapper({ children, role, userEmail }: Props) {
    const { state, openMobile, setOpenMobile } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        // Usamos 100dvh para que en móviles la altura sea perfecta y no la tape la barra del navegador
        <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 font-sans selection:bg-[#004B87]/20 relative">

            {/* Desktop Sidebar */}
            <div className={`hidden md:flex h-full shrink-0 transition-all duration-300 ease-in-out z-20 relative border-r border-slate-200/50 ${isCollapsed ? "w-[80px]" : "w-[280px]"}`}>
                <AppSidebar role={role} userEmail={userEmail} />
            </div>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${openMobile ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div
                    onClick={() => setOpenMobile(false)}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                />
                <div className={`absolute top-0 left-0 h-full w-[280px] bg-[#004B87] transition-transform duration-300 ease-in-out shadow-2xl ${openMobile ? "translate-x-0" : "-translate-x-full"}`}>
                    <AppSidebar role={role} userEmail={userEmail} />
                </div>
            </div>

            {/* Contenedor Principal */}
            <div className="flex flex-1 flex-col min-w-0 h-full relative">

                {/* ========================================== */}
                {/* HEADER SUPERIOR */}
                {/* ========================================== */}
                <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30 transition-all">

                    {/* Trigger Desktop */}
                    <SidebarTrigger
                        className="hidden md:inline-flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#004B87] transition-colors focus:ring-2 focus:ring-[#004B87]/20"
                    />

                    {/* Trigger Mobile */}
                    <button
                        onClick={() => setOpenMobile(!openMobile)}
                        className="inline-flex md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#004B87] transition-colors focus:outline-none focus:ring-2 focus:ring-[#004B87]/20"
                        aria-label="Alternar menú"
                    >
                        {openMobile ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* DERECHA HEADER */}
                    <div className="ml-auto flex items-center gap-3">
                        {/* Notificaciones SOLO DOCENTE */}
                        {role === "docente" && (
                            <NotificacionesBell />
                        )}
                    </div>
                </header>

                {/* CONTENEDOR SCROLLABLE
                */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 custom-scrollbar relative">
                    {/* AQUÍ ESTÁ EL CAMBIO CLAVE: 
                        Se agregó `p-4 sm:p-6 lg:p-8` para dar un margen interno general.
                        También `max-w-[1600px]` para que en pantallas gigantes el contenido no se estire demasiado.
                    */}
                    <main className="flex flex-col w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-300">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function DashboardClient({ children, role, userEmail }: Props) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("sidebar:collapsed");
        if (saved) setCollapsed(saved === "true");
    }, []);

    return (
        <TooltipProvider delayDuration={150}>
            <SidebarProvider defaultOpen={!collapsed}>
                <DashboardLayoutWrapper role={role} userEmail={userEmail}>
                    {children}
                </DashboardLayoutWrapper>
            </SidebarProvider>
        </TooltipProvider>
    );
}