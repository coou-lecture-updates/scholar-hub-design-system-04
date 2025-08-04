
export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  email: string;
  phone: string;
  name: string;
  tx_ref: string;
  redirect_url: string;
  event_id?: string;
  ticket_count?: number;
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data?: {
    link: string;
    reference: string;
  };
}

export class FlutterwaveService {
  private baseUrl = 'https://api.flutterwave.com/v3';
  
  async initiatePayment(paymentData: FlutterwavePaymentData): Promise<FlutterwaveResponse> {
    const response = await fetch('/api/flutterwave/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    return response.json();
  }
  
  async verifyPayment(transactionId: string): Promise<any> {
    const response = await fetch(`/api/flutterwave/verify/${transactionId}`, {
      method: 'GET',
    });
    
    return response.json();
  }
}

export const flutterwaveService = new FlutterwaveService();
