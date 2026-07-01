import LoginForm from "./LoginForm";


export default function LoginCard() {


    return (

        <div

            className="
            relative
            z-20


            w-full

            max-w-[440px]


            bg-white


            rounded-3xl


            border
            border-slate-200


            p-8
            sm:p-10


            shadow-2xl


            "

        >



            <div
                className="
                mb-8
                text-center
                "
            >


                <h2

                    className="
                text-3xl
                font-black
                text-slate-800
                "

                >

                    Bienvenido


                </h2>


                <p

                    className="
                text-sm
                text-slate-500
                mt-2
                "

                >

                    Ingresa tus credenciales para acceder.


                </p>


            </div>



            <LoginForm />


        </div>


    )

}