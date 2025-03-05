import midtransClient from 'midtrans-client';

export const createMidtransClient = () => {
  return new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  });
};

// Helper function to generate transaction token
export async function generateTransactionToken(transactionDetails) {
  try {
    const response = await coreApi.charge(transactionDetails);
    return response;
  } catch (error) {
    console.error('Error generating transaction token:', error);
    throw error;
  }
}
