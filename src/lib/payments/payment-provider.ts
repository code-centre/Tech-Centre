/**
 * Interfaz base para proveedores de pago
 * Permite cambiar fácilmente entre diferentes proveedores (Wompi, Stripe, PayPal, etc.)
 */

import type { CreatePaymentLinkParams, PaymentLink, TransactionStatus } from './types';

export interface PaymentProvider {
  /**
   * Crea un link de pago para redirigir al usuario
   */
  createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLink>;

  /**
   * Obtiene un link de pago existente por ID (si el proveedor lo soporta)
   */
  getPaymentLink?(paymentLinkId: string): Promise<PaymentLink | null>;

  /**
   * Obtiene el estado de una transacción
   */
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;

  /**
   * Nombre del proveedor (para logging y debugging)
   */
  readonly name: string;
}

