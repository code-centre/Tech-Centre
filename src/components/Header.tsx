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
                    <Link href="#quienes-somos" className="hover:text-gray-300 transition-colors">
                        Quiénes Somos
                    </Link>
                    <Link href="#oferta-academica" className="hover:text-gray-300 transition-colors">
                        Oferta Académica
                    </Link>
                    <Link href="#testimonios" className="hover:text-gray-300 transition-colors">
                        Testimonios
                    </Link>
                    <button className="bg-white py-2 px-6 rounded-md hover:bg-gray-200 text-black">Inscríbete ahora</button>
                </nav>
                <button className="md:hidden text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-menu"
                    >
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                    </svg>
                </button>
            </div>
        </header>
    )
}
