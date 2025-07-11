import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request) {
  try {
    console.log('Environment check:', {
      hasServerKey: !!process.env.MIDTRANS_SERVER_KEY,
      serverKeyLength: process.env.MIDTRANS_SERVER_KEY?.length,
    });

    if (!process.env.MIDTRANS_SERVER_KEY) {
      console.log('Missing server key');
      throw new Error('Midtrans server key is not configured');
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    // Create Midtrans Core API instance
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });

    const parameter = {
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
      ...(body.paymentType === 'qris' && {
        payment_type: 'qris'
      })
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ 
      success: true, 
      data: {
        token: transaction.token,
        redirect_url: transaction.redirect_url
      }
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

export async function GET() {
  return NextResponse.json({ 
    hasServerKey: !!process.env.MIDTRANS_SERVER_KEY,
    hasClientKey: !!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  });
}