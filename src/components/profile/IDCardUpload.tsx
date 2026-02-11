'use client'

import { useState, useRef } from 'react'
import { Upload, X, Camera, FileText, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'

interface IDCardUploadProps {
  frontUrl?: string
  backUrl?: string
  onUpload: (side: 'front' | 'back', url: string) => Promise<void>
  onDelete: (side: 'front' | 'back') => Promise<void>
  loading?: boolean
}

export default function IDCardUpload({ 
  frontUrl, 
  backUrl, 
  onUpload, 
  onDelete,
  loading = false 
}: IDCardUploadProps) {
  const [dragActive, setDragActive] = useState<'front' | 'back' | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ front: number; back: number }>({ front: 0, back: 0 })
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido. Solo se aceptan JPG y PNG.')
      return false
    }

    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 5MB.')
      return false
    }

    return true
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const maxWidth = 1200
        const maxHeight = 900
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.85
          )
        } else {
          resolve(file)
        }
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (file: File, side: 'front' | 'back') => {
    if (!validateFile(file)) return

    try {
      setUploadProgress(prev => ({ ...prev, [side]: 10 }))
      
      const compressedFile = await compressImage(file)
      setUploadProgress(prev => ({ ...prev, [side]: 50 }))

      // This will be handled by the parent component
      // We'll use a temporary URL for preview
      const tempUrl = URL.createObjectURL(compressedFile)
      setUploadProgress(prev => ({ ...prev, [side]: 90 }))

      // Call parent upload function
      await onUpload(side, tempUrl)
      setUploadProgress(prev => ({ ...prev, [side]: 100 }))

      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [side]: 0 }))
        URL.revokeObjectURL(tempUrl)
      }, 1000)

    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir la imagen. Por favor inténtalo de nuevo.')
      setUploadProgress(prev => ({ ...prev, [side]: 0 }))
    }
  }

  const handleDrag = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(side)
    } else if (e.type === 'dragleave') {
      setDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file, side)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, side)
    }
  }

  const renderUploadArea = (side: 'front' | 'back', url?: string) => {
    const isActive = dragActive === side
    const progress = uploadProgress[side]
    const hasImage = url && url.trim() !== ''

    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-300">
          <FileText className="w-4 h-4" />
          {side === 'front' ? 'Frente de cédula' : 'Reverso de cédula'}
        </label>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
            isActive
              ? 'border-secondary bg-secondary/5'
              : 'border-border-color dark:border-gray-700/50 hover:border-secondary/50 bg-bg-secondary dark:bg-gray-800/30 dark:hover:border-gray-600/50'
          }`}
          onDragEnter={(e) => handleDrag(e, side)}
          onDragOver={(e) => handleDrag(e, side)}
          onDragLeave={(e) => handleDrag(e, side)}
          onDrop={(e) => handleDrop(e, side)}
        >
          {hasImage && !progress ? (
            // Preview mode
            <div className="relative group">
              <img
                src={url}
                alt={`${side === 'front' ? 'Frente' : 'Reverso'} de cédula`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => side === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()}
                  className="p-2 bg-secondary hover:bg-blue-600 rounded-full transition-colors"
                  disabled={loading}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onDelete(side)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  disabled={loading}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ) : progress > 0 ? (
            // Upload progress
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-muted dark:text-gray-400 text-sm">Subiendo imagen... {progress}%</p>
            </div>
          ) : (
            // Upload area
            <div className="flex flex-col items-center justify-center h-48 cursor-pointer"
                 onClick={() => side === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()}>
              <Upload className="w-12 h-12 text-text-muted dark:text-gray-500 mb-3" />
              <p className="text-text-muted dark:text-gray-400 text-sm text-center">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-text-muted dark:text-gray-500 text-xs mt-1 opacity-80">
                JPG, PNG (Máx. 5MB)
              </p>
            </div>
          )}

          <input
            ref={side === 'front' ? frontInputRef : backInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleInputChange(e, side)}
            className="hidden"
            disabled={loading}
          />
        </div>

        {hasImage && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <Check className="w-3 h-3" />
            <span>Imagen cargada correctamente</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderUploadArea('front', frontUrl)}
      {renderUploadArea('back', backUrl)}
    </div>
  )
}
