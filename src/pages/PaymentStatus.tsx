
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Clock, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addTransaction, fetchWallet } = useWallet();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('processing');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const reference = searchParams.get('ref');
  const status = searchParams.get('status');
  const provider = searchParams.get('provider');
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setPaymentStatus('failed');
        setIsLoading(false);
        return;
      }

      try {
        // Call verify payment function
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { reference, provider }
        });

        if (error) {
          console.error('Payment verification error:', error);
          setPaymentStatus('failed');
        } else if (data && data.success) {
          setPaymentStatus('success');
          setPaymentDetails(data.data);
          
          // If it's a successful wallet funding, add the transaction
          if (data.data.payment_type === 'wallet_funding' && data.data.status === 'successful') {
            try {
              await addTransaction(
                data.data.amount,
                'credit',
                `Wallet funding via ${provider}`,
                reference,
                undefined,
                { gateway: provider, funding: true, verified: true }
              );
              
              // Refresh wallet data
              await fetchWallet();
              
              toast({
                title: "Payment successful!",
                description: `₦${data.data.amount.toLocaleString()} has been added to your wallet`,
              });
            } catch (transactionError) {
              console.error('Transaction error:', transactionError);
            }
          }
        } else {
          setPaymentStatus('failed');
          setPaymentDetails({ status: 'failed', message: 'Payment verification failed' });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        setPaymentDetails({ status: 'failed', message: 'Payment verification failed' });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [reference, provider, addTransaction, fetchWallet, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <div className="h-8 w-8 rounded-full bg-blue-300"></div>
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <p className="mt-6 text-gray-600">Verifying payment status...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        {paymentStatus === 'success' ? (
          <>
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h1>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
            </div>
            
            {paymentDetails && (
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₦{paymentDetails.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(paymentDetails.date || paymentDetails.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentDetails.provider}</span>
                </div>
              </div>
            )}
            
            {paymentDetails?.purpose === 'event-ticket' && (
              <Button asChild className="w-full mt-6">
                <Link to={`/events/${paymentDetails.eventId}`}>
                  View Event Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            {paymentDetails?.purpose === 'fund-account' && (
              <Button asChild className="w-full mt-6">
                <Link to="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            {paymentDetails?.purpose === 'anonymous-upload' && (
              <Button asChild className="w-full mt-6">
                <Link to="/anonymous-message">
                  Go to Anonymous Message <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            {!paymentDetails?.purpose && (
              <Button asChild className="w-full mt-6">
                <Link to="/">
                  Return to Home <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">We couldn't process your payment. Please try again later.</p>
            </div>
            
            <div className="flex flex-col space-y-3 mt-6">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Try Again
              </Button>
              
              <Button asChild variant="ghost">
                <Link to="/">
                  Return to Home
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
