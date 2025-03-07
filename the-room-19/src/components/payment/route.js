import { PaymentService } from '@/services/payment';
import { NextResponse } from 'next/server';
import { validatePaymentRequest } from '@/lib/validators';

const paymentService = new PaymentService();

const testData = {
  paymentType: 'credit_card',
  amount: 100000,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '08123456789',
  items: [
    {
      id: 'item1',
      price: 50000,
      quantity: 2,
      name: 'Library Membership'
    }
  ]
};

const validatePaymentParams = (params) => {
  const required = ['paymentType', 'amount', 'customerName', 'customerEmail'];
  const missing = required.filter(field => !params[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (params.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate request
    const validation = validatePaymentRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request',
        details: validation.errors 
      }, { status: 400 });
    }

    // Create transaction
    const transaction = await paymentService.createTransaction({
      paymentType: body.paymentType,
      amount: body.amount,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      items: body.items,
      bank: body.bank // Add bank if needed
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        transactionId: transaction.transaction_id,
        paymentUrl: transaction.redirect_url,
        status: transaction.status_message
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code || 'PAYMENT_ERROR'
    }, { 
      status: error.statusCode || 500 
    });
  }
}