import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/layout/DashboardClient";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single();

    const role = perfil?.rol === "administrador" ? "admin" : "docente";

    return (
        <DashboardClient role={role} userEmail={user.email}>
            {children}
        </DashboardClient>
    );
}