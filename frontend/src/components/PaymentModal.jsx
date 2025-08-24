'use client';

import React, { useState } from 'react';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  description, 
  onSuccess, 
  onError 
}) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call success callback
      onSuccess?.({
        paymentId: `pay_${Date.now()}`,
        amount,
        method: paymentMethod,
        status: 'completed'
      });
      
      onClose();
    } catch (error) {
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={processing}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">{description}</p>
          <p className="text-2xl font-bold text-blue-600">${amount}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={processing}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        {paymentMethod === 'card' && (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={processing}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
                disabled={processing}
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
                disabled={processing}
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={processing}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay $${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;