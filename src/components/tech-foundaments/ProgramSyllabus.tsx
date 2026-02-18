'use client'
import { ArrowDown } from 'lucide-react';
import React from 'react';
import { SyllabusData } from '@/types/programs';

interface Props {
  syllabusData: SyllabusData;
  programId?: number;
  onSyllabusUpdate?: (updatedSyllabus: SyllabusData) => void;
}

export default function ProgramSyllabus({ syllabusData }: Props) {
  const modules = syllabusData.modules || [];

  return (
    <section className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold card-text-primary">Temario</h2>
      </div>

      <div className="flex flex-col gap-6">
        {modules.map((module, i) => (
          <details key={module.id ?? `module-${i}`} className="group border-b border-gray-300 dark:border-gray-700 pb-4">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <h3 className="text-xl card-text-primary">
                {i + 1}. {module.title}
              </h3>
              <span className="group-open:rotate-180 transition-transform duration-300 card-text-primary">
                <ArrowDown />
              </span>
            </summary>

            <ul className="list-disc marker:text-secondary pl-6 mt-4 space-y-2">
              {module.topics.map((topic, j) => (
                <li key={j} className="card-text-muted">
                  {topic}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}