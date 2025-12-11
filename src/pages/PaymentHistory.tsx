import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Filter,
  Wallet,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useWallet } from '@/hooks/useWallet';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  reference?: string;
  created_at: string;
  metadata?: any;
}

interface Payment {
  id: string;
  amount: number;
  payment_reference: string;
  payment_type: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  email: string;
  full_name: string;
}

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'wallet' | 'payments'>('wallet');
  const { wallet, refetch } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch wallet transactions
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      setTransactions(txData || []);

      // Fetch payments
      const { data: payData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (payError) throw payError;
      setPayments(payData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'success':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const variants: Record<string, string> = {
      successful: 'bg-green-100 text-green-700',
      success: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return variants[normalizedStatus] || 'bg-gray-100 text-gray-700';
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.payment_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
            <p className="text-muted-foreground">View all your transactions and payment records</p>
          </div>
          <Button onClick={() => { fetchData(); refetch(); }} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-foreground">₦{wallet?.balance?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold text-green-600">₦{totalCredits.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ArrowDownCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Debits</p>
                  <p className="text-2xl font-bold text-red-600">₦{totalDebits.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <ArrowUpCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'wallet' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Wallet Transactions
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'payments' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Payment Records
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeTab === 'wallet' ? (
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credits</SelectItem>
                <SelectItem value="debit">Debits</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="wallet_funding">Wallet Funding</SelectItem>
                  <SelectItem value="event_ticket">Event Ticket</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeTab === 'wallet' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No wallet transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {tx.type === 'credit' ? (
                            <ArrowDownCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(tx.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                            {tx.reference && <span>• Ref: {tx.reference}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {tx.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No payment records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.payment_status)}
                        <div>
                          <p className="font-medium text-foreground">
                            {payment.payment_type === 'wallet_funding' ? 'Wallet Funding' : payment.payment_type}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(payment.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate max-w-[150px]">Ref: {payment.payment_reference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">₦{payment.amount.toLocaleString()}</p>
                        <Badge className={`text-xs ${getStatusBadge(payment.payment_status)}`}>
                          {payment.payment_status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentHistory;
