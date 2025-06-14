"use client";
import { formatPrice } from "../../utils/formatCurrency";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Book, Calendar, Users, CreditCard, HelpCircle, Star } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: "aprenderas", label: "¿Qué aprenderé?", icon: <Book className="w-4 h-4 mr-2" /> },
  { id: "para-quien", label: "¿A quién va dirigido?", icon: <Users className="w-4 h-4 mr-2" /> },
  // { id: "certificacion", label: "Certificación Oficial" },
  { id: "programa", label: "Programa", icon: <Calendar className="w-4 h-4 mr-2" /> },
  { id: "precios", label: "Precios y medios de pago", icon: <CreditCard className="w-4 h-4 mr-2" /> },
  { id: "beneficios", label: "Beneficios", icon: <Star className="w-4 h-4 mr-2" /> },
  // { id: "salida", label: "Salida laboral y testimonios" },
  { id: "preguntas", label: "Preguntas Frecuentes", icon: <HelpCircle className="w-4 h-4 mr-2" /> },
];

interface NavigationCardProps {
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  courseData?: {
    title: string;
    type?: string;
    price?: number;
    installments?: number;
    installmentPrice?: number;
    currency?: string;
    discount?: number;
    name?: string;
  };
}

export default function NavigationCard({
  activeSection,
  onSectionClick,
  courseData
}: NavigationCardProps) {

  const [isMobile, setIsMobile] = useState(false);
  const [isShort, setIsShort] = useState(false);

  useEffect(() => {
    if (courseData?.type === "curso especializado") {
      setIsShort(true);
    }
  }, [courseData]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    if (onSectionClick) {
      onSectionClick(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  console.log(courseData?.type);

  if (isMobile) return null;
  return (
    <div className="sticky top-4 rounded-2xl shadow-lg overflow-hidden max-w-sm w-full">
      {/* Background image covering the entire card */}
      <Image
        src="/SmokeBg.webp"
        alt="Background"
        fill
        className="object-cover"
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/80 to-purple-900/80"></div>

      <div className="relative p-6 text-white overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-4 tracking-wide">MENÚ</h3>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-between group hover:bg-white/10 ${activeSection === item.id
                  ? 'bg-white/20 text-white shadow-md cursor-pointer'
                  : 'text-white/90 hover:text-white'
                  }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-all duration-200 ${activeSection === item.id
                    ? 'text-white transform rotate-90'
                    : 'text-white/70 group-hover:text-white group-hover:translate-x-1'
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            {isShort ? (
              <span className="font-semibold">
                ESTE CURSO ESPECIALIZADO
              </span>
            ) : (
              <span className="font-semibold">
                ESTE DIPLOMADO
              </span>
            )}
          </div>          {
            courseData?.discount ? (
              <div className="text-3xl font-bold text-white mb-2 flex flex-col items-center justify-center">
                <span>¡Precio en oferta!</span>
                {formatPrice(courseData?.discount || 0)}
              </div>
            ) : (
              <div className="text-3xl font-bold text-white mb-2 flex flex-col items-center justify-center">
                <span>Precio</span>
                {formatPrice(courseData?.price || 0, courseData?.currency || "COP")}
              </div>
            )}
          {isShort ? (
            <div className="text-sm text-white/80 mb-4">
              {courseData?.installments && courseData?.installmentPrice
                ? `Hasta ${courseData.installments} cuotas de ${formatPrice(courseData.installmentPrice, courseData.currency)}`
                : courseData?.discount
                  ? `Hasta 2 cuotas de ${formatPrice(Math.round((courseData.discount) / 2), courseData?.currency || "COP")}`
                  : `Hasta 2 cuotas de ${formatPrice(Math.round((courseData?.price || 0) / 2), courseData?.currency || "COP")}`
              }
            </div>
          ) : (
            <div className="text-sm text-white/80 mb-4">
              {courseData?.installments && courseData?.installmentPrice
                ? `Hasta ${courseData.installments} cuotas de ${formatPrice(courseData.installmentPrice, courseData.currency)}`
                : courseData?.discount
                  ? `Hasta ${isShort ? 2 : 8} cuotas de ${formatPrice(Math.round((courseData.discount) / (isShort ? 2 : 8)), courseData?.currency || "COP")}`
                  : `Hasta ${isShort ? 2 : 8} cuotas de ${formatPrice(Math.round((courseData?.price || 0) / (isShort ? 2 : 8)), courseData?.currency || "COP")}`
              }
            </div>)}

          <button className="text-sm text-blue-200 mb-6 cursor-pointer hover:text-white transition-colors font-medium">
            Ver medios de pago →
          </button>
          <button className="w-full bg-white text-blueApp py-4 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
            {isShort ? (
              <span>Comprar curso especializado</span>
            ) : (
              <span>Comprar diplomado</span>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}