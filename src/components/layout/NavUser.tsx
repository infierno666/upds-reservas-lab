"use client";

import { LogOut, User as UserIcon, ChevronsUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavUserProps {
    user: {
        email?: string;
        role: string;
    };
}

export function NavUser({ user }: NavUserProps) {
    const { isMobile, state } = useSidebar();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-white/15 data-[state=open]:text-white hover:bg-white/10 text-white transition-all duration-300 rounded-xl h-14 border border-transparent hover:border-white/10"
                        >
                            <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md shadow-inner">
                                <UserIcon size={18} strokeWidth={2.5} />
                            </div>

                            {state === "expanded" && (
                                <>
                                    <div className="grid flex-1 text-left leading-tight ml-2">
                                        <span className="truncate font-bold text-white tracking-wide text-sm">
                                            {user.email?.split("@")[0] || "Usuario"}
                                        </span>
                                        <span className="truncate text-[11px] text-white/60 capitalize font-bold tracking-wider mt-0.5">
                                            {user.role}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-white/50" />
                                </>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl border-slate-200 shadow-2xl p-2"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={12}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-slate-100 text-[#004B87] shadow-sm">
                                    <UserIcon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-black text-slate-800 text-base">
                                        {user.email?.split("@")[0] || "Usuario"}
                                    </span>
                                    <span className="truncate text-xs text-slate-500 font-medium">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer font-bold rounded-xl py-3 my-1 transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}