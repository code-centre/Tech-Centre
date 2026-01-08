/**
 * Implementación del proveedor de pagos Wompi
 */

import type { PaymentProvider } from './payment-provider';
import type { CreatePaymentLinkParams, PaymentLink, TransactionStatus } from './types';

export class WompiProvider implements PaymentProvider {
  readonly name = 'wompi';
  
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor() {
    const mode = process.env.NEXT_PUBLIC_MODE_WOMPI || 'production';
    this.baseUrl = `https://${mode}.wompi.co/v1`;
    this.secretKey = process.env.NEXT_PUBLIC_WOMPI_SECRET_KEY || '';

    if (!this.secretKey) {
      console.warn('⚠️ NEXT_PUBLIC_WOMPI_SECRET_KEY no está configurada');
    }
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLink> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          name: params.name,
          description: params.description,
          single_use: true,
          collect_shipping: false,
          amount_in_cents: Math.round(params.amount * 100), // Convertir a centavos
          currency: 'COP',
          redirect_url: params.redirectUrl,
          ...(params.metadata && { metadata: params.metadata }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al crear link de pago en Wompi:', errorData);
        throw new Error(
          `Error al crear link de pago en Wompi: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.data || !data.data.id) {
        throw new Error('Respuesta inválida de Wompi: falta el ID del link de pago');
      }

      return {
        id: data.data.id,
        url: `https://checkout.wompi.co/l/${data.data.id}`,
        expiresAt: data.data.expires_at,
      };
    } catch (error) {
      console.error('Error en WompiProvider.createPaymentLink:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al crear link de pago');
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Error al obtener estado de transacción en Wompi: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.data) {
        throw new Error('Respuesta inválida de Wompi: falta información de la transacción');
      }

      // Mapear estados de Wompi a nuestros estados estándar
      const statusMap: Record<string, TransactionStatus['status']> = {
        'PENDING': 'PENDING',
        'APPROVED': 'APPROVED',
        'DECLINED': 'DECLINED',
        'VOIDED': 'VOIDED',
        'ERROR': 'ERROR',
      };

      return {
        id: data.data.id,
        status: statusMap[data.data.status] || 'ERROR',
        amount: data.data.amount_in_cents / 100, // Convertir de centavos a pesos
        currency: data.data.currency || 'COP',
        createdAt: data.data.created_at,
        updatedAt: data.data.updated_at || data.data.created_at,
        metadata: data.data.metadata,
      };
    } catch (error) {
      console.error('Error en WompiProvider.getTransactionStatus:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error desconocido al obtener estado de transacción');
    }
  }
}

