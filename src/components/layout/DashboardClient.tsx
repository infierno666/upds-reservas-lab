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
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans selection:bg-[#004B87]/20 relative">

            {/* Desktop Sidebar */}
            <div className={`hidden md:flex h-full shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[80px]" : "w-[280px]"}`}>
                <AppSidebar role={role} userEmail={userEmail} />
            </div>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${openMobile ? "visible opacity-100" : "invisible opacity-0"}`}>
                <div
                    onClick={() => setOpenMobile(false)}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
                />
                <div className={`absolute top-0 left-0 h-full w-[280px] bg-[#004B87] transition-transform duration-300 ease-in-out shadow-2xl ${openMobile ? "translate-x-0" : "-translate-x-full"}`}>
                    <AppSidebar role={role} userEmail={userEmail} />
                </div>
            </div>

            <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden relative">

                {/* ========================================== */}
                {/* HEADER SUPERIOR */}
                {/* ========================================== */}
                <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-40 shadow-sm">

                    {/* Trigger Desktop */}
                    <SidebarTrigger
                        className="hidden md:inline-flex p-2.5 rounded-xl text-slate-500 hover:bg-[#004B87]/5 hover:text-[#004B87] transition-all"
                    />

                    {/* Trigger Mobile */}
                    <button
                        onClick={() => setOpenMobile(!openMobile)}
                        className="inline-flex md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#004B87] transition-all focus:outline-none focus:ring-2 focus:ring-[#004B87]/20"
                    >
                        {openMobile
                            ? <X size={22} />
                            : <Menu size={22} />
                        }
                    </button>

                    {/* DERECHA HEADER */}
                    <div className="ml-auto flex items-center gap-3">

                        {/* Notificaciones SOLO DOCENTE */}
                        {role === "docente" && (
                            <NotificacionesBell />
                        )}

                    </div>

                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <main className="flex flex-col w-full h-full min-h-full p-4 md:p-6 lg:p-8 transition-all duration-300">
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