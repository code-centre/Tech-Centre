"use client";

import { useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import SignUp from "@/app/registro/sign-up";
import LoginEventForm from "./LoginEventForm";
import ModalPortal from "./ModalPortal";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin?: () => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  
  if (!isOpen) return null;
    return (    
    <ModalPortal>
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
        <div className="fixed inset-0 bg-black opacity-20 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-6xl h-[90vh] bg-zinc-900 rounded-2xl shadow-lg overflow-hidden">
          {/* Contenedor principal */}
          <div className="flex items-center h-full relative">
            {/* Formulario Login */}
            <div className="w-full items-center lg:w-1/2 transition-all duration-500 ease-in-out">
              <div
                className={`h-full overflow-y-auto px-8 py-6 transition-opacity duration-500 ${
                  isLogin ? "opacity-100" : "lg:opacity-0"
                }`}
              >
                <div className="lg:hidden absolute top-4 right-4 cursor-pointer" onClick={onClose}>
                  <XIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-center text-blueApp">¡Bienvenido de nuevo!</h2>
                <p className="text-white mb-8 leading-relaxed text-center">
                  Inicia sesión con tu cuenta para proceder al pago
                </p>
                <LoginEventForm onClose={onClose} onLogin={onLogin || (() => {})} />

                {/* Link para móviles */}
                <div className="mt-6 text-center lg:hidden">
                  <p className="text-gray-600 mb-2">¿No tienes una cuenta?</p>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-500 hover:text-blue-700 font-semibold"
                  >
                    Regístrate aquí
                  </button>
                </div>
              </div>
            </div>

            {/* Formulario Registro - Solo visible en desktop */}
            <div className="hidden lg:block w-1/2 transition-all duration-500 ease-in-out h-full">
              <div
                className={`h-full overflow-y-auto px-8 py-6 transition-opacity duration-500 ${
                  !isLogin ? "opacity-100" : "opacity-0"
                }`}
              >
                <h2 className="text-4xl font-semibold mb-6 text-center text-blueApp">¡Registrate aquí!</h2>
                <p className="text-white mb-8 leading-relaxed text-center">
                  Sé bienvenido a la revolución tech del caribe
                </p>
                <div className="pb-6">
                  <SignUp />
                </div>
              </div>
            </div>

            {/* Panel azul deslizante - Solo visible en desktop */}
            <div
              className={`hidden lg:block absolute top-0 w-1/2 h-full text-white transition-transform duration-700 ease-in-out ${
              isLogin ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="relative w-full h-full">
              <Image 
                src="/auth-image.png" 
                alt="Authentication background"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 backdrop-blur-sm"></div>
              </div>
              <div className="absolute top-4 right-4 cursor-pointer" onClick={onClose}>
                <XIcon className="w-6 h-6 text-white hover:text-red-500 transition-all duration-200" />
              </div>

              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                <Image
                  src="/tech-center-logos/Logo-horizontal-blanco.png"
                  alt="Logo"
                  width={500}
                  height={300}
                  className="mb-4 w-full object-contain"
                />
              </div>

              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-full px-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {isLogin ? "¿Nuevo aquí?" : "¿Ya tienes cuenta?"}
                </h2>
                <p className="mb-8">
                  {isLogin
                    ? "Regístrate y descubre todo lo que tenemos para ti en esta nueva revolución tech"
                    : "Inicia sesión para continuar"}
                </p>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="border-2 border-white text-white rounded-lg px-8 py-3 hover:bg-white hover:text-blueApp transition-colors"
                >
                  {isLogin ? "Registrarse" : "Iniciar Sesión"}
                </button>
              </div>
            </div>          
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AuthModal;