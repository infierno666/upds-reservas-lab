"use client";

import React, { useMemo, useState } from "react";
import {
    Search,
    Monitor,
    CheckCircle2,
    MapPin
} from "lucide-react";


interface Props {
    laboratorios: any[];
    laboratorioSeleccionado: string;
    setLaboratorioSeleccionado: (id: string) => void;
}


export function LaboratoryHorizontalSelector({

    laboratorios,
    laboratorioSeleccionado,
    setLaboratorioSeleccionado

}: Props) {


    const [busqueda, setBusqueda] = useState("");



    const filtrados = useMemo(() => {


        return laboratorios.filter(lab =>

            lab.nombre
                .toLowerCase()
                .includes(
                    busqueda.toLowerCase()
                )

        );


    }, [
        laboratorios,
        busqueda
    ]);




    return (

        <div className="
        bg-white
        border
        border-slate-200
        rounded-3xl
        p-4
        shadow-sm
        space-y-4
        ">


            {/* Header */}

            <div className="
            flex
            items-center
            justify-between
            gap-4
            ">


                <h3 className="
                font-black
                text-slate-800
                flex
                items-center
                gap-2
                ">


                    <MapPin
                        size={20}
                        className="text-[#001D4A]"
                    />


                    Laboratorios disponibles


                </h3>



                <div className="
                relative
                w-72
                ">


                    <Search

                        size={18}

                        className="
                        absolute
                        left-3
                        top-3
                        text-slate-400
                        "

                    />


                    <input

                        value={busqueda}

                        onChange={(e) =>
                            setBusqueda(e.target.value)
                        }

                        placeholder="Buscar laboratorio..."

                        className="
                        w-full
                        bg-slate-50
                        border
                        border-slate-200
                        rounded-xl
                        py-2.5
                        pl-10
                        pr-4
                        outline-none
                        focus:ring-2
                        focus:ring-[#001D4A]/30
                        "

                    />


                </div>



            </div>





            {/* Cards horizontales */}

            <div className="

            flex
            gap-4
            overflow-x-auto
            pb-3
            custom-scrollbar

            ">



                {
                    filtrados.map((lab) => {


                        const seleccionado =
                            laboratorioSeleccionado === lab.id;



                        return (


                            <button


                                key={lab.id}


                                onClick={() =>
                                    setLaboratorioSeleccionado(lab.id)
                                }



                                className={`

                            min-w-[280px]

                            text-left

                            rounded-2xl

                            border

                            p-5

                            transition-all

                            flex-shrink-0


                            ${seleccionado

                                        ?

                                        "border-[#001D4A] bg-blue-50 shadow-lg"

                                        :

                                        "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"

                                    }

                            `}



                            >



                                <div className="
                            flex
                            justify-between
                            items-start
                            ">



                                    <h4 className="
                                font-black
                                text-slate-800
                                flex
                                items-center
                                gap-2
                                ">


                                        <MapPin

                                            size={18}

                                            className="text-[#001D4A]"

                                        />


                                        {lab.nombre}


                                    </h4>





                                    {

                                        seleccionado &&


                                        <CheckCircle2

                                            size={22}

                                            className="text-[#001D4A]"

                                        />

                                    }



                                </div>





                                <div className="
                            mt-4
                            space-y-2
                            text-sm
                            ">



                                    <div className="
                                flex
                                gap-2
                                text-slate-600
                                ">


                                        <Monitor size={16} />


                                        <span>

                                            Capacidad:

                                            <b className="ml-1">

                                                {lab.capacidad ?? "No definida"}

                                            </b>


                                        </span>


                                    </div>





                                    <p className="
                                text-slate-500
                                line-clamp-2
                                ">


                                        ⚙ {lab.caracteristicas ||
                                            "Sin características registradas"}


                                    </p>





                                    <span className={`

                                inline-flex

                                px-3

                                py-1

                                rounded-full

                                text-xs

                                font-bold


                                ${lab.estado_operativo === "activo"


                                            ?

                                            "bg-emerald-100 text-emerald-700"


                                            :

                                            "bg-red-100 text-red-700"


                                        }


                                `}>


                                        {

                                            lab.estado_operativo === "activo"

                                                ?

                                                "Activo"

                                                :

                                                "Inactivo"

                                        }


                                    </span>




                                </div>



                            </button>


                        )


                    })


                }



            </div>



        </div>


    )


}