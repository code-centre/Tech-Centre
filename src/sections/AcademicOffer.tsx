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

	// const getPriceDisplay = () => {
	// 	const ticketsPrice = cursosCortosEducativos
	// 		.flatMap(evento => Array.isArray(evento.tickets) ? evento.tickets.map(ticket => ticket.price) : []);
	// 	if (Array.isArray(ticketsPrice) && ticketsPrice.length > 0) {
	// 		const minPrice = Math.min(...ticketsPrice.filter(price => typeof price === 'number'));
	// 		if (minPrice === 0) {
	// 			return "Entrada gratuita";
	// 		}
	// 		if (minPrice > 0) {
	// 			return `Aporte $${minPrice.toLocaleString('es-CO')}`;
	// 		}
	// 	}
	// 	return "Precio no disponible";
	// };

	// console.log('precios', getPriceDisplay());


	if (loading) return <div className="text-center flex flex-row gap-2 bg-black rounded-lg shadow p-2">
		<CardLoader />
		<CardLoader />
		<CardLoader />
	</div>

	// const programasFiltrados = programasEducativos.filter((programa) => {
	// 	const cumpleNivel = nivelFiltrado === "todos" || programa.nivel === nivelFiltrado
	// 	const cumpleArea = areaFiltrada === "todos" || programa.area === areaFiltrada
	// 	return cumpleNivel && cumpleArea
	// })

	return (
		<section id="oferta-academica" className="py-15 px-4 bg-gradient-to-b from-black via-zinc-900 to-black text-zinc-200">
			<div className="max-w-7xl mx-auto">				
				<div className="text-center mb-20">
				<span className="inline-block px-6 py-2 rounded-full bg-blue-500 text-white font-semibold mb-5 tracking-wide shadow-lg">
					Oferta académica
				</span>
				<h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-white drop-shadow-lg">
					Cursos diseñados para el mercado laboral actual
				</h2>
				<p className="max-w-2xl mx-auto text-xl text-zinc-300">
					Programas con enfoque práctico y orientados al aprendizaje experiencial, diseñados por expertos de la industria.
				</p>
			</div>

				{/* Filtros */}
				{/* <div className="mb-12 space-y-6">
					Filtro por área
					<div>
						<h3 className="text-lg font-medium mb-3 text-gray-700">Filtrar por área</h3>
						<Tabs defaultValue="todos" className="w-full" onValueChange={setAreaFiltrada}>
							<TabsList className="bg-white shadow-md h-auto flex flex-wrap">
								{areas.map((area) => {
									const IconComponent = area.icono
									return (
										<TabsTrigger
											key={area.id}
											value={area.id}
											className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2 px-4 h-auto flex items-center gap-2"
										>
											{area.icono && <IconComponent className="h-4 w-4" />}
											{area.nombre}
										</TabsTrigger>
									)
								})}
							</TabsList>
						</Tabs>
					</div>

					Filtro por nivel
					<div>
						<h3 className="text-lg font-medium mb-3 text-gray-700">Filtrar por nivel</h3>
						<Tabs defaultValue="todos" className="w-full" onValueChange={setNivelFiltrado}>
							<TabsList className="bg-white shadow-md">
								{niveles.map((nivel) => (
									<TabsTrigger
										key={nivel.id}
										value={nivel.id}
										className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
									>
										{nivel.nombre}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				</div>  */}

				{/* Cursos destacados */}
				{/* {areaFiltrada === "todos" && nivelFiltrado === "todos" && (
					<div className="mb-12">
						<h3 className="text-2xl font-bold mb-6 flex items-center">
							<ZapIcon className="h-5 w-5 text-zinc-600 mr-2" /> Cursos destacados
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{programasEducativos((p) => p.destacado)
								.slice(0, 3)
								.map((programa) => (
									<div
										key={programa.id}
										className="rounded-lg text-card-foreground bg-zinc-900 border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow group relative"
									>
										<div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-sm font-medium z-10">
											Destacado
										</div>
										<div className="relative"> */}
				{/* <Image
												src={programa.imagen || "/placeholder.svg"}
												alt={programa.titulo}
												width={600}
												height={400}
												className="w-full h-48 object-cover"
											/> */}
				{/* <div className="w-full h-48 bg-zinc-800"></div>
											<div
												 className={`
													absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm
													${programa.nivel === "basico" ? "bg-blue-500 hover:bg-blue-600" : ""}
													${programa.nivel === "intermedio" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
													${programa.nivel === "avanzado" ? "bg-gray-200 text-black hover:bg-gray-300" : ""}
												  `}
											>
												{programa.nivel === "basico"
													? "Básico"
														: programa.nivel === "intermedio"
														? "Intermedio"
														: "Avanzado"}
											</div>
										</div>
										<header className="flex  flex-col space-y-1.5 p-6 pb-2">
											<div className="flex justify-between items-center">
												<div className="flex items-center gap-1">
													<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
													<span className="font-bold text-white">{programa.rating}</span>
													<span className="text-gray-500 text-sm">({programa.estudiantes.toLocaleString()})</span>
												</div>
												<div className="flex items-center gap-1 text-gray-500 text-sm">
													<Clock className="h-4 w-4" />
													<span>{programa.duracion}</span>
												</div>
											</div>
											<h3 className="text-xl mt-2 font-bold text-white">{programa.titulo}</h3>
										</header>
										<div className='p-6 pt-0'>
											<p className="text-gray-400 mb-4">{programa.descripcion}</p>
											<div className="flex items-center gap-3 mb-4">
												<div className='size-10 rounded-full bg-gray-400'></div>
												<div>
													<p className="font-medium text-white">{programa.profesor}</p>
													<p className="text-sm text-gray-500">Profesor</p>
												</div>
											</div>
											<div className="flex items-center gap-2 text-sm text-gray-500">
												<Zap className="h-4 w-4 text-white" />
												<span>Próxima clase: {programa.proximaClase}</span>
											</div>
										</div>
										<footer className="pt-0 flex justify-center">
											<button className={buttonStyle}>
												Ver detalles del curso
											</button>
										</footer>
									</div>
								))}
						</div>
					</div>
				)} */}

				{/* Programas filtrados */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
					{displayedEducativos.map((programa) => (
						<div
							key={programa.id}
							className="bg-zinc-900 border border-zinc-800 shadow-xl hover:shadow-2xl transition-shadow group rounded-2xl overflow-hidden flex flex-col h-full relative"
						>
							<div className="relative">
								<Image
									src={programa.image || programa.heroImage || "/placeholder.svg"}
									alt={programa.name || "Imagen del curso"}
									width={600}
									height={400}
									className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300 border-b-4 border-blue-600"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
								<div
									className={`
										absolute top-4 left-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md
										${programa.category === "cloud" ? "bg-purple-500/90 text-white" : ""}
										${programa.category === "Desarrollo Web" ? "bg-blue-400/90 text-white" : ""}
										${programa.category === "web" ? "bg-blue-600/90 text-white" : ""}
										${programa.type === "curso especializado" ? "bg-yellow-600 text-white" : ""}
									`}
								>
									{programa.category === "cloud"
										? "Avanzado"
										: programa.type === "curso especializado"
											? "Curso especializado"
											: "Básico"
									}
								</div>
							</div>
							<header className="flex flex-col space-y-2 p-6 pb-2 h-35">
								<div className="flex justify-between items-center text-white mb-2">
									<div className="flex items-center gap-1">
										{/* <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> */}
										{/* <span className="font-bold">{programa.rating}</span>
										<span className="text-gray-500 text-sm">({programa.estudiantes.toLocaleString()})</span> */}
									</div>
									<div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
										<Clock className="h-4 w-4" />
										<span>
											{programa.duration ||
												formatDate(programa.date)
											}
										</span>
									</div>
								</div>
								<h3 className="text-2xl mt-2 text-white font-extrabold leading-tight group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 break-words min-h-[60px]">
									{programa.name || programa.title}
								</h3>
							</header>
							<div className="p-6 pt-2 flex-1 flex flex-col justify-between">
								<p className="text-zinc-300 mb-4 line-clamp-4 overflow-hidden text-base min-h-[80px]">
									{programa.shortDescription || HTMLReactParser(programa.description)}
								</p>
								<div className="flex items-center gap-3 mb-4">
									{/* <div className="size-10 rounded-full bg-gray-400"></div> */}
									{programa.type !== 'curso especializado' && (
										<div className="flex flex-col justify-center">
											<p className="font-bold text-lg text-blue-400 leading-tight">{programa.teacher}</p>
											<p className="text-xs text-blue-100 tracking-wide mt-1">Profesor</p>
										</div>
									)}
								</div><div className="flex items-center gap-2 text-sm text-blue-300 font-medium">
									{/* <Zap className="h-4 w-4 text-blue-400" /> */}
									{/* <span>Próxima clase: {getPriceDisplay()}</span> */}
								</div>
							</div>
							<footer className="pt-0 flex justify-center pb-6">
								<Link href={`/programas-academicos/${programa?.slug}`}>									
								<button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-lg py-4 px-10 cursor-pointer rounded-xl shadow-xl transition duration-300 font-bold tracking-wide">
									{programa.type === "curso especializado" ? "Ver curso especializado" : "Ver diplomado"}
								</button>
								</Link>
							</footer>
						</div>
					))}
				</div>
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
