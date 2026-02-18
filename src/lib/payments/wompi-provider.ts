/**
 * Implementación del proveedor de pagos Wompi
 */

import type { PaymentProvider } from './payment-provider';
import type { CreatePaymentLinkParams, PaymentLink, TransactionStatus } from './types';

export class WompiProvider implements PaymentProvider {
  readonly name = 'wompi';

  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(options?: { secretKey?: string }) {
    const mode = process.env.NEXT_PUBLIC_MODE_WOMPI || 'production';
    this.baseUrl = `https://${mode}.wompi.co/v1`;
    this.secretKey =
      options?.secretKey ||
      process.env.WOMPI_SECRET_KEY ||
      process.env.NEXT_PUBLIC_WOMPI_SECRET_KEY ||
      '';

    if (!this.secretKey) {
      console.warn('⚠️ Clave de Wompi no configurada (WOMPI_SECRET_KEY o NEXT_PUBLIC_WOMPI_SECRET_KEY)');
    }
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLink> {
    try {
      // Wompi payment_links no documenta 'metadata' - enviarlo puede causar 422
      const body = {
        name: params.name,
        description: params.description,
        single_use: true,
        collect_shipping: false,
        amount_in_cents: Math.round(params.amount * 100), // Convertir a centavos
        currency: 'COP',
        redirect_url: params.redirectUrl,
      };
      const response = await fetch(`${this.baseUrl}/payment_links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al crear link de pago en Wompi:', errorData);
        const errMsg = (errorData as { error?: { messages?: Record<string, string[]> } }).error?.messages
          ? JSON.stringify((errorData as { error: { messages: Record<string, string[]> } }).error.messages)
          : (errorData as { message?: string }).message || response.statusText;
        throw new Error(
          `Error al crear link de pago en Wompi: ${errMsg}`
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

