'use client'
import { Badge, Clock, Code, Database, Palette, Star, TrendingUp, Zap, ZapIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../firebase'
import { collection, query, where } from 'firebase/firestore'
import CardLoader from '../components/loaders-skeletons/CardLoader'
import { formatDate } from '../../utils/formatDate'
import HTMLReactParser from 'html-react-parser'
import Link from 'next/link'
import { CourseList } from '@/components/CourseList'

export default function AcademicOffer() {
	const [areaFiltrada, setAreaFiltrada] = useState("todos")
	const [nivelFiltrado, setNivelFiltrado] = useState("todos")
	const [mostrarTodos, setMostrarTodos] = useState(false)
	const [showAll, setShowAll] = useState(false);
	const [programasEducativosSnapshot, loading, error] = useCollection(
		query(collection(db, 'programs'),
			where('status', '==', 'Publicado'))
	)
	const [cursosCortos, loadingCursosCortos, errorCursosCortos] = useCollection(
		query(collection(db, 'events'),
			where('status', '==', 'published'),
			where('type', '==', 'curso especializado'),)
	)

	const programasEducativos = programasEducativosSnapshot
		? programasEducativosSnapshot.docs.map(doc => ({ ...(doc.data() as Program), id: doc.id }))
		: []
	const cursosCortosEducativos = cursosCortos
		? cursosCortos.docs.map(doc => ({ ...(doc.data() as any), id: doc.id }))
		: []

	console.log(cursosCortosEducativos);
	const cortosFuturos = cursosCortosEducativos.filter((curso) => {
		const fechaActual = new Date();
		const fechaCurso = new Date(curso.date);
		return fechaCurso > fechaActual;
	});
	const educativos = [...programasEducativos, ...cortosFuturos]
	const displayedEducativos = showAll ? educativos : educativos.slice(0, 6);



	if (loading) return <div className="text-center flex flex-row gap-2 rounded-lg shadow p-2">
		<CardLoader />
		<CardLoader />
		<CardLoader />
	</div>

	return (
		<section id="oferta-academica" className="py-15 px-4 text-zinc-200">
			<div className="mx-auto">				
				<div className="text-center mb-10">
				<h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-black drop-shadow-lg">
					Programas educativos 
				</h2>
				<h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-black drop-shadow-lg">diseñados para el mercado laboral actual</h2>
				<p className="max-w-2xl mx-auto text-xl text-zinc-600">
					 Enfoque práctico y orientados al aprendizaje experiencial, diseñados por expertos de la industria.
				</p>
			</div>
				{/* Programas filtrados */}
				<CourseList
				diplomados={programasEducativos}
				cursosCortos={cortosFuturos}
				showHeader={false}

				/>

				{programasEducativos.length === 0 && (
					<div className="text-center py-12 bg-white rounded-lg shadow">
						<p className="text-gray-500">No hay cursos disponibles para los filtros seleccionados.</p>						
							<button
							className="text-blue-600 mt-2"
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
