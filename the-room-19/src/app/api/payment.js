import { NextResponse } from 'next/server';
import { createMidtransClient } from '@/lib/midtrans-client';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Create transaction using server-side only client
    const client = createMidtransClient();
    
    const transactionDetails = {
      payment_type: body.paymentType,
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        gross_amount: body.amount
      },
      customer_details: {
        first_name: body.customerName,
        email: body.customerEmail,
        phone: body.customerPhone
      },
      item_details: body.items,
      ...(body.paymentType === 'bank_transfer' && {
        bank_transfer: {
          bank: body.bank
        }
      })
    };

    const response = await client.charge(transactionDetails);
    
    return NextResponse.json({ 
      success: true, 
      data: response 
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: error.httpStatusCode || 500 
    });
  }
}

const STATUS_MAPPING = {
  'pending': 'Pending',
  'settlement': 'Success',
  'capture': 'Success',
  'deny': 'Failed',
  'cancel': 'Cancelled',
  'expire': 'Expired'
};