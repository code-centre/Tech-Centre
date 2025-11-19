
"use client"
import Link from "next/link"

export default function Anuncios() {
return (
    <div className="bg-yellow-200 text-center flex flex-col  sm:flex-row justify-center items-center py-2 sm:py-0 px-4 py-8 sm:px-0 gap-4 w-full text-sm sm:text-base h-10">
        <div className="hidden sm:flex sm:flex-row gap-2">
            <span className="text-sm  ">BLACK FRIDAY 🔥</span>
        </div>
        <div className="flex sm:flex-row gap-2">
            <span className="">Aprovecha hasta 20% de descuento</span>
        </div>
        <div className="flex sm:flex-row gap-2">
            <Link 
                href="/#cursosespecializados"
                className="text-sm rounded-lg border border-black bg-background text-white p-1  hover:scale-105 duration-300"
                onClick={(e) => {
                if (window.location.pathname === "/") {
                    e.preventDefault();
                    document.getElementById("cursosespecializados")?.scrollIntoView({ behavior: "smooth" });
                }
                }}
            >
                Inscríbete
            </Link>
        </div>
        <div className="flex sm:flex-row gap-2">
            <p className="hidden sm:inline"> | </p>
        </div>
        <div className="flex sm:flex-row gap-2">
            <p className="hidden sm:inline font-bold"> Hasta el 30/11</p>
        </div>
    </div>
    )
}