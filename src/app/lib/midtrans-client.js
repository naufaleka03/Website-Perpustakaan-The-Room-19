import midtransClient from 'midtrans-client';

export const createMidtransClient = () => {
  if (!process.env.MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured');
  }

  return new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  });
};

export async function createTransaction(params) {
  try {
    const client = createMidtransClient();
    
    // Ensure amount is a number
    const amount = typeof params.amount === 'string' 
      ? parseInt(params.amount, 10) 
      : params.amount;

    const transactionDetails = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        gross_amount: amount
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail || 'noreply@example.com',
        phone: params.customerPhone || '08111222333'
      },
      item_details: params.items,
      bank_transfer: {
        bank: 'bca'
      }
    };

    console.log('Sending transaction details:', JSON.stringify(transactionDetails, null, 2));
    
    const response = await client.charge(transactionDetails);
    console.log('Midtrans response:', response);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Midtrans transaction error:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Payment processing failed',
        code: error.httpStatusCode || 500
      }
    };
  }
}
