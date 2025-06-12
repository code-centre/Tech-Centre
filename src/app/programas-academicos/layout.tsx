"use client";

import NavigationCard from "@/components/NavigationCard";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ProgramasAcademicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [courseData, setCourseData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const pathname = usePathname();

  // Extraer el slug de la URL
  const slug = pathname.split('/').pop();

  useEffect(() => {
    if (!slug) return;

    async function fetchCourseData() {
      try {
        // Buscar en programs
        const programsQuery = query(collection(db, "programs"), where("slug", "==", slug));
        const programsSnapshot = await getDocs(programsQuery);

        if (!programsSnapshot.empty) {
          const courseDoc = programsSnapshot.docs[0];
          setCourseData({ id: courseDoc.id, ...courseDoc.data() });
          return;
        }

        // Buscar en events si no se encuentra en programs
        const eventsQuery = query(
          collection(db, "events"),
          where("slug", "==", slug),
          where("type", "==", "curso especializado"),
          where("status", "==", "published")
        );
        const eventsSnapshot = await getDocs(eventsQuery);

        if (!eventsSnapshot.empty) {
          const eventDoc = eventsSnapshot.docs[0];
          setCourseData({ id: eventDoc.id, ...eventDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    }

    fetchCourseData();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'modalidad', 'certificacion', 'programa', 'precios', 
        'fechas', 'salida', 'preguntas'
      ];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
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
    <div className="flex gap-8 max-w-7xl mx-auto px-4">
      <main className="flex-1">
        {children}
      </main>
      <aside className="w-80 flex-shrink-0 mt-20">
        <div className="sticky top-24">          <NavigationCard 
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            courseData={{
              price: courseData?.price || 0,
              discount: courseData?.discount,
              installments: 8,
              installmentPrice: courseData?.discount 
                ? Math.round(courseData.discount / 8) 
                : courseData?.price 
                  ? Math.round(courseData.price / 8) 
                  : undefined,
              currency: courseData?.currency || "COP",
              name: courseData?.name || courseData?.title
            }}
          />
        </div>
      </aside>
    </div>
  );
}