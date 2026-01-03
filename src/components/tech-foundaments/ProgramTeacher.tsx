'use client'

import { useState, useEffect } from "react";
import { GraduationCap, UserPlus, Pencil, Code as CodeIcon, Loader2, Linkedin, Twitter, Instagram, Github } from "lucide-react";
import { useUser } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import InstructorAssignmentModal from "./InstructorAssignmentModal";
import Image from "next/image";

interface Instructor {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
  professional_title?: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  github_url?: string;
}

interface Props {
  cohortId: number;
}

export function ProgramTeacher({ cohortId }: Props) {
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useUser()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (cohortId) {
      fetchInstructor()
    }
  }, [cohortId])

  const fetchInstructor = async () => {
    if (!cohortId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cohort_instructors')
        .select(`
          instructor_id,
          profiles:instructor_id (
            user_id,
            first_name,
            last_name,
            email,
            profile_image,
            professional_title,
            bio,
            linkedin_url,
            twitter_url,
            instagram_url,
            github_url
          )
        `)
        .eq('cohort_id', cohortId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching instructor:', error)
        return
      }

      if (data?.profiles) {
        // profiles puede ser un objeto o un array, normalizamos
        const profileData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
        if (profileData) {
          setInstructor({
            user_id: profileData.user_id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            profile_image: profileData.profile_image,
            professional_title: profileData.professional_title,
            bio: profileData.bio,
            linkedin_url: profileData.linkedin_url,
            twitter_url: profileData.twitter_url,
            instagram_url: profileData.instagram_url,
            github_url: profileData.github_url
          })
        } else {
          setInstructor(null)
        }
      } else {
        setInstructor(null)
      }
    } catch (error) {
      console.error('Error fetching instructor:', error)
      setInstructor(null)
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    fetchInstructor() // Recargar instructor después de asignar/eliminar
  };

  return (
    <>
      <section className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blueApp/10 rounded-lg">
              <GraduationCap className="text-blueApp" size={24} />
            </div>
            Profesor del Programa
          </h2>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-blueApp/50 transition-all duration-200 flex items-center gap-2"
              aria-label="Asignar profesor"
            >
              {instructor ? (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Editar</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Asignar Profesor</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blueApp" />
              <p className="text-gray-400 text-sm">Cargando información del profesor...</p>
            </div>
          </div>
        ) : instructor ? (
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
            {/* Profile Header */}
            <div className="relative bg-gradient-to-r from-blueApp/20 via-zinc-800 to-zinc-800 px-6 pt-8 pb-20">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-xl ring-4 ring-blueApp/20">
                    <Image
                      width={160}
                      height={160}
                      src={instructor.profile_image || '/man-avatar.png'}
                      alt={`${instructor.first_name} ${instructor.last_name}`}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="absolute -bottom-2 -right-2 p-2 bg-blueApp hover:bg-blue-600 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      aria-label="Editar profesor"
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>

                {/* Name and Title */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {instructor.first_name} {instructor.last_name}
                  </h3>
                  {instructor.professional_title && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-blueApp">
                      <GraduationCap className="w-5 h-5" />
                      <p className="text-lg font-medium">{instructor.professional_title}</p>
                    </div>
                  )}
                  {instructor.email && (
                    <p className="text-gray-400 text-sm mt-2">{instructor.email}</p>
                  )}
                  
                  {/* Social Media Links */}
                  {(instructor.linkedin_url || instructor.twitter_url || instructor.instagram_url || instructor.github_url) && (
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
                      {instructor.linkedin_url && (
                        <a
                          href={instructor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {instructor.twitter_url && (
                        <a
                          href={instructor.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50"
                          aria-label="Twitter"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {instructor.instagram_url && (
                        <a
                          href={instructor.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 p-2 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-all duration-200 border border-pink-500/30 hover:border-pink-500/50"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {instructor.github_url && (
                        <a
                          href={instructor.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700/20 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50"
                          aria-label="GitHub"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-6 space-y-4">
              {/* Bio */}
              {instructor.bio && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/30">
                  <div className="flex items-start gap-3">
                    <CodeIcon className="w-5 h-5 text-blueApp mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Sobre el profesor</h4>
                      <p className="text-gray-300 leading-relaxed">{instructor.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-700/50 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                <GraduationCap className="h-12 w-12 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay profesor asignado
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Este programa aún no tiene un profesor asignado. Los estudiantes podrán conocer a su instructor una vez que se asigne.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-blueApp hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-blueApp/20"
                >
                  <UserPlus className="w-5 h-5" />
                  Asignar Profesor
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {isModalOpen && (
        <InstructorAssignmentModal
          cohortId={cohortId}
          currentInstructor={instructor}
          onClose={handleModalClose}
        />
      )}
    </>
  )
}
