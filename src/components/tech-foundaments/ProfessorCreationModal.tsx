"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { db, storage } from "../../../firebase"
import { doc, setDoc, collection, Timestamp } from "firebase/firestore"
import { ref as storageRef, getDownloadURL } from "firebase/storage"
import { useUploadFile } from "react-firebase-hooks/storage"
import SpeakersPhotoUpload from "./ProfessorPhotoUpload"
import SpeakerSearch from "./ProfessorSearch"
import { useCollection } from "react-firebase-hooks/firestore"
import SpeakerForm from "./ProfessorForm"

interface Speaker {
  firstName: string
  lastName: string
  occupation: string
  origin: string
  speciality: string
  photoUrl: string
  bio?: string
  linkedin?: string
  id: string
}

interface Talk {
  title: string
  description: string
  hour: string
  place: string
  startHour: string;
  endHour: string;
  speakerId: string;
}

interface SpeakersCreationModalProps {
  eventId: string
  onClose: () => void
  onAddSpeaker: (newSpeaker: Speaker, newTalks: Talk[]) => Promise<void>
  editingSpeaker?: Speaker | null
}

export default function SpeakersCreationModal({ eventId, onClose, onAddSpeaker, editingSpeaker }: SpeakersCreationModalProps) {  const [firstName, setFirstName] = useState(editingSpeaker?.firstName || "")
  const [lastName, setLastName] = useState(editingSpeaker?.lastName || "")
  const [occupation, setOccupation] = useState(editingSpeaker?.occupation || "")
  const [origin, setOrigin] = useState(editingSpeaker?.origin || "")
  const [speciality, setSpeciality] = useState(editingSpeaker?.speciality || "")
  const [photoUrl, setPhotoUrl] = useState(editingSpeaker?.photoUrl || "")
  const [bio, setBio] = useState(editingSpeaker?.bio || "")
  const [linkedin, setLinkedin] = useState(editingSpeaker?.linkedin || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(editingSpeaker || null)
  const [isCreating, setIsCreating] = useState(!!editingSpeaker)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [checkin, setCheckin] = useState(false)
  const [uploadFile, loadingFile, errorFile] = useUploadFile()
  const [updatedSpeakerData, setUpdatedSpeakerData] = useState<Speaker | null>(null)
  
  const [speakersSnapshot] = useCollection(collection(db, `events/${eventId}/speakers`))
  useEffect(() => {
    if (selectedSpeaker) {
      setUpdatedSpeakerData({
        ...selectedSpeaker,
        firstName,
        lastName,
        occupation,
        origin,
        speciality,
        photoUrl,
        bio,
        linkedin
      });
    }
  }, [firstName, lastName, occupation, origin, speciality, photoUrl, bio, linkedin, selectedSpeaker]);
  
  // Si hay un speaker que estamos editando, inicializar los datos
  useEffect(() => {
    if (editingSpeaker) {
      setFirstName(editingSpeaker.firstName || '');
      setLastName(editingSpeaker.lastName || '');
      setOccupation(editingSpeaker.occupation || '');
      setOrigin(editingSpeaker.origin || '');
      setSpeciality(editingSpeaker.speciality || '');
      setPhotoUrl(editingSpeaker.photoUrl || '');
      setBio(editingSpeaker.bio || '');
      setLinkedin(editingSpeaker.linkedin || '');
      setSelectedSpeaker(editingSpeaker);
      setIsCreating(true);
    }
  }, [editingSpeaker]);

  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadPhoto = async (speakerId: string): Promise<string> => {
    if (!selectedFile) return ""

    const photoRef = storageRef(storage, `speakers/${speakerId}/photo_${Date.now()}`)
    const result = await uploadFile(photoRef, selectedFile, {
      contentType: selectedFile.type,
    })

    if (!result) throw new Error("Failed to upload photo")

    return await getDownloadURL(result.ref)
  }

  const handleSave = async () => {
    if (!firstName || !lastName) {
      setError("Nombre y apellido son requeridos")
      return
    }    setIsSubmitting(true)
    setError("")
    
    try {
      let speakerId: string
      let finalPhotoUrl = photoUrl
      
      if (!selectedSpeaker || editingSpeaker) {
        // Crear un nuevo speaker o editar uno existente por editingSpeaker
        if (!selectedSpeaker && !editingSpeaker) {
          // Nuevo speaker
          const speakerRef = doc(collection(db, "speakers"))
          speakerId = speakerRef.id

          if (selectedFile) {
            finalPhotoUrl = await uploadPhoto(speakerId)
          }

          const speaker: Speaker = {
            firstName,
            lastName,
            occupation,
            origin,
            speciality,
            photoUrl: finalPhotoUrl,
            bio,
            linkedin,
            id: speakerId,
          }

          await setDoc(speakerRef, speaker)

          const eventSpeakerRef = doc(collection(db, `events/${eventId}/speakers`), speakerId)
          await setDoc(eventSpeakerRef, {
            speakerId,
            talks: [],
            photoUrl: finalPhotoUrl,
          })

          const eventAtendeeRef = doc(collection(db, "eventAtendees"), speakerId)
          await setDoc(eventAtendeeRef, {
            eventId,
            userId: speakerId,
            nombre: firstName,
            apellido: lastName,
            rol: "SPEAKER",
            date: Timestamp.fromDate(new Date()),
            checkin,
            ticketId: "",
          })

          onAddSpeaker({ ...speaker }, [])
        } else {
          // Editar un speaker existente
          speakerId = (editingSpeaker?.id || selectedSpeaker?.id)!

          if (selectedFile) {
            finalPhotoUrl = await uploadPhoto(speakerId)
          }

          const speakerRef = doc(db, "speakers", speakerId)
          const updatedSpeakerData = {
            firstName,
            lastName,
            occupation,
            origin,
            speciality,
            bio,
            linkedin,
            photoUrl: selectedFile ? finalPhotoUrl : photoUrl,
          }

          await setDoc(speakerRef, updatedSpeakerData, { merge: true })

          // Actualizamos speaker con datos actualizados
          const completeSpeaker = {
            ...updatedSpeakerData,
            id: speakerId,
          }

          onAddSpeaker(completeSpeaker, [])
        }
      } else {
        // Seleccionar un speaker existente
        speakerId = selectedSpeaker.id!

        if (selectedFile) {
          finalPhotoUrl = await uploadPhoto(speakerId)
        }

        const speakerRef = doc(db, "speakers", speakerId)
        const updatedSpeakerData = {
          firstName,
          lastName,
          occupation,
          origin,
          speciality,
          bio,
          linkedin,
          photoUrl: selectedFile ? finalPhotoUrl : photoUrl,
        }

        await setDoc(speakerRef, updatedSpeakerData, { merge: true })

        const eventSpeakerRef = doc(collection(db, `events/${eventId}/speakers`), speakerId)
        await setDoc(eventSpeakerRef, {
          speakerId,
          talks: [],
          photoUrl: selectedSpeaker.photoUrl,
        })

        const eventAtendeeRef = doc(collection(db, "eventAtendees"), speakerId)
        await setDoc(eventAtendeeRef, {
          eventId,
          userId: speakerId,
          nombre: selectedSpeaker.firstName.toUpperCase(),
          apellido: selectedSpeaker.lastName.toUpperCase(),
          rol: "SPEAKER",
          date: Timestamp.fromDate(new Date()),
          checkin,
          ticketId: "",
        })

        // Pasar el speaker actualizado
        const completeSpeaker = {
          ...selectedSpeaker,
          ...updatedSpeakerData,
        }
        onAddSpeaker(completeSpeaker, [])
      }

      onClose()
    } catch (error) {
      console.error("Error al procesar el speaker:", error)
      setError("Hubo un error al procesar el speaker.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectSpeaker = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setFirstName(speaker.firstName);
    setLastName(speaker.lastName);
    setOccupation(speaker.occupation);
    setOrigin(speaker.origin);
    setSpeciality(speaker.speciality);
    setPhotoUrl(speaker.photoUrl);
    setIsCreating(true);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col border border-zinc-800/30 relative">
        {/* Efectos decorativos */}
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blueApp/5 blur-3xl"></div>
        <div className="absolute -left-10 bottom-10 w-24 h-24 rounded-full bg-blueApp/10 blur-2xl"></div>
        
        {/* Overlay de carga */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center z-10 border border-zinc-800/50 rounded-xl">
            <div className="text-center">
              <Loader2 className="animate-spin h-10 w-10 text-blueApp mx-auto mb-4" />
              <p className="text-blueApp font-medium">
                {editingSpeaker ? "Actualizando profesor..." : "Guardando profesor..."}
              </p>
            </div>
          </div>
        )}
      
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {editingSpeaker ? "Editar Profesor" : isCreating ? "Crear Profesor" : "Agregar Profesor Existente"}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {editingSpeaker ? "Modifica los datos del profesor" : isCreating ? "Completa los datos del nuevo profesor" : "Busca y selecciona un profesor existente"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start">
            <div className="p-1 bg-red-500/20 rounded-full mr-3 mt-0.5">
              <X className="w-3 h-3" />
            </div>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar">
          {!isCreating ? (
            <>
              <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                  Buscar profesor existente
                </h3>
                <SpeakerSearch onSelectSpeaker={handleSelectSpeaker} />
              </div>
              
              <div className="text-center pt-4">
                <span className="px-4 py-1 bg-zinc-800/60 text-zinc-400 text-xs rounded-full">O</span>
              </div>
              
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-3 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 flex items-center justify-center font-medium"
              >
                <span className="mr-2">+</span> Crear nuevo profesor
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-5 md:col-span-2">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <label className="flex items-center text-sm font-medium text-white mb-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="flex items-center text-sm font-medium text-white mb-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                      Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="md:row-span-2">
                <label className="flex items-center text-sm font-medium text-white mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                  Foto
                </label>
                <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/30 p-4">
                  <SpeakersPhotoUpload onFileChange={handleFileChange} previewUrl={photoUrl} />
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="flex items-center text-sm font-medium text-white mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                    Ocupación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ingeniero de Software"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-white mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                    Origen
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Barranquilla, Colombia"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-white mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                  Especialidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: Desarrollo web, Inteligencia Artificial"
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-white mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                  Biografía
                </label>
                <textarea
                  placeholder="Escribe una breve biografía del profesor..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors min-h-[120px] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800/50 p-6 shrink-0">
          <div className="flex justify-between items-center">
            {isCreating ? (
              <>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-zinc-800 border border-zinc-700/30 text-zinc-300 hover:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Guardando..." : editingSpeaker ? "Actualizar Profesor" : "Guardar Profesor"}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="ml-auto px-5 py-2.5 bg-zinc-800 border border-zinc-700/30 text-zinc-300 hover:text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


