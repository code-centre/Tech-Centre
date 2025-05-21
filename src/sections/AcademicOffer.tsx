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
	const [programasEducativosSnapshot, loading, error] = useCollection(
		query(collection(db, 'programs'),
			where('status', '==', 'Publicado'))
	)
	const [cursosCortos, loadingCursosCortos, errorCursosCortos] = useCollection(
		query(collection(db, 'events'),
			where('status', '==', 'published'),
			where('type', '==', 'taller'))
	)

	const programasEducativos = programasEducativosSnapshot
		? programasEducativosSnapshot.docs.map(doc => ({ ...(doc.data() as Program), id: doc.id }))
		: []
	const cursosCortosEducativos = cursosCortos
		? cursosCortos.docs.map(doc => ({ ...(doc.data() as any), id: doc.id }))
		: []

	console.log(cursosCortosEducativos);

	const educativos = [...programasEducativos, ...cursosCortosEducativos]

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

	const buttonStyle = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-white hover:bg-gray-200 text-black mb-8 mx-6 flex-1"
	return (
		<section id="oferta-academica" className="py-20 px-4 bg-black text-zinc-200">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<span className="inline-block px-4 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium mb-4">
						Oferta Académica
					</span>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Cursos diseñados para el mercado laboral actual
					</h2>
					<p className="max-w-2xl mx-auto text-lg">
						Programas con enfoque práctico y orientados a resultados, diseñados por expertos de la industria.
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{educativos.slice(0, 6).map((programa) => (
						<div
							key={programa.id}
							className="bg-zinc-900 border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow group rounded-lg"
						>
							<div className="relative">
								<Image
									src={programa.image || programa.heroImage || "/placeholder.svg"}
									alt={programa.name || "Imagen del curso"}
									width={600}
									height={400}
									className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="w-full bg-zinc-800"></div>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								<div
									className={`
                    absolute bottom-4 left-4 px-3 py-1
									rounded-full text-sm
                    ${programa.category === "cloud" ? "bg-blue-500 hover:bg-blue-600" : ""}
                    ${programa.category === "Desarrollo Web" ? "bg-yellow-500 text-black hover:bg-yellow-600" : ""}
                    ${programa.category === "web" ? "bg-purple-600 hover:bg-purple-700" : ""}
					${programa.type === "taller" ? "bg-yellow-600 hover:bg-purple-700" : ""}
                  `}
								>
									{programa.category === "cloud"
										? "Avanzado"
										: programa.type === "taller"
											? "Curso Corto"
											: "Básico"
									}
								</div>
								{/* <div
									className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm bg-gray-800 hover:bg-gray-900"
								>
									{areas.find((a) => a.id === programa.area)?.nombre}
								</div> */}
							</div>
							<header className="flex flex-col space-y-1.5 p-6 pb-2 h-35">
								<div className="flex justify-between items-center text-white">
									<div className="flex items-center gap-1">
										{/* <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> */}
										{/* <span className="font-bold">{programa.rating}</span>
										<span className="text-gray-500 text-sm">({programa.estudiantes.toLocaleString()})</span> */}
									</div>
									<div className="flex items-center gap-1 text-gray-500 text-sm">
										<Clock className="h-4 w-4" />
										<span>{programa.duration || formatDate(programa.date)}</span>
									</div>
								</div>
								<h3 className="text-xl mt-2 text-white font-bold">{programa.name || programa.title}</h3>
							</header>
							<div className="p-6 pt-2 h-45">
								<p className="text-gray-400 mb-4 line-clamp-4 overflow-hidden">{programa.shortDescription || HTMLReactParser(programa.description)}</p>
								<div className="flex items-center gap-3 mb-4">
									{/* <div className="size-10 rounded-full bg-gray-400"></div> */}
									{programa.type !== 'taller' && (
										<div>
											<p className="font-medium text-white">{programa.teacher}</p>
											<p className="text-sm text-gray-500">Profesor</p>
										</div>
									)}
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Zap className="h-4 w-4 text-white" />
									{/* <span>Próxima clase: {getPriceDisplay()}</span> */}
								</div>
							</div>
							<footer className="pt-0 flex justify-center">
								<Link href={`/cursos/${programa?.slug}`}>
									<button className={buttonStyle}>
										Ver detalles del curso
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
							className="text-purple-600 mt-2"
							onClick={() => {
								setNivelFiltrado("todos")
								setAreaFiltrada("todos")
							}}
						>
							Ver todos los cursos
						</button>
					</div>
				)}

				<div className="mt-12 text-center">
					<button className="bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 px-8 cursor-pointer rounded-lg shadow-lg transition duration-300">
						Ver todos los cursos
					</button>
				</div>
			</div>
		</section>
	)
}
