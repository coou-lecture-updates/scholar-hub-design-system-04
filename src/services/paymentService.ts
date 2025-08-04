
export interface PaymentConfig {
  publicKey: string;
  businessName: string;
  webhookUrl?: string;
  mode: 'live' | 'test';
}

export interface PaymentDetails {
  amount: number;
  email: string;
  name: string;
  phoneNumber?: string;
  reference: string;
  description: string;
  metadata?: Record<string, any>;
  redirectUrl?: string;
}

interface FlutterwaveConfig extends PaymentConfig {
  // Flutterwave specific config
  encryptionKey?: string;
}

interface KorapayConfig extends PaymentConfig {
  // Korapay specific config
  merchantId?: string;
}

// Store configs in localStorage
export const saveFlutterwaveConfig = (config: FlutterwaveConfig): void => {
  localStorage.setItem('flutterwaveConfig', JSON.stringify(config));
};

export const saveKorapayConfig = (config: KorapayConfig): void => {
  localStorage.setItem('korapayConfig', JSON.stringify(config));
};

export const getFlutterwaveConfig = (): FlutterwaveConfig | null => {
  const config = localStorage.getItem('flutterwaveConfig');
  return config ? JSON.parse(config) : null;
};

export const getKorapayConfig = (): KorapayConfig | null => {
  const config = localStorage.getItem('korapayConfig');
  return config ? JSON.parse(config) : null;
};

// Generate transaction reference
export const generateTransactionReference = (): string => {
  return 'COOU-' + Date.now().toString() + '-' + Math.floor(Math.random() * 10000);
};

// Initialize payment with Flutterwave 
// This is a placeholder - will be implemented with Supabase integration
export const initializeFlutterwavePayment = async (paymentDetails: PaymentDetails): Promise<string> => {
  // This would normally be an API call to Flutterwave
  // For now we'll just return a mock payment URL to be replaced with real implementation
  
  console.log('Initializing Flutterwave payment with:', paymentDetails);
  return `/payment/redirect?ref=${paymentDetails.reference}&status=pending&provider=flutterwave`;
};

// Initialize payment with Korapay
// This is a placeholder - will be implemented with Supabase integration
export const initializeKorapayPayment = async (paymentDetails: PaymentDetails): Promise<string> => {
  // This would normally be an API call to Korapay
  // For now we'll just return a mock payment URL to be replaced with real implementation
  
  console.log('Initializing Korapay payment with:', paymentDetails);
  return `/payment/redirect?ref=${paymentDetails.reference}&status=pending&provider=korapay`;
};

// Verify payment status
// This is a placeholder - will be implemented with Supabase integration
export const verifyPaymentStatus = async (reference: string, provider: 'flutterwave' | 'korapay'): Promise<{success: boolean, message: string, data?: any}> => {
  // This would normally be an API call to verify payment status
  // For now we'll just return a mock successful response
  
  console.log(`Verifying ${provider} payment with reference:`, reference);
  return {
    success: true,
    message: 'Payment verified successfully',
    data: {
      reference,
      amount: 500,
      status: 'successful',
      provider,
      date: new Date().toISOString(),
    }
  };
};

// Fund user account
// This is a placeholder - will be implemented with Supabase integration
export const fundUserAccount = async (userId: string, amount: number, reference: string): Promise<boolean> => {
  // This would normally update a user's balance in the database
  console.log(`Funding user ${userId} account with ${amount} NGN, reference: ${reference}`);
  return true;
};
