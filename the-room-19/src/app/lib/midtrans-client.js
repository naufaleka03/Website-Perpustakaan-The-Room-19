import midtransClient from 'midtrans-client';

const createMidtransClient = () => {
  return new midtransClient.CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });
};

export async function createTransaction(params) {
  const client = createMidtransClient();
  
  try {
    const transactionDetails = {
      payment_type: params.paymentType,
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        gross_amount: params.amount
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone
      },
      item_details: params.items,
      // Add specific payment details based on payment type
      ...(params.paymentType === 'credit_card' && {
        credit_card: {
          secure: true
        }
      }),
      ...(params.paymentType === 'bank_transfer' && {
        bank_transfer: {
          bank: params.bank
        }
      })
    };

    const response = await client.charge(transactionDetails);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Midtrans transaction error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.httpStatusCode
      }
    };
  }
}
