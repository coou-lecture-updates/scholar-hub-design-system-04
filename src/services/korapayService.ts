
export interface KorapayPaymentData {
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  merchant_bears_cost: boolean;
  reference: string;
  narration: string;
  redirect_url: string;
  metadata?: any;
}

export interface KorapayResponse {
  status: boolean;
  message: string;
  data?: {
    checkout_url: string;
    reference: string;
  };
}

export class KorapayService {
  private baseUrl = 'https://api.korapay.com/merchant/api/v1';
  
  async initiatePayment(paymentData: KorapayPaymentData): Promise<KorapayResponse> {
    const response = await fetch('/api/korapay/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    return response.json();
  }
  
  async verifyPayment(reference: string): Promise<any> {
    const response = await fetch(`/api/korapay/verify/${reference}`, {
      method: 'GET',
    });
    
    return response.json();
  }
}

export const korapayService = new KorapayService();
