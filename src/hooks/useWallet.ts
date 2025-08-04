import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference?: string;
  event_id?: string;
  metadata?: any;
  created_at: string;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create wallet
      let { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([{ user_id: user.id, balance: 0 }])
          .select()
          .single();

        if (createError) throw createError;
        walletData = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      setWallet(walletData);
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error loading wallet",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data as WalletTransaction[]) || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error loading transactions",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (
    amount: number,
    type: 'credit' | 'debit',
    description: string,
    reference?: string,
    eventId?: string,
    metadata?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For debit transactions, check balance first
      if (type === 'debit' && wallet && wallet.balance < amount) {
        throw new Error(`Insufficient balance. You have ₦${wallet.balance.toLocaleString()} but need ₦${amount.toLocaleString()}`);
      }

      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
          type,
          description,
          reference,
          event_id: eventId,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh wallet and transactions after successful transaction
      setTimeout(() => {
        fetchWallet();
        fetchTransactions();
      }, 100);

      toast({
        title: "Transaction successful",
        description: `₦${Math.abs(amount).toLocaleString()} ${type === 'credit' ? 'added to' : 'deducted from'} your wallet`,
      });

      return data;
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkBalance = (requiredAmount: number): boolean => {
    return wallet ? wallet.balance >= requiredAmount : false;
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  // Set up real-time subscription for wallet updates
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const walletSubscription = supabase
          .channel('wallet-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'wallets',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchWallet();
            }
          )
          .subscribe();

        const transactionSubscription = supabase
          .channel('transaction-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'wallet_transactions',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchTransactions();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(walletSubscription);
          supabase.removeChannel(transactionSubscription);
        };
      }
    };

    setupSubscriptions();
  }, []);

  return {
    wallet,
    transactions,
    loading,
    fetchWallet,
    fetchTransactions,
    addTransaction,
    checkBalance,
    refetch: () => {
      fetchWallet();
      fetchTransactions();
    }
  };
};