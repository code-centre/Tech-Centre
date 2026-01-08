/**
 * Servicio para validar y aplicar cupones de descuento
 */

import { createClient } from '@/lib/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  program_id: number;
  discount_percent: number | null;
  discount_amount: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  max_uses: number | null;
  current_uses: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number; // Monto del descuento calculado
}

/**
 * Valida un cupón de descuento para un programa específico
 */
export async function validateCoupon(
  code: string,
  programId: number,
  subtotal: number
): Promise<CouponValidationResult> {
  const supabase = createClient();

  try {
    // Buscar el cupón por código y programa
    const { data: coupon, error } = await supabase
      .from('discount_coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('program_id', programId)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return {
        valid: false,
        error: 'Código de descuento no válido o no encontrado',
      };
    }

    // Validar fechas
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return {
        valid: false,
        error: `Este cupón será válido a partir del ${validFrom.toLocaleDateString()}`,
      };
    }

    if (now > validUntil) {
      return {
        valid: false,
        error: 'Este cupón ha expirado',
      };
    }

    // Validar usos máximos
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return {
        valid: false,
        error: 'Este cupón ha alcanzado su límite de usos',
      };
    }

    // Calcular el monto del descuento
    let discountAmount = 0;

    if (coupon.discount_percent !== null && coupon.discount_percent > 0) {
      // Descuento por porcentaje
      discountAmount = Math.round((subtotal * coupon.discount_percent) / 100);
    } else if (coupon.discount_amount !== null && coupon.discount_amount > 0) {
      // Descuento por monto fijo
      discountAmount = coupon.discount_amount;
    }

    // Asegurar que el descuento no sea mayor que el subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return {
      valid: true,
      coupon: coupon as Coupon,
      discountAmount,
    };
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return {
      valid: false,
      error: 'Error al validar el cupón. Por favor, intenta de nuevo.',
    };
  }
}

/**
 * Incrementa el contador de usos de un cupón
 */
export async function incrementCouponUses(couponId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Obtener el cupón actual
    const { data: coupon, error: fetchError } = await supabase
      .from('discount_coupons')
      .select('current_uses')
      .eq('id', couponId)
      .single();

    if (fetchError || !coupon) {
      console.error('Error al obtener cupón:', fetchError);
      return false;
    }

    // Incrementar el contador
    const { error: updateError } = await supabase
      .from('discount_coupons')
      .update({ 
        current_uses: (coupon.current_uses || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', couponId);

    if (updateError) {
      console.error('Error al incrementar usos del cupón:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al incrementar usos del cupón:', error);
    return false;
  }
}

