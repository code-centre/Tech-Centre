import Link from 'next/link'
import React from 'react'
import Image from 'next/image'  

export default function Header() {
    
    return (
        <header className="bg-black border-b border-zinc-800 fixed w-full z-20">
            <div className="max-w-7xl mx-auto px-4 lg:px-0 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/tech-center-logos/Logo-horizontal-azul.png"
                            alt="Logo de Tech-Centre"
                            width={200}
                            height={200}
                            className="rounded-full hover:translate-y hover:scale-105 transition-transform duration-300 ease-in-out"
                        />  
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#quienes-somos" className="hover:text-blue-400 hover:translate-y hover:scale-105 transition-transform duration-300 ease-in-out">
                        Quiénes somos
                    </Link>
                    <Link href="#oferta-academica" className="hover:text-blue-400 hover:translate-y hover:scale-105 transition-transform duration-300 ease-in-out">
                        Oferta académica
                    </Link>
                    <Link href="#testimonios" className="hover:text-blue-400 hover:translate-y hover:scale-105 transition-transform duration-300 ease-in-out">
                        Testimonios
                    </Link>
                </nav>
            </div>
        </header>
    )
}
