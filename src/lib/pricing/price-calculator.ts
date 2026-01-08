/**
 * Calculadora centralizada de precios para checkout
 * Maneja lógica de contado (10% descuento) vs cuotas
 */

export interface PriceCalculationParams {
  basePrice: number; // Precio base del programa
  paymentMethod: 'full' | 'installments'; // Método de pago
  installments?: number; // Número de cuotas (solo si paymentMethod === 'installments')
  couponDiscount?: number; // Descuento del cupón (monto fijo)
  quantity?: number; // Cantidad (por defecto 1)
}

export interface PriceCalculationResult {
  subtotal: number; // Subtotal antes de descuentos
  paymentMethodDiscount: number; // Descuento por método de pago (10% si es contado)
  couponDiscount: number; // Descuento del cupón
  total: number; // Total final a pagar
  installmentAmount?: number; // Monto por cuota (solo si es a cuotas)
  savings?: number; // Ahorro total comparado con precio base
}

/**
 * Calcula el precio final según el método de pago y descuentos aplicados
 */
export function calculatePrice(params: PriceCalculationParams): PriceCalculationResult {
  const {
    basePrice,
    paymentMethod,
    installments = 1,
    couponDiscount = 0,
    quantity = 1,
  } = params;

  // Calcular subtotal base
  const subtotal = basePrice * quantity;

  // Calcular descuento por método de pago
  let paymentMethodDiscount = 0;
  let finalPrice = subtotal;

  if (paymentMethod === 'full') {
    // Pago de contado: 10% de descuento
    paymentMethodDiscount = Math.round(subtotal * 0.1);
    finalPrice = subtotal - paymentMethodDiscount;
  } else if (paymentMethod === 'installments' && installments > 1) {
    // Pago a cuotas: sin descuento adicional, solo dividir
    finalPrice = subtotal;
  }

  // Aplicar descuento del cupón
  const couponDiscountAmount = Math.min(couponDiscount, finalPrice);
  const total = Math.max(0, finalPrice - couponDiscountAmount);

  // Calcular monto por cuota si es a cuotas
  let installmentAmount: number | undefined;
  if (paymentMethod === 'installments' && installments > 1) {
    installmentAmount = Math.round(total / installments);
    // Ajustar la última cuota para que la suma sea exacta
    const totalFromInstallments = installmentAmount * installments;
    if (totalFromInstallments !== total) {
      // La diferencia se ajustará en la última cuota
      installmentAmount = Math.floor(total / installments);
    }
  }

  // Calcular ahorro total
  const savings = subtotal - total;

  return {
    subtotal,
    paymentMethodDiscount,
    couponDiscount: couponDiscountAmount,
    total,
    installmentAmount,
    savings: savings > 0 ? savings : undefined,
  };
}

/**
 * Calcula el monto de cada cuota considerando que la última puede ser diferente
 */
export function calculateInstallments(
  totalAmount: number,
  numberOfInstallments: number
): Array<{ number: number; amount: number; dueDate: string }> {
  if (numberOfInstallments <= 1) {
    return [
      {
        number: 1,
        amount: totalAmount,
        dueDate: new Date().toISOString().split('T')[0],
      },
    ];
  }

  const baseAmount = Math.floor(totalAmount / numberOfInstallments);
  const installments: Array<{ number: number; amount: number; dueDate: string }> = [];

  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);

    let amount: number;
    if (i === numberOfInstallments - 1) {
      // Última cuota: ajustar para que la suma sea exacta
      const previousPayments = baseAmount * (numberOfInstallments - 1);
      amount = totalAmount - previousPayments;
    } else {
      amount = baseAmount;
    }

    installments.push({
      number: i + 1,
      amount: Math.max(0, amount), // Asegurar que no sea negativo
      dueDate: dueDate.toISOString().split('T')[0],
    });
  }

  return installments;
}

