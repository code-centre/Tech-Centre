"use client";

import { useState } from "react";
import type { Career } from "@/types/careers";
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

interface AIEngineerLandingProps {
  career: Career;
}

export default function AIEngineerLanding({ career }: AIEngineerLandingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<"career" | "module">("career");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const openEnrollment = (type: "career" | "module", moduleName?: string) => {
    setEnrollmentType(type);
    setSelectedModule(moduleName ?? null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background mt-16">
      <HeroSection onEnroll={() => openEnrollment("career")} />
      <ProblemSection />
      <StatsBar />
      <SuccessRoutes />
      <CurriculumSection
        learningPoints={career.learning_points}
        onEnrollCareer={() => openEnrollment("career")}
        onEnrollModule={(name) => openEnrollment("module", name)}
      />
      <MethodologySection />
      <IndustryDataSection />
      <SalaryTiers />
      <InvestmentSection
        onEnrollCareer={() => openEnrollment("career")}
        onEnrollModule={(name) => openEnrollment("module", name)}
      />
      <FAQSection />
      <VisionSection />
      <FinalCTA onEnroll={() => openEnrollment("career")} />

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedModule={selectedModule}
        careerName={career.name}
      />
    </div>
  );
}
