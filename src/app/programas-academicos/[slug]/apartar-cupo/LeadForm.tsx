'use client'

import { useState, FormEvent } from 'react'
import { createLead } from './actions'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface LeadFormProps {
  programId: number
  programSlug: string
}

interface FormData {
  name: string
  email: string
  whatsapp: string
  intent: string
  message: string
  consent: boolean
  company: string // honeypot
}

interface FormErrors {
  name?: string
  email?: string
  whatsapp?: string
  intent?: string
  submit?: string
}

export default function LeadForm({ programId, programSlug }: LeadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    intent: '',
    message: '',
    consent: false,
    company: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState(false)

  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case 'name':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'El nombre es requerido'
        }
        break
      case 'email':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'El correo electrónico es requerido'
        } else if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            return 'El correo electrónico no es válido'
          }
        }
        break
      case 'whatsapp':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'El WhatsApp es requerido'
        } else if (typeof value === 'string') {
          const phoneDigits = value.replace(/\D/g, '')
          if (phoneDigits.length < 8) {
            return 'El WhatsApp debe tener al menos 8 dígitos'
          }
        }
        break
      case 'intent':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'Debes seleccionar una opción'
        }
        break
    }
    return undefined
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    const fieldValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormErrors]
        return newErrors
      })
    }

    if (submitError) {
      setSubmitError(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const nameError = validateField('name', formData.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError

    const whatsappError = validateField('whatsapp', formData.whatsapp)
    if (whatsappError) newErrors.whatsapp = whatsappError

    const intentError = validateField('intent', formData.intent)
    if (intentError) newErrors.intent = intentError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSubmitError(null)

    try {
      const result = await createLead(formData, programId)

      if (result.success) {
        setIsSuccess(true)
        // Resetear formulario
        setFormData({
          name: '',
          email: '',
          whatsapp: '',
          intent: '',
          message: '',
          consent: false,
          company: ''
        })
      } else {
        setSubmitError(result.error || 'Ocurrió un error al procesar tu solicitud')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="card-background p-6 rounded-xl border border-border-color">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            ¡Listo! Tu cupo quedó apartado ✅
          </h3>
          <p className="text-text-muted mb-6">
            Te vamos a contactar por WhatsApp y correo con el temario, horarios y opciones de pago. 
            Mientras tanto, puedes ver los detalles del programa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/programas-academicos/${programSlug}`}
              className="btn-primary"
            >
              Ver detalles del programa
            </Link>
            <Link
              href="/programas-academicos"
              className="px-6 py-3 bg-transparent text-text-primary font-semibold rounded-lg border-2 border-border-color hover:bg-bg-secondary transition-colors"
            >
              Volver a programas
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-background p-5 md:p-6 rounded-xl border border-border-color">
      <h2 className="text-xl font-semibold text-text-primary mb-5">
        Aparta tu cupo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field */}
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
            Nombre completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border-2 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
              errors.name ? 'border-red-500' : 'border-border-color'
            }`}
            placeholder="Tu nombre completo"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border-2 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
              errors.email ? 'border-red-500' : 'border-border-color'
            }`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-text-primary mb-1">
            WhatsApp *
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border-2 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
              errors.whatsapp ? 'border-red-500' : 'border-border-color'
            }`}
            placeholder="300 123 4567"
          />
          {errors.whatsapp && (
            <p className="mt-1 text-sm text-red-500">{errors.whatsapp}</p>
          )}
        </div>

        {/* Intent */}
        <div>
          <label htmlFor="intent" className="block text-sm font-medium text-text-primary mb-1">
            ¿Qué te gustaría hacer? *
          </label>
          <select
            id="intent"
            name="intent"
            value={formData.intent}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border-2 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors ${
              errors.intent ? 'border-red-500' : 'border-border-color'
            }`}
          >
            <option value="">Selecciona una opción</option>
            <option value="Quiero resolver dudas antes de pagar">
              Quiero resolver dudas antes de pagar
            </option>
            <option value="Quiero conocer opciones de pago">
              Quiero conocer opciones de pago
            </option>
            <option value="Quiero confirmar si este programa es para mí">
              Quiero confirmar si este programa es para mí
            </option>
            <option value="Quiero apartar y me contactan">
              Quiero apartar y me contactan
            </option>
          </select>
          {errors.intent && (
            <p className="mt-1 text-sm text-red-500">{errors.intent}</p>
          )}
        </div>

        {/* Mensaje opcional - oculto por defecto */}
        {showMessage && (
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">
              Mensaje (opcional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border-2 border-border-color bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors resize-none"
              placeholder="Cuéntanos qué te interesa del programa..."
            />
          </div>
        )}

        {!showMessage && (
          <button
            type="button"
            onClick={() => setShowMessage(true)}
            className="text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            Agregar mensaje (opcional)
          </button>
        )}

        {/* Error de submit */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-500">{submitError}</p>
              <a
                href="https://wa.me/573005523872"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:underline mt-1 inline-block"
              >
                O escríbenos por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Botón submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Apartando...
            </span>
          ) : (
            'Apartar mi cupo'
          )}
        </button>

        <p className="text-xs text-text-muted text-center mb-2">
          Sin pago inmediato. Cupos limitados.
        </p>

        {/* Consentimiento debajo del botón */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 text-secondary border-border-color rounded focus:ring-secondary"
          />
          <label htmlFor="consent" className="text-xs text-text-muted leading-relaxed">
            Acepto que Tech Centre me contacte por WhatsApp y correo electrónico
          </label>
        </div>
      </form>
    </div>
  )
}
