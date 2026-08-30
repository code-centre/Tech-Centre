"use client";

import { useState } from "react";
import type { Route } from "@/types/routes";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import StatsBar from "./components/StatsBar";
import SuccessRoutes from "./components/SuccessRoutes";
import CurriculumSection from "./components/CurriculumSection";
import MethodologySection from "./components/MethodologySection";
import IndustryDataSection from "./components/IndustryDataSection";
import SalaryTiers from "./components/SalaryTiers";
import InvestmentSection from "./components/InvestmentSection";
import FAQSection from "./components/FAQSection";
import VisionSection from "./components/VisionSection";
import FinalCTA from "./components/FinalCTA";
import EnrollmentModal from "./components/EnrollmentModal";
import CommunityGallery from "@/components/CommunityGallery";

interface AIEngineerLandingProps {
  route: Route;
}

export default function AIEngineerLanding({ route }: AIEngineerLandingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<"route" | "module">("route");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const openEnrollment = (type: "route" | "module", moduleName?: string) => {
    setEnrollmentType(type);
    setSelectedModule(moduleName ?? null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background mt-16">
      <HeroSection onEnroll={() => openEnrollment("route")} />
      <ProblemSection />
      <StatsBar />
      <SuccessRoutes />
      <CurriculumSection
        learningPoints={route.learning_points}
        onEnrollRoute={() => openEnrollment("route")}
        onEnrollModule={(name) => openEnrollment("module", name)}
      />
      <MethodologySection />
      <IndustryDataSection />
      <SalaryTiers />
      <InvestmentSection
        onEnrollRoute={() => openEnrollment("route")}
        onEnrollModule={(name) => openEnrollment("module", name)}
      />
      <FAQSection />
      <VisionSection />
      <CommunityGallery />
      <FinalCTA onEnroll={() => openEnrollment("route")} />

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedModule={selectedModule}
        routeName={route.name}
      />
    </div>
  );
}
