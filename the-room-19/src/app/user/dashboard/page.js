import PaymentForm from '@/components/payment/payment-summary';

export default function Page() {
    return (
      <div className="w-full h-screen bg-gray-500">
        <h1>Make a Payment</h1>
        <PaymentForm />
      </div>
    )
  }