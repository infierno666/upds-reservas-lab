import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single();

    const role = perfil?.rol === 'administrador' ? 'admin' : 'docente';

    return (
        <div className="h-screen w-screen overflow-hidden flex bg-slate-50 font-sans antialiased text-slate-900">

            {/* 1. SIDEBAR: Ancho estricto y fijo de 260px */}
            <div className="hidden md:block w-[260px] h-full shrink-0 z-50">
                <Sidebar role={role as 'admin' | 'docente'} />
            </div>

            {/* 2. ÁREA DE TRABAJO DERECHA: Toma el resto del espacio disponible */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Cabecera superior fija en su propio contenedor de flujo */}
                <div className="h-[64px] w-full shrink-0 z-40">
                    <TopHeader />
                </div>

                {/* Contenedor del contenido con scroll independiente protegido */}
                <div className="flex-1 overflow-y-auto w-full">
                    <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </div>

            </div>
        </div>
    );
}