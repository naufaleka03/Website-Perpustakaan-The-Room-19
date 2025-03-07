'use client';

import { useState } from 'react';

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    paymentType: 'credit_card',
    amount: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ id: 'item1', price: 50000, quantity: 1, name: 'Library Membership' }],
    bank: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/payment-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        alert(`Transaction successful! Redirecting to: ${result.data.paymentUrl}`);
        window.location.href = result.data.paymentUrl;
      } else {
        alert(`Transaction failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing the payment.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="customerName" placeholder="Name" value={formData.customerName} onChange={handleChange} required />
      <input type="email" name="customerEmail" placeholder="Email" value={formData.customerEmail} onChange={handleChange} required />
      <input type="tel" name="customerPhone" placeholder="Phone" value={formData.customerPhone} onChange={handleChange} required />
      <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
      <select name="paymentType" value={formData.paymentType} onChange={handleChange}>
        <option value="credit_card">Credit Card</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="mandiri_bill">Mandiri Bill</option>
      </select>
      {formData.paymentType === 'bank_transfer' && (
        <select name="bank" value={formData.bank} onChange={handleChange}>
          <option value="">Select Bank</option>
          <option value="bca">BCA</option>
          <option value="bni">BNI</option>
          <option value="bri">BRI</option>
        </select>
      )}
      <button type="submit">Pay Now</button>
    </form>
  );
}
