'use client'

import { useState } from 'react'
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { quickSignUp } from '@/lib/auth/quick-signup'
import { useRouter } from 'next/navigation'

interface Props {
  onSuccess: () => void
  onCancel?: () => void
}

export default function QuickSignUp({ onSuccess, onCancel }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validaciones
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico')
      return
    }

    if (!email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido')
      return
    }

    if (!password) {
      setError('Por favor, ingresa una contraseña')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const result = await quickSignUp(email.trim(), password)

      if (!result.success) {
        setError(result.error || 'Error al crear la cuenta')
        return
      }

      setSuccess(true)

      // Refrescar la página para actualizar el estado del usuario
      // Esperar un momento para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        router.refresh()
        onSuccess()
      }, 1000)
    } catch (err) {
      console.error('Error en QuickSignUp:', err)
      setError(
        err instanceof Error ? err.message : 'Error al crear la cuenta'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-full max-w-md p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Crear cuenta rápida
          </h2>
          <p className="text-gray-400 text-sm">
            Ingresa tu correo y contraseña para continuar con tu compra. Podrás completar tu perfil después.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-4 bg-emerald-500/20 rounded-full">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-semibold text-center">
              ¡Cuenta creada exitosamente!
            </p>
            <p className="text-gray-400 text-sm text-center">
              Redirigiendo...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <Mail className="w-4 h-4" />
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent transition-all"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"
              >
                <Lock className="w-4 h-4" />
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword}
                className="flex-1 px-4 py-3 bg-blueApp hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  'Crear cuenta y continuar'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

