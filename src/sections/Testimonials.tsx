'use client'
import Link from 'next/link';
import React, { useState } from 'react'
import Wrapper from '../components/Wrapper';

const videos = [
  {
    id: 1,
    srcVideo: "https://www.youtube.com/embed/1ngtV0IR9yc",
    highlight: true,
    cover: "/grupo-de-3-miniatura.jpg",
  },
  {
    id: 2,
    srcVideo: "https://www.youtube.com/embed/jLWKe8vVYLo",
    highlight: false,
    cover: "/daniel-perez-miniatura.jpg",
  },
  {
    id: 3,
    srcVideo: "https://www.youtube.com/embed/Bwk1pghvf-k",
    highlight: false,
    cover: "/daniel-reyes-miniatura.jpg",
  },
  {
    id: 4,
    srcVideo: "https://www.youtube.com/embed/9BZgidnjQcU",
    highlight: false,
    cover: "/python-miniatura.jpg",
  },
  {
    id: 5,
    srcVideo: "https://www.youtube.com/embed/ripgd4E7gRI",
    highlight: false,
    cover: "/alumnos-miniatura.png",}
];

interface Props {
  backgroundColor?: string
}

const placeId = "ChIJv01Wyvot9I4RUtzmOXikbpM";

export default function Testimonials({ backgroundColor }: Props) {
  const [videosList, setVideosList] = useState(videos);


  const handleHighlight = (idToSwitchToTrue: string) => {
    setVideosList((prevVideosList) =>
      prevVideosList.map(
        (video) =>
          video.srcVideo === idToSwitchToTrue
            ? { ...video, highlight: true } // Establece highlight en true para el video seleccionado
            : { ...video, highlight: false } // Establece highlight en false para todos los demás
      )
    );
  };
  return (
    <div id="testimonio" className='bg-background relative overflow-hidden'>
      {/* Visual shift: subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-foreground/5 to-transparent pointer-events-none"></div>
      
      {/* Border divider for visual separation */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border-color to-transparent"></div>
      
      <Wrapper styles="max-w-6xl flex flex-col gap-14 w-full py-14 sm:py-20 relative z-10">
        <section className="grid gap-10 grid-cols-1 lg:grid-cols-[2.5fr_3fr]">
          <div className=" flex flex-col-reverse lg:flex-row gap-5 w-full">
            <div className="flex flex-row flex-wrap lg:flex-nowrap lg:flex-col gap-5">
              {videosList.map((video) => {
                if (!video.highlight) {
                  return (
                    <img
                      onClick={() => handleHighlight(video.srcVideo)}
                      className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border-color"
                      src={video.cover}
                      key={video.cover}
                      alt={`Testimonio ${video.id}`}
                    ></img>
                  );
                }
              })}
            </div>
            {videosList
              .filter((video) => video.highlight === true)
              .map((video) => (
                <div
                  className="relative w-full h-[450px] rounded-lg overflow-hidden shadow-xl"
                  key={video.srcVideo}
                >
                  <iframe
                    src={video.srcVideo}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  ></iframe>
                  <div className="absolute h-36 gradient top-0 z-10 w-full text-foreground p-4 flex flex-col gap-1">
                    <p className="bg-text-muted/20 backdrop-blur-sm px-3 text-sm rounded-full w-fit text-foreground border border-border-color/50">
                      Testimonio #{video.id}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <div className=" self-center flex flex-col gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold text-text-primary">
                Escucha los testimonios
              </h2>
              <h3 className="text-4xl md:text-5xl font-semibold text-secondary">
                De personas que cambiaron sus vidas
              </h3>
            </div>
            <p className="text-lg text-text-primary leading-relaxed">
              No dejes pasar esta oportunidad y{' '}
              <span className="text-secondary font-semibold">despierta al genio tech que llevas dentro.</span>
            </p>
            
            <div className="flex flex-col gap-4">
              <Link
                href="/programas-academicos"
                className="btn-primary"
              >
                Explorar programas
              </Link>
              
              {/* Microcopy anti-fricción */}
              <p className="text-sm text-text-muted text-center leading-relaxed">
                Grupos pequeños · Clases presenciales · Cupos limitados
              </p>
            </div>
          </div>
        </section>
      </Wrapper>
    </div>
  )
}