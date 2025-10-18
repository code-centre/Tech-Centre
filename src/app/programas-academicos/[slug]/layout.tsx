"use client";

import NavigationCard from "@/components/NavigationCard";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "../../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
        const programsQuery = query(collection(db, "programs"), where("slug", "==", slug));
        const programsSnapshot = await getDocs(programsQuery);

        if (!programsSnapshot.empty) {
          const courseDoc = programsSnapshot.docs[0];
          setCourseData({ id: courseDoc.id, ...courseDoc.data() });
          return;
        }
        
        const eventsQuery = query(
          collection(db, "events"),
          where("slug", "==", slug),
          where("type", "==", "curso especializado"),
          where("status", "in", ["published", "draft"])
        );
        const eventsSnapshot = await getDocs(eventsQuery);

        if (!eventsSnapshot.empty) {
          const eventDoc = eventsSnapshot.docs[0];
          const eventData = eventDoc.data();
          setCourseData({ id: eventDoc.id, ...eventData });

          if (eventData?.type === "curso especializado") {
            setIsShort(true);
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
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
    <div className="flex mx-auto px-4 h-fit">
      <main className="flex-1">
        {children}
      </main>
      {!isMobile && (
        <aside className="w-80 flex-shrink-0 mt-20">
          <div className="sticky top-24">
            <NavigationCard
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              courseData={{
                title: courseData?.title || courseData?.name,
                type: courseData?.type,
                slug: courseData?.slug,
                price: courseData?.price || (courseData?.tickets && courseData.tickets.length > 0 ? courseData.tickets[0].price : 0),
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