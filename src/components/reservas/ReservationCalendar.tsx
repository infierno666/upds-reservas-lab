"use client";

import React from "react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { formatearFecha } from "@/lib/utils/dateUtils";


interface Props {

    fechaPivote: string;

    setFechaPivote: (fecha: string) => void;

}



export function ReservationCalendar({

    fechaPivote,
    setFechaPivote

}: Props) {



    const fechaActual = new Date(
        fechaPivote + "T12:00:00"
    );



    const cambiarFecha = (cantidad: number) => {


        const nueva =
            new Date(fechaActual);



        nueva.setMonth(
            nueva.getMonth() + cantidad
        );



        setFechaPivote(
            formatearFecha(nueva)
        );


    }




    const seleccionarDia = (dia?: Date) => {


        if (!dia) return;


        setFechaPivote(
            formatearFecha(dia)
        );


    }




    return (


        <div className="
bg-white
border
border-slate-200
rounded-3xl
p-5
shadow-sm
space-y-4

">


            {/* Header */}

            <div className="
flex
items-center
justify-between
">


                <button

                    onClick={() => cambiarFecha(-1)}

                    className="
p-2
rounded-xl
hover:bg-slate-100
transition
"

                >

                    <ChevronLeft size={20} />

                </button>



                <div className="
flex
items-center
gap-2
font-black
text-slate-800
">


                    <CalendarDays

                        className="text-[#001D4A]"

                    />


                    {

                        fechaActual.toLocaleDateString(
                            "es-ES",
                            {
                                month: "long",
                                year: "numeric"
                            }

                        )

                    }



                </div>




                <button

                    onClick={() => cambiarFecha(1)}

                    className="
p-2
rounded-xl
hover:bg-slate-100
transition
"

                >

                    <ChevronRight size={20} />

                </button>


            </div>



            {/* Calendario fijo */}

            <div className="
flex
justify-center
">


                <Calendar

                    mode="single"

                    selected={fechaActual}

                    onSelect={seleccionarDia}

                />


            </div>



            {/* Información */}

            <div className="
bg-slate-50
rounded-xl
p-3
text-center
">


                <p className="
text-xs
uppercase
font-bold
text-slate-400
">


                    Fecha seleccionada


                </p>


                <p className="
font-black
text-[#001D4A]
">


                    {

                        fechaActual.toLocaleDateString(
                            "es-ES",
                            {
                                weekday: "long",
                                day: "numeric",
                                month: "long"
                            }

                        )

                    }


                </p>


            </div>


        </div>


    )


}