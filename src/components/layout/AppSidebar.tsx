"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { navItems } from "@/config/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavUser } from "@/components/layout/NavUser";
import { useSidebar } from "@/components/ui/sidebar";

interface AppSidebarProps {
    role: "admin" | "docente";
    userEmail?: string;
}

export function AppSidebar({ role, userEmail }: AppSidebarProps) {
    const pathname = usePathname();
    const { state, isMobile, setOpenMobile } = useSidebar();

    // En diseño responsivo, el sidebar en móvil siempre se considera "expandido" visualmente.
    const isCollapsed = state === "collapsed" && !isMobile;

    const filtered = navItems.filter((item) => item.roles.includes(role));

    return (
        <aside
            className={`
                h-full flex flex-col relative z-10
                transition-all duration-300 ease-in-out w-full
                bg-[#004B87] bg-gradient-to-b from-[#003865] to-[#004B87]
                text-white border-r border-white/10
            `}
        >
            {/* DECORACIÓN SUTIL DE FONDO */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl pointer-events-none -mt-10 -mr-10" />

            {/* ========================================== */}
            {/* ZONA DE LOGO DINÁMICO */}
            {/* ========================================== */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-white/10 shrink-0 relative z-10 overflow-hidden">

                {/* Logo Expandido */}
                <div
                    className={`relative transition-all duration-300 ease-in-out flex items-center
                    ${isCollapsed ? "w-0 opacity-0 invisible absolute" : "w-[150px] h-[45px] opacity-100 visible"}`}
                >
                    <Image
                        src="/logo.png"
                        alt="LabClick UPDS"
                        fill
                        className="object-contain brightness-0 invert"
                        priority
                    />
                </div>

                {/* Logo Reducido (Solo visible al colapsar en Desktop) */}
                <div
                    className={`relative transition-all duration-300 ease-in-out flex items-center
                    ${!isCollapsed ? "w-0 opacity-0 invisible absolute" : "w-[36px] h-[36px] opacity-100 visible"}`}
                >
                    <Image
                        src="/logo-reducido.png"
                        alt="Icono LabClick"
                        fill
                        className="object-contain brightness-0 invert"
                        priority
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* MENÚ SCROLLABLE CON CONDITIONAL TOOLTIPS */}
            {/* ========================================== */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 space-y-2 relative z-10">
                <div className="px-3 mb-4">
                    <p className={`text-[10px] font-black text-white/40 uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? "opacity-0 hidden" : "opacity-100 block"}`}>
                        Menú Principal
                    </p>
                </div>

                {filtered.map((item, i) => {
                    const Icon = item.icon;
                    const active = pathname === item.path;

                    // Contenido base del enlace (se usa en ambos casos)
                    const LinkContent = (
                        <Link
                            href={item.path}
                            onClick={() => setOpenMobile(false)}
                            className={`
                                flex items-center gap-3 px-3 py-3 rounded-xl
                                transition-all duration-200 group relative border
                                ${active
                                    ? "bg-white/15 text-white shadow-inner border-white/10 font-semibold"
                                    : "text-white/60 hover:bg-white/10 hover:text-white border-transparent"
                                }
                            `}
                        >
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                            )}
                            <Icon size={20} className="shrink-0" />

                            {!isCollapsed && (
                                <span className="text-sm truncate transition-opacity duration-300 opacity-100">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );

                    // FIX UX: Si está expandido, renderizamos solo el link. 
                    // Si está colapsado, lo envolvemos en el Tooltip.
                    if (!isCollapsed) {
                        return <div key={i}>{LinkContent}</div>;
                    }

                    return (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                {LinkContent}
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10} className="hidden md:block">
                                {item.name}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>

            {/* USER PROFILE */}
            <div className="p-2 border-t border-white/10 shrink-0 relative z-10">
                <NavUser user={{ email: userEmail, role: role }} isCollapsed={isCollapsed} />
            </div>
        </aside>
    );
}