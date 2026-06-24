"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/navigation";
import { FlaskConical } from "lucide-react";

interface SidebarProps {
    role: 'admin' | 'docente';
}

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const filteredItems = navItems.filter(item => item.roles.includes(role));

    return (
        <aside className="h-full w-[260px] bg-white border-r border-slate-200 flex flex-col">
            {/* Cabecera */}
            <div className="h-[64px] flex items-center gap-3 px-6 border-b border-slate-100 shrink-0">
                <div className="w-8 h-8 bg-upds-primary rounded flex items-center justify-center text-white shrink-0">
                    <FlaskConical size={20} />
                </div>
                <h1 className="font-bold text-upds-primary text-lg truncate">UPDS Lab</h1>
            </div>

            {/* Menú */}
            <nav className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-slate-100 text-upds-primary font-bold shadow-sm"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}