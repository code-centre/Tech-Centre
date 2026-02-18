/**
 * Factory para obtener el proveedor de pagos activo
 * Permite cambiar fácilmente entre proveedores mediante variables de entorno
 */

import type { PaymentProvider } from './payment-provider';
import type { PaymentProviderName } from './types';
import { WompiProvider } from './wompi-provider';

let cachedProvider: PaymentProvider | null = null;

/**
 * Obtiene el proveedor de pagos configurado
 * Por defecto usa Wompi si no se especifica otro
 * En servidor usa WOMPI_SECRET_KEY si está disponible (más seguro)
 */
export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerName = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'wompi') as PaymentProviderName;
  const serverKey = process.env.WOMPI_SECRET_KEY;

  switch (providerName) {
    case 'wompi':
      cachedProvider = new WompiProvider(
        serverKey ? { secretKey: serverKey } : undefined
      );
      break;
    
    // Aquí se pueden agregar otros proveedores en el futuro
    // case 'stripe':
    //   cachedProvider = new StripeProvider();
    //   break;
    // case 'paypal':
    //   cachedProvider = new PayPalProvider();
    //   break;
    
    default:
      console.warn(`⚠️ Proveedor de pagos "${providerName}" no está implementado. Usando Wompi por defecto.`);
      cachedProvider = new WompiProvider();
  }

  return cachedProvider;
}

/**
 * Resetea el proveedor en caché (útil para testing)
 */
export function resetPaymentProvider(): void {
  cachedProvider = null;
}

