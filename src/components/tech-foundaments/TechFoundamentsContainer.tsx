'use client'
import React from 'react'
import { Hero } from './Hero'
import { useState, useEffect } from 'react'
import { Description } from './Description'
import { Tickets } from './Tickets'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../../firebase'
import { where, collection, query, getDocs, doc, updateDoc } from 'firebase/firestore'
import LocationContainer from './LocationContainer'
import Details from './Details'
import Benefits from './Benefits'
import FAQs from './FAQs'
import Syllabus from './Syllabus'
import { ProfessorContainer } from './ProfessorContainer'

interface Ticket {
  type: string
  title: string
  ticketName: string
  name: string
  price: number
  benefits: string[]
  description: string
}

interface FAQItem {
  question: string
  answer: string
  id: string
}

interface SyllabusModule {
  id: string
  title: string
  content: string
}

interface EventFCA {
  id: string
  title: string
  subtitle: string
  description: string
  date: string | number | Date
  heroImage: string
  location?: any
  tickets: Ticket[]
  details?: string
  benefits?: string
  faqs?: FAQItem[]
  syllabus?: SyllabusModule[]
  [key: string]: any
}

interface Props {
  slug: string
}

export default function TechFoundamentsContainer({ slug }: Props) {
  const [techs, setTechs] = useState<EventFCA[]>([])
  const [teacher, setTeacher] = useState<any[]>([])
  const [profesorData, setProfesorData] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const eventsQuery = query(collection(db, "events"),
    where("type", "==", "curso especializado"),
    where("status", "in", ["published", "draft"]),
    where("slug", "==", slug))
  const [value, loading, error] = useCollection(eventsQuery)
    useEffect(() => {
    if (value) {
      const data = value.docs.map((doc) => {
        const docData = doc.data();
        const tickets = (docData.tickets || []).map((ticket: any) => ({
          name: ticket.name ?? ticket.title ?? '',
          title: ticket.title ?? '',
          ticketName: ticket.ticketName ?? ticket.name ?? ticket.title ?? '',
          price: ticket.price ?? 0,
          benefits: ticket.benefits ?? [],
          type: ticket.type ?? 'general',
          description: ticket.description ?? '',
        }))
        
        return {
          ...docData,
          id: doc.id,
          tickets,
        }
      }) as EventFCA[]
      setTechs(data)
    }
  }, [value, slug])

  useEffect(() => {
    if (techs.length > 0) {
      const fetchSpeakers = async () => {
        const speakersRef = collection(db, "events", techs[0].id, "speakers")
        const speakersSnap = await getDocs(speakersRef)
        const speakersData = speakersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTeacher(speakersData)
      }
      fetchSpeakers()
    }
  }, [techs])

  // Nuevo useEffect para buscar los datos completos de los speakers
  useEffect(() => {
    const fetchSpeakerDetails = async () => {
      if (teacher.length > 0) {
        // Buscar todos los speakers cuyo id esté en teacher[].speakerId
        const speakerIds = teacher.map(t => t.speakerId).filter(Boolean)
        if (speakerIds.length === 0) return setProfesorData([])
        // Firestore permite hasta 10 elementos en 'in'
        const chunks = []
        for (let i = 0; i < speakerIds.length; i += 10) {
          chunks.push(speakerIds.slice(i, i + 10))
        }
        let allSpeakers: any[] = []
        for (const chunk of chunks) {
          const q = query(collection(db, "speakers"), where("id", "in", chunk))
          const snap = await getDocs(q)
          allSpeakers = allSpeakers.concat(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        }
        setProfesorData(allSpeakers)
      } else {
        setProfesorData([])
      }
    }
    fetchSpeakerDetails()
  }, [teacher])


  const saveEventData = async (propertyName: string, content: any): Promise<{success: boolean, error?: string}> => {
    if (!techs[0]?.id) {
      console.error("No se puede guardar sin un ID de evento")
      return { success: false, error: "ID de evento faltante" }
    }
    
    try {
      setIsSaving(true)
      const eventDocRef = doc(db, "events", techs[0].id)
      
      const updateData: { [key: string]: any } = {
        [propertyName]: content,
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(eventDocRef, updateData)
      setTechs(prev => prev.map(tech => {
        if (tech.id === techs[0].id) {
          return { ...tech, [propertyName]: content }
        }
        return tech
      }))
      
      return { success: true }
    } catch (error) {
      console.error(`Error al actualizar ${propertyName}:`, error)
      return { success: false, error: `Ocurrió un error al guardar los cambios en ${propertyName}` }
    } finally {
      setIsSaving(false)
    }
  }
  
  const saveLocationData = async (locationData: any): Promise<{success: boolean, error?: string}> => {
    if (!techs[0]?.id) {
      console.error("No se puede guardar la ubicación sin un ID de evento")
      return { success: false, error: "ID de evento faltante" }
    }
    
    try {
      setIsSaving(true)
      const eventDocRef = doc(db, "events", techs[0].id)
      
      await updateDoc(eventDocRef, {
        location: locationData,
        updatedAt: new Date().toISOString()
      })
      
      setTechs(prev => prev.map(tech => {
        if (tech.id === techs[0].id) {
          return { ...tech, location: locationData }
        }
        return tech
      }))
      
      return { success: true }
    } catch (error) {
      console.error("Error al actualizar la ubicación:", error)
      return { success: false, error: "Ocurrió un error al guardar la ubicación" }
    } finally {
      setIsSaving(false)
    }
  }

  // Función específica para guardar los profesores
  const saveSpeakersData = async (speakers: any[]): Promise<{success: boolean, error?: string}> => {
    if (!techs[0]?.id) {
      console.error("No se puede guardar los profesores sin un ID de evento")
      return { success: false, error: "ID de evento faltante" }
    }
    
    try {
      setIsSaving(true)
      
      // Actualizar el estado local con los nuevos profesores
      // Esta es solo una actualización visual, los datos de los profesores 
      // se manejan en la colección de speakers y en events/${eventId}/speakers
      setProfesorData(speakers)
      
      return { success: true }
    } catch (error) {
      console.error("Error al actualizar los profesores:", error)
      return { success: false, error: "Ocurrió un error al guardar los profesores" }
    } finally {
      setIsSaving(false)
    }
  }

  // Función para guardar y actualizar los datos de un ticket
  const saveTicketData = async (
    updatedTicket: Ticket, 
    oldTicket?: Ticket
  ): Promise<{success: boolean, error?: string}> => {
    if (!techs[0]?.id) {
      console.error("No se puede guardar el ticket sin un ID de evento")
      return { success: false, error: "ID de evento faltante" }
    }
    
    try {
      setIsSaving(true)
      const eventDocRef = doc(db, "events", techs[0].id)
      
      // Obtener la lista actual de tickets
      const currentTickets = [...(techs[0].tickets || [])]
      let updatedTickets = [...currentTickets]
      
      // Si se proporciona un ticket antiguo, reemplazarlo; de lo contrario, añadir el nuevo
      if (oldTicket) {
        // Encontrar el índice del ticket a actualizar
        const ticketIndex = currentTickets.findIndex(
          t => t.title === oldTicket.title && 
               t.description === oldTicket.description && 
               t.price === oldTicket.price
        )
        
        if (ticketIndex >= 0) {
          // Reemplazar el ticket existente
          updatedTickets[ticketIndex] = updatedTicket
        } else {
          // Si no se encuentra, añadir el nuevo
          updatedTickets.push(updatedTicket)
        }
      } else {
        // Añadir un nuevo ticket
        updatedTickets.push(updatedTicket)
      }
      
      // Actualizar en Firestore
      await updateDoc(eventDocRef, {
        tickets: updatedTickets,
        updatedAt: new Date().toISOString()
      })
      
      // Actualizar el estado local
      setTechs(prev => prev.map(tech => {
        if (tech.id === techs[0].id) {
          return { ...tech, tickets: updatedTickets }
        }
        return tech
      }))
      
      return { success: true }
    } catch (error) {
      console.error("Error al actualizar el ticket:", error)
      return { success: false, error: "Ocurrió un error al guardar el ticket" }
    } finally {
      setIsSaving(false)
    }
  }
  
  // Función para eliminar un ticket
  const deleteTicketData = async (
    ticketToDelete: Ticket
  ): Promise<{success: boolean, error?: string}> => {
    if (!techs[0]?.id) {
      console.error("No se puede eliminar el ticket sin un ID de evento")
      return { success: false, error: "ID de evento faltante" }
    }
    
    try {
      setIsSaving(true)
      const eventDocRef = doc(db, "events", techs[0].id)
      
      // Filtrar la lista de tickets para eliminar el especificado
      const currentTickets = [...(techs[0].tickets || [])]
      const updatedTickets = currentTickets.filter(
        t => !(
          t.title === ticketToDelete.title && 
          t.description === ticketToDelete.description && 
          t.price === ticketToDelete.price
        )
      )
      
      // Actualizar en Firestore
      await updateDoc(eventDocRef, {
        tickets: updatedTickets,
        updatedAt: new Date().toISOString()
      })
      
      // Actualizar el estado local
      setTechs(prev => prev.map(tech => {
        if (tech.id === techs[0].id) {
          return { ...tech, tickets: updatedTickets }
        }
        return tech
      }))
      
      return { success: true }
    } catch (error) {
      console.error("Error al eliminar el ticket:", error)
      return { success: false, error: "Ocurrió un error al eliminar el ticket" }
    } finally {
      setIsSaving(false)
    }
  }

  const description = techs.length > 0 ? techs[0].description : '';
  const eventId = techs.length > 0 ? techs[0].id : undefined;
  
  
  return (
    <div className="text-white w-full mt-20 ml-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">       
         <Hero 
          date={techs.length > 0 ? String(techs[0].date) : ''} 
          title={techs.length > 0 ? techs[0].title : ''} 
          subtitle={techs.length > 0 ? techs[0].subtitle : ''} 
          heroImage={techs.length > 0 ? techs[0].heroImage : ''} 
        />        
        <Description
          description={description}
          eventId={eventId}
          saveChanges={(content) => saveEventData("description", content)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
          <div className="flex flex-col gap-8">           
             {techs.length > 0 && (
              <LocationContainer 
                location={techs[0].location || {title: '', mapUrl: '', description: ''}}
                eventId={eventId} 
                saveChanges={saveLocationData}
              />
            )}            
            <div id="aprenderas" className="bg-transparent">
              <Details 
                details={techs[0]?.details}
                eventId={eventId}
                saveChanges={(content) => saveEventData("details", content)}
              />
            </div>
            
            <div id="syllabus" className="bg-transparent">
              <Syllabus 
                syllabus={techs[0]?.syllabus || []}
                eventId={eventId}
                saveChanges={(content) => saveEventData("syllabus", content)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-8">            <div className="justify-center flex items-center w-full">
              <ProfessorContainer 
                speakers={profesorData}
                eventId={eventId}
                saveSpeakers={saveSpeakersData}
              />
            </div>            
            <div id="benefits" className="bg-transparent">
              <Benefits
                benefits={techs[0]?.benefits}
                eventId={eventId}
                saveChanges={(content) => saveEventData("benefits", content)}
              />
            </div>
            <div id="faqs" className="bg-transparent">
              <FAQs
                faqs={techs[0]?.faqs || []}
                eventId={eventId}
                saveChanges={(content) => saveEventData("faqs", content)}
              />
            </div>            
            <div id="precios" className="flex items-center justify-center p-8">                
               <Tickets 
                tickets={techs[0]?.tickets || []} 
                ticketName={techs[0]?.ticketName || techs[0]?.name || ''}
                eventId={eventId} 
                eventSlug={slug}
                saveTicketData={saveTicketData}
                deleteTicketData={deleteTicketData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}