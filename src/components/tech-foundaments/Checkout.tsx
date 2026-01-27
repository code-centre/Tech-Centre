import React from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CheckoutProp {
  userName?: string;
  courseTitle: string;
  type?: string; 
  startDate?: string;
  email?: string;
}

export default function Checkout({
  userName,
  courseTitle,
  type = "curso",
  startDate,
  email,
}: CheckoutProp ) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-background backdrop-blur-sm">
      <div className="max-w-xl w-full mx-auto bg-bgCard rounded-2xl shadow-2xl border border-blue-100/20 p-10 flex flex-col items-center gap-8">
        <CheckCircle2 className="w-20 h-20 text-green-400 drop-shadow-lg" />
        <h1 className="text-3xl lg:text-4xl font-bold text-secondary text-center">
          ¡Compra exitosa!
        </h1>
        <p className="text-lg text-white text-center">
          {userName ? (
            <>
              <span className="font-semibold">{userName}</span>, tu inscripción al{" "}
              <span className="text-secondary font-semibold">{type}</span>{" "}
              <span className="font-semibold text-white">{courseTitle}</span> fue realizada con éxito.
            </>
          ) : (
            <>
              Tu inscripción al{" "}
              <span className="text-secondary font-semibold">{type}</span>{" "}
              <span className="font-semibold text-white">{courseTitle}</span> fue realizada con éxito.
            </>
          )}
        </p>
        {startDate && (
          <div className="bg-zinc-700/80 rounded-xl px-6 py-3 flex flex-col items-center">
            <span className="text-sm text-secondary font-semibold">Fecha de inicio</span>
            <span className="text-lg text-white font-bold">{startDate}</span>
          </div>
        )}
        {email && (
          <p className="text-sm text-zinc-300 text-center">
            Te hemos enviado un correo de confirmación a <span className="font-semibold text-white">{email}</span>
          </p>
        )}
        <div className="flex flex-col gap-3 w-full mt-4">
          <Link
            href="/"
            className="bg-secondary hover:bg-secondary/80 transition-colors text-white font-semibold rounded-lg py-3 w-full text-center"
          >
            Volver al inicio
          </Link>
          <Link
            href="/dashboard"
            className="bg-zinc-700 hover:bg-zinc-600 transition-colors text-white font-semibold rounded-lg py-3 w-full text-center"
          >
            Ir a mi panel de usuario
          </Link>
        </div>
      </div>
    </section>
  );
}