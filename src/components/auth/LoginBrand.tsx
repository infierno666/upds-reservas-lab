"use client";

import Image from "next/image";


export default function LoginBrand() {

    return (

        <section
            className="
            absolute
            inset-0

            md:relative

            md:w-1/2
            md:min-h-screen

            bg-upds-primary

            overflow-hidden

            text-white

            flex
            flex-col

            justify-between

            p-8
            lg:p-16

            "
        >


            {/* Efectos */}

            <div
                className="
                absolute
                top-[15%]
                right-[-20%]

                w-[450px]
                h-[450px]

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

                left-[-20%]

                w-[600px]

                h-[600px]

                rounded-full

                bg-blue-400

                opacity-20

                blur-[120px]
                "
            />





            {/* Logo */}

            <div
                className="
                relative
                z-20

                flex
                justify-center
                md:justify-start

                "
            >

                <div
                    className="
                    relative

                    w-[220px]
                    h-[80px]

                    lg:w-[300px]
                    lg:h-[100px]

                    "
                >

                    <Image

                        src="/logo.png"

                        alt="Logo UPDS"

                        fill

                        priority

                        sizes="
                        (max-width:768px) 220px,
                        300px
                        "

                        className="
                        object-contain
                        brightness-0
                        invert
                        "

                    />


                </div>


            </div>






            {/* Modelo solo desktop */}

            <div
                className="
                hidden
                md:block

                absolute

                right-0

                bottom-0

                w-[95%]

                max-w-[600px]

                z-10

                opacity-90

                "
            >

                <Image

                    src="/modelo-upds.png"

                    alt="Modelo UPDS"

                    width={600}

                    height={900}

                    priority

                    className="
                    object-contain
                    object-bottom
                    drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                    "

                />

            </div>






            {/* Texto desktop */}

            <div
                className="
                hidden
                md:block

                relative
                z-20

                max-w-sm

                mb-10

                bg-white/10

                backdrop-blur-md

                border
                border-white/20

                rounded-2xl

                p-8

                shadow-xl
                "
            >


                <h1
                    className="
                    text-5xl
                    font-black

                    mb-5
                    "
                >

                    Gestión
                    <br />
                    Precisa.


                </h1>



                <p
                    className="
                    text-lg
                    text-upds-secondary

                    "
                >

                    Sistema avanzado para la administración integral de laboratorios universitarios.


                </p>


            </div>


        </section>


    );

}