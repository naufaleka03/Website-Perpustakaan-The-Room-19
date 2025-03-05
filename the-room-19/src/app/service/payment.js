import { createMidtransClient } from '@/lib/midtrans';

export class PaymentService {
  constructor() {
    this.midtransClient = createMidtransClient();
  }

  async createTransaction(params) {
    try {
      const transactionDetails = {
        payment_type: params.paymentType,
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.amount
        },
        customer_details: {
          first_name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone
        },
        item_details: params.items
      };

      const response = await this.midtransClient.charge(transactionDetails);
      return response;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  }

  async getTransactionStatus(orderId) {
    try {
      const status = await this.midtransClient.transaction.status(orderId);
      return status;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }
}