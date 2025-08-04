export interface PaystackPaymentData {
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  reference: string;
  callback_url: string;
  metadata?: any;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export class PaystackService {
  private baseUrl = 'https://api.paystack.co';
  
  async initiatePayment(paymentData: PaystackPaymentData): Promise<PaystackResponse> {
    const response = await fetch('/api/paystack/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    return response.json();
  }
  
  async verifyPayment(reference: string): Promise<any> {
    const response = await fetch(`/api/paystack/verify/${reference}`, {
      method: 'GET',
    });
    
    return response.json();
  }
}

export const paystackService = new PaystackService();