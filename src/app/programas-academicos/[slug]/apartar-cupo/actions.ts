'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface LeadFormData {
  name: string
  email: string
  whatsapp: string
  intent: string
  message?: string
  consent?: boolean
  company?: string // honeypot
}

interface ActionResult {
  success: boolean
  message?: string
  error?: string
}

function mapIntentToStage(intent: string): string {
  const mapping: Record<string, string> = {
    'Quiero resolver dudas antes de pagar': 'dudas',
    'Quiero conocer opciones de pago': 'pagos',
    'Quiero confirmar si este programa es para mí': 'confirmar',
    'Quiero apartar y me contactan': 'apartar'
  }
  return mapping[intent] || 'apartar'
}

function validateFormData(data: LeadFormData): { valid: boolean; error?: string } {
  // Validar honeypot primero
  if (data.company && data.company.trim() !== '') {
    // Es spam, retornar success sin insertar
    return { valid: false }
  }

  // Validar campos requeridos
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: 'El nombre es requerido' }
  }

  if (!data.email || data.email.trim() === '') {
    return { valid: false, error: 'El correo electrónico es requerido' }
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { valid: false, error: 'El correo electrónico no es válido' }
  }

  if (!data.whatsapp || data.whatsapp.trim() === '') {
    return { valid: false, error: 'El WhatsApp es requerido' }
  }

  // Validar WhatsApp: mínimo 8 dígitos (solo números)
  const phoneDigits = data.whatsapp.replace(/\D/g, '')
  if (phoneDigits.length < 8) {
    return { valid: false, error: 'El WhatsApp debe tener al menos 8 dígitos' }
  }

  if (!data.intent || data.intent.trim() === '') {
    return { valid: false, error: 'Debes seleccionar una opción' }
  }

  return { valid: true }
}

export async function createLead(
  formData: LeadFormData,
  programId: number
): Promise<ActionResult> {
  try {
    // Validar datos
    const validation = validateFormData(formData)
    if (!validation.valid) {
      // Si es honeypot, retornar success silenciosamente
      if (!validation.error) {
        return { success: true, message: 'Registro exitoso' }
      }
      return { success: false, error: validation.error }
    }

    // Validar que programId existe
    if (!programId || programId <= 0) {
      return { success: false, error: 'Programa no válido' }
    }

    const supabase = await createClient()

    // Verificar que el programa existe
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id')
      .eq('id', programId)
      .eq('is_active', true)
      .single()

    if (programError || !program) {
      return { success: false, error: 'Programa no encontrado' }
    }

    // Obtener headers para metadata
    const headersList = await headers()
    const referrer = headersList.get('referer') || null

    // Preparar datos para insertar
    const phoneDigits = formData.whatsapp.replace(/\D/g, '')
    const stage = mapIntentToStage(formData.intent)

    const notesData = {
      message: formData.message?.trim() || null,
      consent: formData.consent || false,
      metadata: {
        referrer,
        submittedAt: new Date().toISOString()
      }
    }

    // Insertar en la tabla leads
    const { data, error } = await supabase
      .from('leads')
      .insert({
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: phoneDigits,
        interested_program_id: programId,
        source: 'apartar_cupo_page',
        stage: stage,
        notes: JSON.stringify(notesData)
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting lead:', error)
      return { 
        success: false, 
        error: 'No pudimos registrar tu cupo. Intenta de nuevo o escríbenos por WhatsApp.' 
      }
    }

    return { 
      success: true, 
      message: '¡Tu cupo ha sido apartado exitosamente!' 
    }
  } catch (error) {
    console.error('Unexpected error creating lead:', error)
    return { 
      success: false, 
      error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.' 
    }
  }
}
