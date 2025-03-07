import PaymentForm from '@/components/payment/payment-ui';

export default function Page() {
    return (
      <div className="w-full h-screen bg-gray-500">
        <h1>Make a Payment</h1>
        <PaymentForm />
      </div>
    )
  }