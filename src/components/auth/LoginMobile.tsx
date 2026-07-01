"use client";

import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginMobile() {
    return (

        <main
            className="
            md:hidden

            relative

            min-h-screen

            overflow-hidden

            bg-upds-primary

            flex

            flex-col

            items-center

            justify-center

            px-5

            py-8
        "
        >


            {/* ===================================== */}
            {/* EFECTOS DE FONDO */}
            {/* ===================================== */}

            <div
                className="
                absolute

                top-[-15%]

                right-[-30%]

                w-[400px]

                h-[400px]

                rounded-full

                bg-upds-tertiary

                opacity-30

                blur-[100px]
            "
            />

            <div
                className="
                absolute

                bottom-[-20%]

                left-[-30%]

                w-[450px]

                h-[450px]

                rounded-full

                bg-blue-400

                opacity-20

                blur-[120px]
            "
            />





            {/* ===================================== */}
            {/* CONTENIDO */}
            {/* ===================================== */}

            <div
                className="
                relative

                z-10

                w-full

                max-w-sm

                flex

                flex-col

                items-center
            "
            >



                {/* LOGO */}

                <div
                    className="
                    relative

                    w-[220px]

                    h-[80px]

                    mb-8
                "
                >
                    <Image
                        src="/logo.png"
                        alt="Logo UPDS"
                        fill
                        priority
                        className="
                        object-contain

                        brightness-0

                        invert
                    "
                    />
                </div>





                {/* CARD LOGIN */}

                <div
                    className="
                    w-full

                    bg-white

                    rounded-[28px]

                    shadow-2xl

                    border

                    border-white/30

                    p-7
                "
                >


                    <div
                        className="
                        text-center

                        mb-8
                    "
                    >


                        <h1
                            className="
                            text-3xl

                            font-black

                            text-slate-800

                            mb-2
                        "
                        >
                            Bienvenido
                        </h1>


                        <p
                            className="
                            text-sm

                            text-slate-500

                            font-medium
                        "
                        >
                            Ingresa tus credenciales para acceder.
                        </p>


                    </div>



                    <LoginForm />


                </div>





                {/* FOOTER */}

                <div
                    className="
                    mt-8

                    text-center

                    text-xs

                    font-black

                    uppercase

                    tracking-wider

                    text-white/70
                "
                >

                    © 2026 UPDS Cochabamba

                </div>


            </div>


        </main>

    );
}