'use client'

import { User, Award, Users, TrendingUp } from 'lucide-react'

interface ProfileHeaderProps {
  completionPercentage: number
}

export default function ProfileHeader({ completionPercentage }: ProfileHeaderProps) {
  const benefits = [
    {
      icon: Award,
      text: 'Certificados personalizados'
    },
    {
      icon: Users,
      text: 'Acceso a comunidad'
    },
    {
      icon: TrendingUp,
      text: 'Seguimiento personalizado'
    }
  ]

  return (
    <div className="space-y-6 mb-8">
      {/* Title and Subcopy */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-text-primary dark:text-white flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <User className="text-secondary" size={24} />
          </div>
          Información personal
        </h2>
        <p className="text-text-muted dark:text-gray-400 text-sm">
          Completa tu perfil para obtener el máximo provecho de la plataforma
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary dark:text-gray-300 font-medium">Perfil: {completionPercentage}% completo</span>
          <span className="text-text-muted dark:text-gray-500">{completionPercentage}/100</span>
        </div>
        <div className="w-full h-2.5 bg-bg-secondary dark:bg-gray-800/50 rounded-full overflow-hidden border border-border-color dark:border-transparent">
          <div
            className="h-full bg-gradient-to-r from-secondary to-blue-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Benefits */}
      <div className="flex flex-wrap gap-3">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary dark:bg-gray-800/30 border border-border-color dark:border-gray-700/50 rounded-md text-xs text-text-primary dark:text-gray-300"
            >
              <Icon className="w-3.5 h-3.5 text-secondary" />
              <span>{benefit.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
