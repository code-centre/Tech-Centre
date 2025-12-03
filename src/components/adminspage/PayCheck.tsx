// src/components/adminspage/PayCheck.tsx
'use client';

import { useState } from 'react';

interface PayCheckProps {
  studentId: string;
  enrollmentId: number;
  amount: number;
  onPaymentSuccess?: () => void;
}

export function PayCheck({ studentId, enrollmentId, amount, onPaymentSuccess }: PayCheckProps) {
  // const [amount, setAmount] = useState(amount > 0 ? amount.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [reference, setReference] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !enrollmentId) {
      alert('Por favor selecciona un estudiante válido');
      return;
    }

    try {
      // Aquí iría la lógica para procesar el pago en tu backend
      const paymentData = {
        studentId,
        enrollmentId,
        // amount: parseFloat(amount),
        paymentMethod,
        reference,
        date: new Date().toISOString()
      };

      console.log('Procesando pago:', paymentData);
      
      // Llamar a tu API para registrar el pago
      // const response = await fetch('/api/payments/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentData)
      // });
      
      // if (!response.ok) throw new Error('Error al procesar el pago');
      
      // Si todo sale bien, llamar a la función de éxito
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      
      // Resetear el formulario
      setPaymentMethod('transfer');
      setReference('');
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Ocurrió un error al procesar el pago. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="bg-bgCard rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Registrar Pago</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white mb-1">
            Monto
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            // onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-white mb-1">
            Método de pago
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="transfer">Transferencia</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
          </select>
        </div>

        {paymentMethod === 'transfer' && (
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-white mb-1">
              Número de referencia
            </label>
            <input
              type="text"
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: TRF-123456"
              className="w-full px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required={paymentMethod === 'transfer'}
            />
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Registrar Pago
          </button>
        </div>
      </form>
    </div>
  );
}