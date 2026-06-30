"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type Role = "admin" | "docente";

type Props = {
    children: React.ReactNode;
    role: Role;
    userEmail?: string;
};

export default function DashboardClient({
    children,
    role,
    userEmail,
}: Props) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("sidebar:collapsed");
        if (saved) setCollapsed(saved === "true");
    }, []);

    const toggleSidebar = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem("sidebar:collapsed", String(next));
    };

    return (
        <TooltipProvider delayDuration={150}>
            <SidebarProvider defaultOpen={!collapsed}>
                <div className="flex h-screen w-full overflow-hidden bg-slate-100">

                    {/* 🔥 SIDEBAR FIJO */}
                    <div className="hidden md:flex h-full">
                        <AppSidebar
                            collapsed={collapsed}
                            role={role}
                            userEmail={userEmail}
                        />
                    </div>

                    {/* 🔥 CONTENIDO */}
                    <div className="flex flex-1 flex-col min-w-0">

                        {/* HEADER */}
                        <header className="flex h-14 items-center gap-3 border-b bg-white px-4 sticky top-0 z-50 shadow-sm">
                            <SidebarTrigger
                                onClick={toggleSidebar}
                                className="p-2 rounded-md hover:bg-gray-100 transition"
                            />

                            <span className="font-semibold text-gray-800 text-sm">
                                Panel de Control
                            </span>
                        </header>

                        {/* 🔥 SCROLL SOLO AQUÍ */}
                        <div className="flex-1 overflow-y-auto">
                            <main className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}