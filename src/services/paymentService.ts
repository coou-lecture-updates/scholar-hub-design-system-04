import { supabase } from "@/integrations/supabase/client";

export interface PaymentRequest {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  provider: 'paystack' | 'flutterwave' | 'korapay';
  type: 'wallet_funding' | 'event_ticket' | 'general';
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    payment_url: string;
    reference: string;
  };
  error?: string;
}

export class EnhancedPaymentService {
  private generateReference(): string {
    return `COOU_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const reference = this.generateReference();
      
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          ...request,
          reference
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      };
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  async getPaymentGateways(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payment_gateway_config')
        .select('*')
        .eq('enabled', true)
        .order('provider');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Payment gateways error:', error);
      return [];
    }
  }
}

export const paymentService = new EnhancedPaymentService();