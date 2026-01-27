'use client';

import { useState, useEffect } from "react"
import { X, MapPin, Loader2 } from "lucide-react"

interface Location {
  mapUrl: string
  description: string
  title: string
}

interface LocationModalEditingProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventData: {
    id: string
    title: string
    description: string
    mapUrl: string
  }
  onLocationCreate: (location: Location) => void
  onSaveLocation?: (location: Location) => Promise<{success: boolean, error?: string}>
}

const LocationModalEditing = ({ eventData, onClose, onLocationCreate, onSaveLocation, isOpen }: LocationModalEditingProps) => {
  const [name, setName] = useState(eventData?.title || "")
  const [mapUrl, setMapUrl] = useState(eventData?.mapUrl || "")
  const [description, setDescription] = useState(eventData?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [mapError, setMapError] = useState(false)
  
  useEffect(() => {
    if (eventData) {
      setName(eventData.title || '')
      setMapUrl(eventData.mapUrl || '')
      setDescription(eventData.description || '')
    }
  }, [eventData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    const locationData = {
      mapUrl,
      description,
      title: name,
    }
    
    try {
      // Si tenemos la función de guardado centralizada, la usamos
      if (onSaveLocation) {
        const result = await onSaveLocation(locationData)
        
        if (result.success) {
          // Notificamos la creación/actualización
          onLocationCreate(locationData)
          onClose()
        } else {
          setError(result.error || "Error al actualizar la ubicación")
        }
      } else {
        // Si no hay función centralizada, mostramos un error
        setError("No se ha proporcionado una función para guardar la ubicación")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar la ubicación"
      setError(errorMessage)
      console.error("Error updating location:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const extractGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`
  }

  const handleMapError = () => {
    setMapError(true)
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-bgCard rounded-lg w-full max-w-4xl overflow-hidden shadow-xl border border-zinc-800/30">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800/30">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <MapPin className="text-zuccini" />
            Editar Ubicación
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5 text-gray-300" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre de la Ubicación
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ej: Sede Principal"
                  required
                />
              </div>
              <div>
                <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  id="mapUrl"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ingresa la dirección completa"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white min-h-[100px]"
                  placeholder="Describe la ubicación"
                  required
                />
              </div>
              {error && <div className="text-red-200 text-sm p-2 bg-red-900/50 rounded">{error}</div>}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-zuccini text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-700/50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : "Guardar Ubicación"}
                </button>
              </div>
            </form>
          </div>
          <div className="h-[350px] bg-zinc-900 rounded-lg overflow-hidden">
            {mapUrl && !mapError ? (
              <iframe
                src={extractGoogleMapsUrl(mapUrl)}
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={handleMapError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <p>
                    {mapError
                      ? "No se pudo cargar el mapa. Por favor, verifica la dirección."
                      : "Ingresa una dirección para ver el mapa."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationModalEditing

