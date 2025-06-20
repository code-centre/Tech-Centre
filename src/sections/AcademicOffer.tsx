'use client'
import React, { useState, useEffect } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../firebase'
import { collection, query, where, Query, DocumentData } from 'firebase/firestore'
import CardLoader from '../components/loaders-skeletons/CardLoader'
import { CourseList } from '@/components/CourseList'
import useUserStore from '../../store/useUserStore'
import EventCreationModal from '@/components/EventCreationModal'

export default function AcademicOffer() {
	const [areaFiltrada, setAreaFiltrada] = useState("todos")
	const [nivelFiltrado, setNivelFiltrado] = useState("todos")
	const [mostrarTodos, setMostrarTodos] = useState(false)
	const [showAll, setShowAll] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
	const [pastEvents, setPastEvents] = useState<any[]>([]);
	const { user } = useUserStore();
	const isAdmin = user?.rol === 'admin';

	// Queries dinámicas basadas en el rol del usuario
	const [programasQuery, setProgramasQuery] = useState<Query<DocumentData>>(
		query(collection(db, 'programs'), where('status', '==', 'Publicado'))
	);

	const [cursosQuery, setCursosQuery] = useState<Query<DocumentData>>(
		query(collection(db, 'events'),
			where('status', '==', 'published'),
			where('type', '==', 'curso especializado'))
	);

	useEffect(() => {
		if (isAdmin) {
			setProgramasQuery(
				query(collection(db, 'programs'),
					where('status', 'in', ['Publicado', 'Borrador']))
			);

			setCursosQuery(
				query(collection(db, 'events'),
					where('status', 'in', ['published', 'draft']),
					where('type', '==', 'curso especializado'))
			);
		} else {
			setProgramasQuery(
				query(collection(db, 'programs'),
					where('status', '==', 'Publicado'))
			);
			setCursosQuery(
				query(collection(db, 'events'),
					where('status', '==', 'published'),
					where('type', '==', 'curso especializado'))
			);
		}
	}, [isAdmin]);

	// Usar las queries dinámicas
	const [programasEducativosSnapshot, loading, error] = useCollection(programasQuery);
	const [cursosCortos, loadingCursosCortos, errorCursosCortos] = useCollection(cursosQuery);
	const programasEducativos = programasEducativosSnapshot
		? programasEducativosSnapshot.docs.map(doc => {
			const data = doc.data() as Program;
			return {
				...data,
				id: doc.id,
				// Añadir una propiedad para indicar si es un borrador
				isDraft: data.status === 'Borrador'
			}
		})
		: []
	const cursosCortosEducativos = cursosCortos
		? cursosCortos.docs.map(doc => {
			const data = doc.data() as any;
			return {
				...data,
				id: doc.id,
				// Añadir una propiedad para indicar si es un borrador
				isDraft: data.status === 'draft'
			}
		})
		: []

	const cortosFuturos = cursosCortosEducativos.filter((curso) => {
		// Obtener la fecha actual en Colombia
		const fechaActual = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
		fechaActual.setHours(0, 0, 0, 0);

		const fechaCurso = new Date(curso.date);
		fechaCurso.setHours(0, 0, 0, 0);

		return fechaCurso >= fechaActual;
	});
	const educativos = [...programasEducativos, ...cortosFuturos]
	const displayedEducativos = showAll ? educativos : educativos.slice(0, 6);

	if (loading && !isAdmin) return (
		<div className="container mx-auto px-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
				<CardLoader />
				<CardLoader />
				<CardLoader />
				<CardLoader />
				<CardLoader />
				<CardLoader />
			</div>
		</div>
	);

	return (
		<section id="oferta-academica" className="py-15 px-4 text-white bg-background">
			<div className="mx-auto">
				<div className="text-center mb-10">
					<h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-lg">
						Programas educativos
					</h2>
					<h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-lg">diseñados para el mercado laboral actual</h2>
					<p className="max-w-2xl mx-auto text-xl">
						Enfoque práctico y orientados al aprendizaje experiencial, diseñados por expertos de la industria.
					</p>

					{isAdmin && (
						<>
							<div className="mt-4 bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded relative max-w-2xl mx-auto">
								<strong className="font-bold">Modo administrador:</strong>
								<span className="block sm:inline"> Estás viendo tanto cursos publicados como borradores.</span>
							</div>
							<div className="mt-6 flex justify-center gap-4 text-white">
								<button
									onClick={() => setIsOpen(true)}
									className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg 
                           hover:from-blue-500 hover:to-blue-400 transform hover:-translate-y-0.5 
                           transition-all duration-200 shadow-lg shadow-blue-700/30"
								>
									Crear nuevo curso especializado
								</button>
								<EventCreationModal
									isOpen={isOpen}
									onClose={() => setIsOpen(false)}
									onEventCreate={(newEvent) => {
										// Añadir el nuevo evento a los eventos futuros
										const eventDate = new Date(newEvent.date);
										const currentDate = new Date();
										if (eventDate >= currentDate) {
											setUpcomingEvents(prevEvents => [newEvent, ...prevEvents]);
										} else {
											setPastEvents(prevEvents => [newEvent, ...prevEvents]);
										}
										setIsOpen(false);
									}}
								/>
							</div>
						</>
					)}
				</div>
				{/* Programas filtrados */}
				<CourseList
					diplomados={programasEducativos}
					cursosCortos={cortosFuturos}
					showHeader={false}

				/>				
				{programasEducativos.length === 0 && !isAdmin && (
					<div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700 shadow">
						<p className="text-gray-300">No hay cursos disponibles para los filtros seleccionados.</p>
						<button
							className="text-blue-400 hover:text-blue-300 mt-2 transition-colors"
							onClick={() => {
								setNivelFiltrado("todos")
								setAreaFiltrada("todos")
							}}
						>
							Ver todos los cursos
						</button>
					</div>
				)}
				<div className="mt-16 text-center">
					{educativos.length > 6 && (<button
						className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-lg py-6 px-10 cursor-pointer rounded-xl shadow-xl transition duration-300 font-bold tracking-wide"
						onClick={() => setShowAll((prev) => !prev)}
					>
						{showAll ? "Ver menos" : "Ver todos los cursos"}
					</button>
					)}
				</div>
			</div>
		</section>
	)
}
