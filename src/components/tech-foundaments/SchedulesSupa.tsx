"use client"
import { Clock as ClockIcon, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import useUserStore from "../../../store/useUserStore"

interface ScheduleData {
  clases: {
    dias: string[];
    horas: string[];
  };
}

interface Props {
  data: ScheduleData;
}

export default function ScheduleSupa({ data }: Props) {
  const [schedules, setSchedules] = useState<{dias: string, horas: string}[]>([]);
  const { user } = useUserStore();

  // Mostrar los datos de entrada
  console.log('Datos de entrada:', data);

  // Actualizar el estado cuando cambia la prop data
  useEffect(() => {
    console.log('useEffect se ejecutó con data:', data);
    
    if (data?.clases) {
      console.log('clases existe:', data.clases);
      console.log('dias:', data.clases.dias);
      console.log('horas:', data.clases.horas);
      
      // Asegurarnos de que ambos arrays existen
      if (Array.isArray(data.clases.dias) && Array.isArray(data.clases.horas)) {
        // Combinar los arrays de días y horas
        const combinedSchedules = data.clases.dias.map((dia, index) => ({
          dias: dia,
          horas: data.clases.horas[index] || ""
        }));
        
        console.log('Horarios combinados:', combinedSchedules);
        setSchedules(combinedSchedules);
      }
    } else {
      console.log('No hay data.clases o no es válida');
    }
  }, [data]);

  // Mostrar el estado actual
  console.log('Estado actual de schedules:', schedules);

  if (!data?.clases) {
    console.log('No hay data.clases, mostrando mensaje de no disponible');
    return (
      <section className="w-full py-16 bg-[var(--background)] text-white">
        <div className="container mx-auto px-4 text-center">
          <p>No hay horarios disponibles</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-[var(--background)] text-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold mb-4">Horarios disponibles</h2>
          <div className="w-24 h-1 bg-[var(--color-blueApp)] mx-auto"></div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mx-auto">
          {schedules.length > 0 ? (
            schedules.map((schedule, index) => {
              console.log(`Renderizando horario ${index}:`, schedule);
              return (
                <div key={index} className="relative w-full min-w-[320px]">
                  <div className="bg-[var(--background-card)] rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-700">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-3 rounded-full bg-[var(--color-blueApp)]/10">
                        <Calendar className="w-6 h-6 text-[var(--color-blueApp)]" />
                      </div>
                      <h3 className="text-2xl font-semibold">
                        {schedule.dias || "Día no especificado"}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 ml-4">
                        <ClockIcon className="w-5 h-5 text-[var(--color-blueApp)] mt-0.5" />
                        <span className="font-medium">
                          {schedule.horas || "Horario no especificado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-400">No hay horarios disponibles en este momento (schedules vacío)</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}