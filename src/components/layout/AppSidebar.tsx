"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavUser } from "@/components/layout/NavUser";
import { FlaskConical } from "lucide-react";

export function AppSidebar({
    collapsed,
    role,
    userEmail,
}: {
    collapsed: boolean;
    role: "admin" | "docente";
    userEmail?: string;
}) {
    const pathname = usePathname();

    const filtered = navItems.filter((item) =>
        item.roles.includes(role)
    );

    return (
        <aside
            className={`
        h-screen sticky top-0 flex flex-col
        transition-all duration-300
        ${collapsed ? "w-[72px]" : "w-[260px]"}
        bg-gradient-to-b from-[#0a2540] to-[#133b63]
        text-white border-r border-white/10
      `}
        >
            {/* LOGO */}
            <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
                    <FlaskConical size={20} />
                </div>

                {!collapsed && (
                    <span className="font-bold text-sm tracking-wide">
                        LABCLICK UPDS
                    </span>
                )}
            </div>

            {/* 🔥 MENÚ SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {filtered.map((item, i) => {
                    const Icon = item.icon;
                    const active = pathname === item.path;

                    return (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.path}
                                    className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-all duration-200 group
                    ${active
                                            ? "bg-white/20 font-semibold"
                                            : "hover:bg-white/10"
                                        }
                    `}
                                >
                                    <Icon size={18} />

                                    {!collapsed && (
                                        <span className="text-sm truncate">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            </TooltipTrigger>

                            {collapsed && (
                                <TooltipContent side="right">
                                    {item.name}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>

            {/* 🔥 USER FIJO ABAJO */}
            <div className="p-2 border-t border-white/10 shrink-0">
                <NavUser
                    user={{
                        email: userEmail,
                        role: role,
                    }}
                />
            </div>
        </aside>
    );
}