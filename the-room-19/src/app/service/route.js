import { PaymentService } from '@/services/payment';
import { NextResponse } from 'next/server';

const paymentService = new PaymentService();

export async function POST(request) {
  try {
    const body = await request.json();
    
    const transaction = await paymentService.createTransaction({
      paymentType: body.paymentType,
      orderId: `ORDER-${Date.now()}`,
      amount: body.amount,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      items: body.items
    });

    return NextResponse.json({ 
      success: true, 
      data: transaction 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}