"use client";

import NavigationCard from "@/components/NavigationCard";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
// import { db } from "../../../../firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";
import { supabase } from "@/lib/supabase";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [courseData, setCourseData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isShort, setIsShort] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const pathname = usePathname();

  const slug = pathname.split('/').pop();

  useEffect(() => {
  if (!slug) return;

  async function fetchCourseData() {
    try {
      // Primero buscamos en la tabla 'programs'
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .eq('code', slug)
        .single();

      if (programsData && !programsError) {
        console.log("Datos del programa:", programsData);
        setCourseData({ id: programsData.id, ...programsData });
        return;
      }
    } catch (error) {
      console.error("Error al obtener los datos del curso:", error);
    }
  }

  fetchCourseData();
}, [slug]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'aprenderas', 'para-quien', 'programa', 'precios',
        'beneficios', 'preguntas'
      ];

      let currentSection = '';
      let closestDistance = Infinity;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - 100);

          if (rect.top <= 200 && rect.bottom >= 0) {
            if (distance < closestDistance) {
              closestDistance = distance;
              currentSection = section;
            }
          }
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  return (
    <div className="flex gap-4 ">
      <main className="flex-1">
        {children}
      </main>
      {!isMobile && (
        <aside className="w-80 flex-shrink-0 mt-5">
          <div className="sticky top-24">
            <NavigationCard
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              courseData={{
                title: courseData?.name,
                type: courseData?.kind,
                slug: courseData?.code,
                price: courseData?.default_price,
                discount: courseData?.discount,
                installments: isShort ? 2 : 8,
                installmentPrice: courseData?.discount
                  ? Math.round(courseData.discount / (isShort ? 2 : 8))
                  : courseData?.price
                    ? Math.round(courseData.price / (isShort ? 2 : 8))
                    : undefined,
                currency: courseData?.currency || "COP",
                name: courseData?.name || courseData?.title
              }}
            />
          </div>
        </aside>
      )}
    </div>
  );
}