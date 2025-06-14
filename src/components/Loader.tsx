import React from 'react';
import Image from "next/image";

export default function Loader() {
  
  const logoUrl = '/tech-center-logos/Logo-horizontal-blanco.png';

  const spinnerColor = '#00a1f9';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url('/loader-image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay para mejorar la visibilidad del logo y spinner */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Contenedor del loader */}
      <div className="relative w-50 h-50 flex items-center justify-center z-10">
        {/* Spinner */}
        <div
          className="absolute w-50 h-50 border-4 rounded-full animate-spin"
          style={{
            borderColor: `${spinnerColor} transparent transparent transparent`,
            animationDuration: '1.2s',
          }}
        />

        {/* Logo */}
        <div className="absolute animate-pulse">
          <Image
            src={logoUrl}
            alt="Loading"
            width={600}
            height={600}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}