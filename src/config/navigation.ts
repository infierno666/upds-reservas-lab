import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Settings,
    ShieldCheck,
    BarChart3,
    FlaskConical,
    Inbox,
    Clock,
    UserCheck
} from "lucide-react";

export const navItems = [
    // Dashboard Específico Administrador
    { name: "Dashboard Admin", path: "/admin/dashboard", roles: ["admin"], icon: LayoutDashboard },

    // Dashboard Específico Docente
    { name: "Dashboard Docente", path: "/docente/dashboard", roles: ["docente"], icon: LayoutDashboard },

    // Rutas Docente
    { name: "Nueva Reserva", path: "/docente/reserva/nueva", roles: ["docente"], icon: ClipboardList },
    { name: "Mis Reservas", path: "/docente/reservas", roles: ["docente"], icon: Calendar },
    { name: "Calendario", path: "/docente/calendario", roles: ["docente"], icon: Clock },

    // Rutas Admin
    { name: "Solicitudes", path: "/admin/solicitudes", roles: ["admin"], icon: Inbox },
    { name: "Laboratorios", path: "/admin/laboratorios", roles: ["admin"], icon: FlaskConical },
    { name: "Reportes", path: "/admin/reportes", roles: ["admin"], icon: BarChart3 },
    { name: "Historial", path: "/admin/auditoria", roles: ["admin"], icon: ShieldCheck },
    { name: "Asistencia", path: "/admin/asistencia", roles: ["admin"], icon: UserCheck },
];