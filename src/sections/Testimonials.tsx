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
    <div className='bg-background'>
      <Wrapper styles="max-w-6xl flex flex-col gap-14 w-full py-14">
        <section className="grid gap-10 grid-cols-1 lg:grid-cols-[2.5fr_3fr]">
          <div className=" flex flex-col-reverse lg:flex-row gap-5 w-full">
            <div className="flex flex-row flex-wrap lg:flex-nowrap lg:flex-col gap-5">
              {videosList.map((video) => {
                if (!video.highlight) {
                  return (
                    <img
                      onClick={() => handleHighlight(video.srcVideo)}
                      className="w-24 h-24 rounded-lg object-cover cursor-pointer"
                      src={video.cover}
                      key={video.cover}
                    ></img>
                  );
                }
              })}
            </div>
            {videosList
              .filter((video) => video.highlight === true)
              .map((video) => (
                <div
                  className="relative w-full h-[450px] rounded-lg overflow-hidden "
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
                  {/* <video src={video.srcVideo} autoPlay controls className='object-cover h-[450px] w-full'></video> */}
                  <div className="absolute h-36 gradient top-0 z-10 w-full text-white p-4 flex flex-col gap-1">
                    {/* <p className='font-bold'>{video.name}</p>
                          <p className='font-light'>Frontend Developer - Colombia</p> */}
                    <p className="bg-gray-400 px-3 text-sm  rounded-full w-fit">
                      Testimonio #{video.id}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <div className=" self-center flex flex-col gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold text-white">
                Escucha los testimonios
              </h2>
              <h3 className="text-4xl md:text-5xl font-semibold text-blueApp">
                De personas que cambiaron sus vidas
              </h3>
            </div>
            <p className="text-lg text-white">
              No dejes pasar esta oportunidad y despierta al genio tech que
              llevas dentro.
            </p>
            <div>
              <p className="text-2xl font-bold text-blueApp">¡Qué esperas!</p>
              <div className="h-1 border-b  my-3"></div>
              <p className="text-lg text-white">Cupos limitados</p>
            </div>

            <Link
              href="/#programs"
              className="bg-[#00a1f9] hover:bg-blue-500 py-2 px-5 text-center text-white uppercase rounded-md transition-colors duration-300 font-semibold"
            >
              ¡Inscríbete ya!
            </Link>
          </div>
        </section>
      </Wrapper>
    </div>
  )
}
