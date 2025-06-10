'use client'
import Link from 'next/link'
import Image from 'next/image'
import useUserStore from '../../store/useUserStore'
import { useState, useEffect } from 'react'

export default function Header() {
    const [userOn, setUserOn] = useState(false)
    const { user } = useUserStore() as { user: User | null };

    useEffect(() => {
        if (user) {
            setUserOn(true)
        }
    }, [user]);

    const handleLogOut = () => {
        localStorage.removeItem('user')
        setUserOn(false)
    }

    return (
        <header className="bg-white border-zinc-800 fixed shadow-2xl w-full z-20">
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
                    {userOn ? (
                        <>
                            <Link href="/perfil" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md hover:scale-105 transition-transform duration-300 ease-in-out flex items-center gap-2" title="Ir a mi perfil">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {user?.name} {user?.lastName ? user?.lastName : ''}
                            </Link>
                            <button
                                onClick={handleLogOut}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md hover:scale-105 transition-transform duration-300 ease-in-out flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 12.586V6z" clipRule="evenodd" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/iniciar-sesion" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md hover:scale-105 transition-transform duration-300 ease-in-out flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Inicia sesión
                            </Link>
                            <Link href="/registro" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md hover:scale-105 transition-transform duration-300 ease-in-out flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Regístrate
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
