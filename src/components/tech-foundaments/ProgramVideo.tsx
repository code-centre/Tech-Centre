'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  /** `programs.video`: URL de YouTube o Vimeo, o el ID pelado. */
  video: string
  /** `programs.image` — se usa como póster mientras no se le da play. */
  poster?: string
  programName?: string
}

/**
 * Resuelve la URL de reproducción. El campo `video` viene escrito a mano desde
 * el admin, así que aceptamos las formas que la gente pega de verdad.
 */
function resolveEmbedUrl(video: string): string | null {
  const value = video.trim()
  if (!value) return null

  // ID de YouTube pelado
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return `https://www.youtube.com/embed/${value}?autoplay=1&rel=0`
  }

  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
    }

    if (host.endsWith('youtube.com')) {
      const id = url.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
      // ya venía como /embed/<id> o /shorts/<id>
      const match = url.pathname.match(/\/(?:embed|shorts)\/([a-zA-Z0-9_-]+)/)
      if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
      return null
    }

    if (host.endsWith('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null
    }

    // Cualquier otra URL se usa tal cual (un mp4 propio, por ejemplo)
    return value
  } catch {
    return null
  }
}

export default function ProgramVideo({ video, poster, programName }: Props) {
  const [playing, setPlaying] = useState(false)
  const embedUrl = resolveEmbedUrl(video)

  if (!embedUrl) return null

  return (
    <section className="flex flex-col gap-6" aria-labelledby="program-video-heading">
      <div className="flex flex-col gap-3 max-w-2xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          Video de presentación
        </span>
        <h2
          id="program-video-heading"
          className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance"
        >
          Mira de qué se trata antes de decidir.
        </h2>
      </div>

      <div className="relative w-full aspect-video overflow-hidden rounded-2xl border [border-color:var(--card-diplomado-border)] dark:border-border-color bg-(--card-diplomado-bg) shadow-xl">
        {playing ? (
          <iframe
            src={embedUrl}
            title={programName ? `Video de presentación: ${programName}` : 'Video de presentación'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full cursor-pointer"
            aria-label={programName ? `Reproducir el video de ${programName}` : 'Reproducir el video de presentación'}
          >
            {poster && (
              <span
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${poster})` }}
                aria-hidden="true"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/90 via-[var(--bg-primary)]/40 to-transparent" aria-hidden="true" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary text-[#0E1116] shadow-2xl shadow-secondary/40 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 translate-x-0.5" fill="currentColor" aria-hidden="true" />
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
