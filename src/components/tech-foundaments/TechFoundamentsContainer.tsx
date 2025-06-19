'use client'
import React, { use } from 'react'
import { Hero } from './Hero'
import { useState, useEffect } from 'react'
import { Description } from './Description'
import { Tickets } from './Tickets'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../../firebase'
import { where, collection, query, getDocs, doc, updateDoc, serverTimestamp, onSnapshot, getDoc, deleteDoc } from 'firebase/firestore'
import LocationContainer from './LocationContainer'
import Details from './Details'
import Benefits from './Benefits'
import FAQs from './FAQs'
import Syllabus from './Syllabus'
import { ProfessorContainer } from './ProfessorContainer'
import { useRouter } from 'next/navigation'
import { GraduationCap, CalendarClock, Network, Clock, ChevronDown } from 'lucide-react';

interface Props {
  slug: string
  shortCourse?: EventFCA
}

export default function TechFoundamentsContainer({ slug }: Props) {
  const [shortCourse, setShortcourse] = useState<any>()
  const [teacher, setTeacher] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [profesorData, setProfesorData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [short, setShort] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (shortCourse) {
      const fetchSpeakers = async () => {
        const speakersRef = collection(db, "events", shortCourse.id, "speakers")
        const speakersSnap = await getDocs(speakersRef)
        const speakersData = speakersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTeacher(speakersData)
      }
      fetchSpeakers()
    }
  }, [shortCourse])

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


  useEffect(() => {
    const q = query(collection(db, "events"), where("slug", "==", slug));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        setShortcourse({ id: docSnapshot.id, ...docSnapshot.data() } as EventFCA); // Agregamos el id
      } else {
        setShortcourse(null);
      }
    });

    return () => unsubscribe(); // Limpieza al desmontar
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Cargar tickets cuando shortCourse cambia
  useEffect(() => {
    const loadTickets = async () => {
      if (!shortCourse?.id) return;

      try {
        const eventDocRef = doc(db, "events", shortCourse.id);
        const eventSnap = await getDoc(eventDocRef);

        if (eventSnap.exists()) {
          const eventData = eventSnap.data();
          const ticketsData = (eventData?.tickets || []).map((ticket: any) => ({
            name: ticket.name ?? ticket.title ?? '',
            title: ticket.title ?? '',
            ticketName: ticket.ticketName ?? ticket.name ?? ticket.title ?? '',
            price: ticket.price ?? 0,
            benefits: ticket.benefits ?? [],
            type: ticket.type ?? 'general',
            description: ticket.description ?? '',
          }));

          console.log("Tickets cargados:", ticketsData);
          setTickets(ticketsData);
        }
      } catch (error) {
        console.error("Error al cargar tickets:", error);
      }
    };

    loadTickets();
  }, [shortCourse]);

  const saveChanges = async (
    propertyName: string,
    newValues: any, // Valores opcionales
    index?: number
  ) => {

    if (!newValues) return;
    // if (!newValues || Object.keys(newValues).length === 0) return;

    const currentId = shortCourse?.id;
    if (!currentId) {
      console.error("No se encontró el ID del curso");
      return;
    }
    const eventsDocRef = doc(db, "events", currentId);
    const programSnapshot = await getDoc(eventsDocRef);

    // Actualizar tickets solo si estamos modificando la propiedad tickets
    if (propertyName === 'tickets') {
      const ticketsSnapshot = (programSnapshot.data()?.tickets || []).map((ticket: any) => ({
        name: ticket.name ?? ticket.title ?? '',
        title: ticket.title ?? '',
        ticketName: ticket.ticketName ?? ticket.name ?? ticket.title ?? '',
        price: ticket.price ?? 0,
        benefits: ticket.benefits ?? [],
        type: ticket.type ?? 'general',
        description: ticket.description ?? '',
      }))
      setTickets(ticketsSnapshot)
    }
    try {
      if (!programSnapshot.exists()) {
        console.error("El documento no existe");
        return;
      }

      const programData = programSnapshot.data();

      if (Array.isArray(programData[propertyName])) {
        // Copia del array para modificarlo sin mutar el original
        let updatedArray = [...programData[propertyName]];


        updatedArray = newValues;

        await updateDoc(eventsDocRef, {
          [propertyName]: updatedArray,
          updatedAt: serverTimestamp(),
        });

        console.log(`Objeto en índice ${index} actualizado correctamente:`, newValues);
      } else if (propertyName === 'name') {
        const newSlug = newValues?.toLowerCase().replace(/ /g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")


        await updateDoc(eventsDocRef, {
          ...programData,
          name: newValues,
          id: currentId,
          slug: newSlug,
          updatedAt: serverTimestamp(),
        })


        router.replace(`/cursos/${newSlug}`)
        // window.location.reload()
      } else {
        console.log(newValues, 'else', propertyName);

        await updateDoc(eventsDocRef, {
          [propertyName]: newValues,
          updatedAt: serverTimestamp(),
        })
      }

    } catch (error) {
      console.error(`Error actualizando ${propertyName}:`, error);
    }
  };[shortCourse]

  const eventId = shortCourse?.id || ''

  const handleLocationUpdate = async (locationData: any) => {
    try {
      await saveChanges('location', locationData);
      return { success: true };
    } catch (error) {
      console.error("Error al actualizar la ubicación:", error);
      return { success: false, error: "Error al actualizar la ubicación" };
    }
  };

  const saveSpeakersData = async (speakers: any[]) => {
    if (!eventId) {
      console.error("No se encontró el ID del evento");
      return { success: false, error: "No se encontró el ID del evento" };
    }

    try {
      const speakersRef = collection(db, "events", eventId, "speakers");
      const updateTeachers = speakers.map(async (speaker) => {
        try {
          const speakerDocRef = doc(speakersRef, speaker.id);
          await updateDoc(speakerDocRef, {
            ...speaker,
            updatedAt: serverTimestamp(),
          });
        }
        catch (error) {
          console.error("Error actualizando el profesor:", error);
          throw error;
        }
      })
      await Promise.all(updateTeachers);
      return { success: true };
    } catch (error) {
      console.error("Error actualizando speakers:", error);
      return { success: false, error: "Error actualizando speakers" };
    }
  };

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!shortCourse?.id) {
      console.error("No se encontró el ID del evento");
      return;
    }
    try {
      const speakerDocRef = doc(db, "events", shortCourse.id, "speakers", speakerId);
      await deleteDoc(speakerDocRef);
      setTeacher(prevTeachers => prevTeachers.filter(t => t.id !== speakerId));
      setProfesorData(prevSpeakers => prevSpeakers.filter(speaker => speaker.id !== speakerId));
    } catch (error) {
      console.error("Error eliminando el speaker:", error);
    }
  }

  // Función para guardar cambios en los tickets
  const saveTicketData = async (updatedTicket: any, oldTicket?: any) => {
    if (!shortCourse?.id) {
      console.error("No se encontró el ID del evento");
      return { success: false, error: "No se encontró el ID del evento" };
    }

    try {
      const eventDocRef = doc(db, "events", shortCourse.id);
      const eventSnap = await getDoc(eventDocRef);

      if (!eventSnap.exists()) {
        console.error("El evento no existe");
        return { success: false, error: "El evento no existe" };
      }

      const eventData = eventSnap.data();
      let updatedTickets = [...(eventData.tickets || [])];

      if (oldTicket) {
        // Si tenemos un ticket anterior, lo reemplazamos con el actualizado
        const index = updatedTickets.findIndex(t =>
          t.title === oldTicket.title &&
          t.price === oldTicket.price &&
          t.type === oldTicket.type
        );

        if (index !== -1) {
          updatedTickets[index] = updatedTicket;
        } else {
          console.error("No se encontró el ticket a actualizar");
          return { success: false, error: "No se encontró el ticket a actualizar" };
        }
      } else {
        // Si no hay ticket anterior, agregamos uno nuevo
        updatedTickets.push(updatedTicket);
      }

      await updateDoc(eventDocRef, {
        tickets: updatedTickets,
        updatedAt: serverTimestamp()
      });

      // Actualizar el estado local de tickets
      setTickets(updatedTickets);

      console.log("Ticket actualizado/creado correctamente:", updatedTicket);
      return { success: true };

    } catch (error) {
      console.error("Error actualizando el ticket:", error);
      return { success: false, error: "Error actualizando el ticket" };
    }
  };

  // Función para eliminar un ticket
  const deleteTicketData = async (ticketToDelete: any) => {
    if (!shortCourse?.id) {
      console.error("No se encontró el ID del evento");
      return { success: false, error: "No se encontró el ID del evento" };
    }

    try {
      const eventDocRef = doc(db, "events", shortCourse.id);
      const eventSnap = await getDoc(eventDocRef);

      if (!eventSnap.exists()) {
        console.error("El evento no existe");
        return { success: false, error: "El evento no existe" };
      }

      const eventData = eventSnap.data();
      const updatedTickets = (eventData.tickets || []).filter((ticket: any) =>
        ticket.title !== ticketToDelete.title ||
        ticket.price !== ticketToDelete.price ||
        ticket.type !== ticketToDelete.type
      );

      await updateDoc(eventDocRef, {
        tickets: updatedTickets,
        updatedAt: serverTimestamp()
      });

      // Actualizar el estado local de tickets
      setTickets(updatedTickets);

      console.log("Ticket eliminado correctamente");
      return { success: true };

    } catch (error) {
      console.error("Error eliminando el ticket:", error);
      return { success: false, error: "Error eliminando el ticket" };
    }
  };
 useEffect(() => {
  console.log("Short course type:", shortCourse);
  if (shortCourse?.type === 'curso especializado') {
    setShort(true);
  }
}, [shortCourse]);
  
  return (
    <div className="text-white w-full mt-20 lg:mx-20 overflow-x-hidden">
      <main className="max-w-7xl flex flex-col mx-auto sm:px-4 lg:px-8 pb-20 gap-8">
        <Hero
          date={shortCourse?.date || ''}
          title={shortCourse?.title || ''}
          subtitle={shortCourse?.subtitle || ''}
          heroImage={shortCourse?.heroImage || ''}
          saveChanges={saveChanges}
        />
        <div className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Tipo de curso</span>
              <span className='text-sm'>{shortCourse?.type?.charAt(0).toUpperCase() + shortCourse?.type?.slice(1)}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <CalendarClock className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Duración</span>
              <span className="text-xs text-white font-semibold">{shortCourse?.duration || 'Por definir'}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <Network className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Dificultad</span>
              <span className="text-xs text-white font-semibold">
                {shortCourse?.level || 'Básico'}
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-blueApp" />
              </div>
              <span className="text-sm font-medium text-white mb-1">Dedicación</span>
              <span className="text-xs text-white font-semibold">{shortCourse?.hours || 'Por definir'}</span>
            </div>
          </div>
          {shortCourse?.user?.rol === 'admin' && (
            <div className="mt-4">
              <button
                onClick={() => saveChanges('name', shortCourse?.title)}
                className="px-4 py-2 bg-blueApp text-white rounded-lg hover:bg-blueApp/80 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
        <Description
          saveChanges={saveChanges}
          shortCourse={shortCourse || {}}
        />
        <div className="gap-10 mt-12">
          {/* Grid para "aprenderás" y ProfessorContainer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div id="aprenderas" className="bg-transparent">
              <Details
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              />
            </div>
            <div className="flex justify-center items-center w-full">
              <div className="w-full h-full"> {/* Nueva capa para controlar el ancho y evitar que se corte */}
                <ProfessorContainer
                  speakers={profesorData}
                  eventId={eventId}
                  saveSpeakers={saveSpeakersData}
                  onDeleteSpeaker={handleDeleteSpeaker}
                />
              </div>
            </div>
          </div>

          {/* Secciones adicionales con mejor separación */}
          <div className="flex flex-col gap-y-12">
            <div id="programa" className="bg-transparent pt-12"> {/* Separación extra antes del temario */}
              <Syllabus
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              />
            </div>

            <div id="precios" className="flex items-center justify-center p-8">
              <Tickets
                tickets={tickets || []}
                eventId={eventId}
                eventSlug={slug}
                isShort={short}
                saveTicketData={saveTicketData}
                deleteTicketData={deleteTicketData}
                saveChanges={saveChanges}
              />
            </div>

            <div id="beneficios" className="bg-transparent">
              <Benefits
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              />
            </div>

            {shortCourse && (
              <LocationContainer
                location={shortCourse?.location || ''}
                eventId={eventId}
                saveChanges={handleLocationUpdate}
              />
            )}

            <div id="preguntas" className="bg-transparent">
              <FAQs
                shortCourse={shortCourse || {}}
                saveChanges={saveChanges}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}