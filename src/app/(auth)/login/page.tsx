import LoginForm from "@/components/auth/LoginForm";
import { FlaskConical } from "lucide-react";


export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-white selection:bg-upds-primary/20 selection:text-upds-primary">
            <div className="w-full h-screen flex flex-col md:flex-row">

                {/* Lado Izquierdo: Branding / Ilustración con efecto sutil */}
                <div className="hidden md:flex flex-col w-1/2 bg-upds-primary relative overflow-hidden text-white p-10 lg:p-16 justify-between">

                    {/* Logo / Marca Header */}
                    <div className="z-10 flex items-center gap-2">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
                            <FlaskConical size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">LABCLICK UPDS</span>
                    </div>

                    {/* Tarjeta de Información Glassmorphism */}
                    <div className="z-10 max-w-lg mb-12 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
                            Gestión <br /> Precisa.
                        </h1>
                        <p className="text-lg text-upds-secondary opacity-90 leading-relaxed">
                            Sistema avanzado para la administración integral de laboratorios universitarios. Control de inventario, reservas de equipo y reportes en una plataforma centralizada.
                        </p>
                    </div>

                    {/* Efectos decorativos difuminados (Branding sutil e imperceptible) */}
                    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-upds-tertiary opacity-30 blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400 opacity-20 blur-[120px] pointer-events-none"></div>
                </div>

                {/* Lado Derecho: Formulario de Login */}
                <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 items-center justify-center p-6 sm:p-12 relative">

                    {/* Header en versión Mobile */}
                    <div className="md:hidden flex flex-col items-center mb-8 gap-2">
                        <svg className="w-10 h-10 text-upds-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.741 7.259l-7-5a1 1 0 00-1.166 0l-7 5A1 1 0 004 8v8a1 1 0 00.416.816l7 5a1 1 0 001.168 0l7-5A1 1 0 0020 16V8a1 1 0 00-.259-.741zM12 4.142l5.4 3.858-5.4 3.858-5.4-3.858L12 4.142zm-6 5.5l5 3.571v7.143l-5-3.571v-7.142zm7 10.714v-7.143l5-3.571v7.142l-5 3.572z" />
                        </svg>
                        <span className="text-2xl font-bold text-upds-primary">LabclickUPDS</span>
                    </div>

                    {/* Contenedor del Formulario */}
                    <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xl relative z-10">
                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido de nuevo</h2>
                            <p className="text-slate-500">Ingresa tus credenciales institucionales para acceder.</p>
                        </div>

                        {/* Inyección del Client Component */}
                        <LoginForm />

                    </div>

                    {/* Footer del Login */}
                    <div className="absolute bottom-6 w-full text-center px-6 md:px-12 md:max-w-[80%]">
                        <div className="flex flex-col sm:flex-row justify-center md:justify-between items-center w-full gap-4 text-sm text-slate-500">
                            <span>© 2026 UPDS Cochabamba</span>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-upds-primary transition-colors">Soporte Técnico</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}