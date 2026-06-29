"use client";


import React from "react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays
} from "lucide-react";


interface Props {

    fechaPivote: string;

    vista: "semana" | "mes";

    setFechaPivote: (fecha: string) => void;

}



export function CalendarNavigator({

    fechaPivote,
    vista,
    setFechaPivote


}: Props) {



    const fecha = new Date(
        fechaPivote + "T12:00:00"
    );



    const moverFecha = (cantidad: number) => {


        const nueva = new Date(fecha);



        if (vista === "semana") {

            nueva.setDate(
                nueva.getDate() + cantidad * 7
            );


        } else {


            nueva.setMonth(
                nueva.getMonth() + cantidad
            );


        }



        setFechaPivote(
            nueva.toISOString().split("T")[0]
        );


    };



    const irHoy = () => {


        setFechaPivote(

            new Date()
                .toISOString()
                .split("T")[0]

        );


    };



    return (


        <div className="
flex
items-center
justify-between
bg-white
border
border-slate-200
rounded-2xl
p-3
shadow-sm
mb-4

">


            <div className="
flex
gap-2
">


                <button

                    onClick={() => moverFecha(-1)}

                    className="
p-2
rounded-xl
hover:bg-slate-100
transition
"

                >

                    <ChevronLeft />

                </button>



                <button

                    onClick={irHoy}

                    className="
px-4
rounded-xl
bg-slate-100
font-bold
text-sm
hover:bg-slate-200
"

                >

                    Hoy

                </button>




                <button

                    onClick={() => moverFecha(1)}

                    className="
p-2
rounded-xl
hover:bg-slate-100
transition
"

                >

                    <ChevronRight />

                </button>


            </div>




            <div className="
flex
items-center
gap-2
font-black
text-slate-800
capitalize
">


                <CalendarDays

                    className="text-[#001D4A]"

                />


                {


                    fecha.toLocaleDateString(
                        "es-ES",
                        {

                            month: "long",

                            year: "numeric"

                        }

                    )


                }



            </div>



            <div className="
text-xs
font-bold
text-slate-400
uppercase
">

                Vista:

                {vista}


            </div>



        </div>


    )


}