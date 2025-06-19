"use client"
import { ClockIcon, Calendar, MapPin, Plus, Edit2, X, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import ContainerButtonsEdit from "../course/ContainerButtonsEdit"
import useUserStore from "../../../store/useUserStore"
interface ScheduleItem {
    day: string
    time: string
    modality: string
}

interface Props {
    data: EventFCA | Program | any
    saveChanges?: (propertyName: string, newValues: any, index?: number) => void
}

export default function ScheduleSection({ data, saveChanges }: Props) {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([])
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const { user } = useUserStore()
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItem>({
        day: "",
        time: "",
        modality: "",
    })

    useEffect(() => {
        if (data) {
            const scheduleData = data.schedules
                ? (Array.isArray(data.schedules) ? data.schedules : [data.schedules])
                : [];
            setSchedules(scheduleData.filter((s: ScheduleItem) => s && (s.day || s.time || s.modality)));
        } else {
            setSchedules([]);
        }
    }, [data])

    const addSchedule = () => {
        const newSchedule: ScheduleItem = {
            day: "",
            time: "",
            modality: "",
        }
        const updatedSchedules = [...schedules, newSchedule]
        setSchedules(updatedSchedules)
        setEditingIndex(updatedSchedules.length - 1)
        setEditingSchedule(newSchedule)
    }

    const startEditing = (index: number) => {
        setEditingIndex(index)
        setEditingSchedule({ ...schedules[index] })
    }

    const cancelEditing = () => {
        setEditingIndex(null)
        setEditingSchedule({ day: "", time: "", modality: "" })
    }

    const saveSchedule = () => {
        if (editingIndex !== null) {
            const updatedSchedules = [...schedules]
            updatedSchedules[editingIndex] = editingSchedule
            setSchedules(updatedSchedules)

            if (saveChanges) {
                saveChanges("schedules", updatedSchedules)
            }

            setEditingIndex(null)
            setEditingSchedule({ day: "", time: "", modality: "" })
        }
    }

    const deleteSchedule = (index: number) => {
        const updatedSchedules = schedules.filter((_, i) => i !== index)
        setSchedules(updatedSchedules)

        if (saveChanges) {
            saveChanges("schedules", updatedSchedules)
        }
    }

    return (
        <section className="w-full py-16 bg-[var(--background)] text-white">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-bold mb-4">Horarios disponibles</h2>
                    <div className="w-24 h-1 bg-[var(--color-blueApp)] mx-auto"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mx-auto">
                    {schedules && schedules.length > 0 ? (
                        schedules.map((schedule, index) => (
                            <div key={index} className="relative w-full min-w-[320px]">
                                {editingIndex === index ? (
                                    <div className="bg-gray-50/10 p-6 rounded-lg border border-gray-700">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Día</label>
                                                <input
                                                    className="w-full px-4 py-3 font-medium text-gray-800 bg-white border border-gray-300 rounded-lg
                                  focus:outline-none focus:ring-2 focus:ring-[var(--color-blueApp)]/20 focus:border-[var(--color-blueApp)]
                                  transition-all duration-200"
                                                    type="text"
                                                    placeholder="Ej: Lunes a Jueves"
                                                    value={editingSchedule.day}
                                                    onChange={(e) => setEditingSchedule((prev) => ({ ...prev, day: e.target.value }))}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Horario</label>
                                                <input
                                                    className="w-full px-4 py-3 font-medium text-gray-800 bg-white border border-gray-300 rounded-lg
                                  focus:outline-none focus:ring-2 focus:ring-[var(--color-blueApp)]/20 focus:border-[var(--color-blueApp)]
                                  transition-all duration-200"
                                                    type="text"
                                                    placeholder="Ej: 7:00 pm a 9:00 pm"
                                                    value={editingSchedule.time}
                                                    onChange={(e) => setEditingSchedule((prev) => ({ ...prev, time: e.target.value }))}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Modalidad</label>
                                                <input
                                                    className="w-full px-4 py-3 font-medium text-gray-800 bg-white border border-gray-300 rounded-lg
                                  focus:outline-none focus:ring-2 focus:ring-[var(--color-blueApp)]/20 focus:border-[var(--color-blueApp)]
                                  transition-all duration-200"
                                                    type="text"
                                                    placeholder="Ej: Semanal, Presencial, Virtual"
                                                    value={editingSchedule.modality}
                                                    onChange={(e) => setEditingSchedule((prev) => ({ ...prev, modality: e.target.value }))}
                                                />
                                            </div>
                                            <ContainerButtonsEdit setFinishEdit={cancelEditing} onSave={saveSchedule} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--background-card)] rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-700 relative group">
                                        {user?.rol === 'admin' && (
                                            <>
                                                <div className="absolute top-2 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => startEditing(index)}
                                                        className="p-2 rounded-full bg-[var(--color-blueApp)]/10 hover:bg-[var(--color-blueApp)]/20 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-[var(--color-blueApp)]" />
                                                    </button>
                                                </div>
                                                <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => deleteSchedule(index)}
                                                        className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="p-3 rounded-full bg-[var(--color-blueApp)]/10">
                                                <Calendar className="w-6 h-6 text-[var(--color-blueApp)]" />
                                            </div>
                                            <h3 className="text-2xl font-semibold">{schedule.day || "Horario"}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <ClockIcon className="w-5 h-5 text-[var(--color-blueApp)] mt-0.5" />
                                                <span className="font-medium">{schedule.time || "Horario no especificado"}</span>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-[var(--color-blueApp)] mt-0.5" />
                                                <span className="text-gray-300">{schedule.modality || "Modalidad no especificada"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-8">
                            <p className="text-gray-400">No hay horarios disponibles en este momento</p>
                        </div>
                    )}
                </div>
                {schedules && schedules.length === 0 && user?.rol === 'admin' && (
                    <div className="flex justify-center mt-4">
                        <p className="text-gray-400">Presiona "Agregar Horario" para crear uno nuevo</p>
                    </div>
                )}
            </div>
            {user?.rol === 'admin' && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={addSchedule}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-blueApp)] text-white rounded-lg hover:bg-[var(--color-blueApp)]/80 transition-colors duration-200 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar Horario
                    </button>
                </div>
            )}
        </section>
    )
}
