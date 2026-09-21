/**
 * Implementación del proveedor de pagos Wompi
 */

import type { PaymentProvider } from './payment-provider';
import type { CreatePaymentLinkParams, PaymentLink, TransactionStatus } from './types';
import { parseInvoiceIdFromRedirect } from './wompi-ids';

export class WompiProvider implements PaymentProvider {
  readonly name = 'wompi';

  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(options?: { secretKey?: string }) {
    const mode = process.env.NEXT_PUBLIC_MODE_WOMPI || 'production';
    this.baseUrl = `https://${mode}.wompi.co/v1`;
    this.secretKey = options?.secretKey || process.env.WOMPI_SECRET_KEY || '';

    if (!this.secretKey) {
      console.warn('⚠️ Clave de Wompi no configurada (WOMPI_SECRET_KEY)');
    }
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLink> {
    try {
      // Wompi payment_links no documenta 'metadata' - enviarlo puede causar 422
      const body: Record<string, unknown> = {
        name: params.name,
        description: params.description,
        single_use: true,
        collect_shipping: false,
        amount_in_cents: Math.round(params.amount * 100), // Convertir a centavos
        currency: 'COP',
        redirect_url: params.redirectUrl,
      };
      if (params.sku) {
        body.sku = params.sku;
      }
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

  async getPaymentLink(paymentLinkId: string): Promise<PaymentLink | null> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_links/${paymentLinkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        return null;
      }

      const data = await response.json();
      if (!data.data || !data.data.id) return null;

      const link = data.data;
      if (link.active === false) return null;

      return {
        id: link.id,
        url: `https://checkout.wompi.co/l/${link.id}`,
        expiresAt: link.expires_at,
      };
    } catch {
      return null;
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    const raw = await this.fetchTransaction(transactionId);
    return this.toTransactionStatus(raw);
  }

  async fetchTransaction(transactionId: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Error al obtener estado de transacción en Wompi: ${(errorData as { message?: string }).message || response.statusText}`,
      );
    }

    const data = await response.json();
    if (!data.data) {
      throw new Error('Respuesta inválida de Wompi: falta información de la transacción');
    }
    return data.data as Record<string, unknown>;
  }

  async listRecentApprovedTransactions(days = 14): Promise<TransactionStatus[]> {
    const today = new Date();
    const from = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    const fmt = (date: Date) => date.toISOString().slice(0, 10);

    const params = new URLSearchParams({
      from_date: fmt(from),
      until_date: fmt(today),
      status: 'APPROVED',
      page_size: '50',
      order: 'DESC',
    });

    const response = await fetch(`${this.baseUrl}/transactions?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      console.warn('Wompi list transactions failed:', response.status);
      return [];
    }

    const data = await response.json();
    const rows = (Array.isArray(data.data) ? data.data : []) as Record<string, unknown>[];
    return rows.map((row) => this.toTransactionStatus(row));
  }

  async findApprovedTransactionForPaymentLink(
    paymentLinkId?: string,
    invoiceId?: number,
  ): Promise<TransactionStatus | null> {
    if (!paymentLinkId && !invoiceId) return null;

    const rows = await this.listRecentApprovedTransactions();
    return (
      rows.find((row) => {
        if (paymentLinkId && row.paymentLinkId === paymentLinkId) return true;
        if (invoiceId && parseInvoiceIdFromRedirect(row.redirectUrl) === invoiceId) {
          return true;
        }
        return false;
      }) ?? null
    );
  }

  private toTransactionStatus(raw: Record<string, unknown>): TransactionStatus {
    const statusMap: Record<string, TransactionStatus['status']> = {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      DECLINED: 'DECLINED',
      VOIDED: 'VOIDED',
      ERROR: 'ERROR',
    };

    const paymentLink =
      (raw.payment_link_id as string | null | undefined) ||
      ((raw.payment_link as { id?: string } | undefined)?.id ?? null);

    return {
      id: String(raw.id ?? ''),
      status: statusMap[String(raw.status)] || 'ERROR',
      amount: Number(raw.amount_in_cents ?? 0) / 100,
      currency: (raw.currency as string) || 'COP',
      createdAt: String(raw.created_at ?? ''),
      updatedAt: String(raw.updated_at ?? raw.created_at ?? ''),
      metadata: raw.metadata as Record<string, unknown> | undefined,
      paymentLinkId: paymentLink,
      redirectUrl: (raw.redirect_url as string | null | undefined) ?? null,
      reference: (raw.reference as string | null | undefined) ?? null,
    };
  }
}

