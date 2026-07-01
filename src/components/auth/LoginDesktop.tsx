"use client";

import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginDesktop() {
    return (
        <div className="hidden md:flex min-h-screen w-full">

            {/* ========================================================= */}
            {/* LADO IZQUIERDO: BRANDING (Optimizada para Laptops 13"/14") */}
            {/* ========================================================= */}
            <section className="relative w-1/2 min-h-screen bg-upds-primary overflow-hidden text-white flex flex-col justify-between p-8 lg:p-12 xl:p-16">

                {/* EFECTOS DE FONDO */}
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-upds-tertiary opacity-30 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400 opacity-20 blur-[120px] pointer-events-none" />

                {/* MODELO INSTITUCIONAL (Ancho relativo ajustado) */}
                <div className="absolute right-0 bottom-0 w-[120%] lg:w-[70%] xl:w-[65%] max-w-[860px] lg:max-w-[420px] xl:max-w-[550px] z-10 opacity-90 pointer-events-none">
                    <Image
                        src="/modelo-upds.png"
                        alt="Modelo UPDS"
                        width={600}
                        height={900}
                        priority
                        className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full h-auto"
                    />
                </div>

                {/* LOGO (Alturas corregidas) */}
                <div className="relative z-20">
                    <div className="relative 
                        w-[340px]
                        h-[230px]
                        b-20
                        lg:w-[300px]
                        lg:h-[120px]
                        lg:h-[75px] 
                        xl:w-[280px] 
                        xl:h-[200px]">
                        <Image
                            src="/logo.png"
                            alt="Logo UPDS"
                            fill
                            priority
                            className="object-contain object-left brightness-0 invert"
                        />
                    </div>
                </div>

                {/* TARJETA GLASSMORPHISM (Fluida y compacta) */}
                <div className="relative z-20 max-w-[280px] lg:max-w-[320px] xl:max-w-[420px] mb-4 lg:mb-8 xl:mb-10 p-6 xl:p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-3 xl:mb-5 leading-tight tracking-tighter">
                        Gestión
                        <br />
                        Precisa.
                    </h1>

                    <p className="text-xs lg:text-sm xl:text-base text-upds-secondary opacity-90 leading-relaxed font-medium">
                        Sistema avanzado para la administración integral de laboratorios universitarios.
                    </p>
                </div>

            </section>

            {/* ========================================================= */}
            {/* LADO DERECHO: FORMULARIO */}
            {/* ========================================================= */}
            <section className="w-1/2 min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 lg:p-12 xl:p-16 relative z-20">

                <div className="w-full max-w-[400px] xl:max-w-[440px] bg-white rounded-2xl border border-slate-200 p-8 lg:p-10 shadow-xl">
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                            Bienvenido
                        </h2>
                        <p className="text-slate-500 font-medium text-xs lg:text-sm">
                            Ingresa tus credenciales para acceder.
                        </p>
                    </div>

                    <LoginForm />
                </div>

                <div className="absolute bottom-6 xl:bottom-8 text-center text-[10px] lg:text-xs font-black uppercase tracking-wider text-slate-400">
                    © 2026 UPDS Cochabamba
                </div>

            </section>

        </div>
    );
}