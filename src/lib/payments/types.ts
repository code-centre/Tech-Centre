/**
 * Tipos compartidos para el sistema de pagos agnóstico
 */

export interface CreatePaymentLinkParams {
  amount: number; // Monto en COP
  name: string; // Nombre del producto/servicio
  description: string; // Descripción del pago
  redirectUrl: string; // URL de redirección después del pago
  metadata?: Record<string, any>; // Metadatos adicionales
}

export interface PaymentLink {
  id: string; // ID del link de pago
  url: string; // URL para redirigir al usuario
  expiresAt?: string; // Fecha de expiración (opcional)
}

export interface TransactionStatus {
  id: string; // ID de la transacción
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  amount: number; // Monto de la transacción
  currency: string; // Moneda (ej: 'COP')
  createdAt: string; // Fecha de creación
  updatedAt: string; // Fecha de actualización
  metadata?: Record<string, any>; // Metadatos adicionales
}

export type PaymentProviderName = 'wompi' | 'stripe' | 'paypal';

