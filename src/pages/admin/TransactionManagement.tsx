import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, DollarSign, Loader2, Download, ArrowUpRight, ArrowDownRight, CreditCard, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Payment {
  id: string;
  user_id: string | null;
  amount: number;
  payment_reference: string;
  payment_type: string;
  payment_status: string | null;
  payment_method: string | null;
  email: string;
  full_name: string;
  created_at: string;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  reference: string | null;
  created_at: string;
}

const TransactionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch all payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    }
  });

  // Fetch all wallet transactions
  const { data: walletTransactions, isLoading: walletLoading } = useQuery({
    queryKey: ['admin-wallet-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WalletTransaction[];
    }
  });

  // Filter payments
  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all') matchesStatus = payment.payment_status === statusFilter;
    
    let matchesType = true;
    if (typeFilter !== 'all') matchesType = payment.payment_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter wallet transactions
  const filteredWalletTransactions = walletTransactions?.filter(tx => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    let matchesType = true;
    if (typeFilter !== 'all') matchesType = tx.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const paymentStats = {
    total: payments?.length || 0,
    successful: payments?.filter(p => p.payment_status === 'successful').length || 0,
    pending: payments?.filter(p => p.payment_status === 'pending').length || 0,
    failed: payments?.filter(p => p.payment_status === 'failed').length || 0,
    totalAmount: payments?.filter(p => p.payment_status === 'successful').reduce((sum, p) => sum + p.amount, 0) || 0,
  };

  const walletStats = {
    totalCredits: walletTransactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0,
    totalDebits: walletTransactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) || 0,
    totalTransactions: walletTransactions?.length || 0,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'successful':
        return <Badge className="bg-green-100 text-green-800">Successful</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const isLoading = paymentsLoading || walletLoading;

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Transaction Management</h1>
          <p className="text-muted-foreground">View and manage all payments and wallet transactions</p>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6 mt-6">
            {/* Payment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Payments</div>
                  <div className="text-2xl font-bold text-foreground">{paymentStats.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Successful</div>
                  <div className="text-2xl font-bold text-green-600">{paymentStats.successful}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Failed</div>
                  <div className="text-2xl font-bold text-destructive">{paymentStats.failed}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-2xl font-bold text-primary">₦{paymentStats.totalAmount.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, name, or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
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
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{payment.full_name}</div>
                              <div className="text-xs text-muted-foreground">{payment.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.payment_reference.slice(0, 20)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.payment_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.payment_method || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₦{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.payment_status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6 mt-6">
            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                    Total Credits
                  </div>
                  <div className="text-2xl font-bold text-green-600">₦{walletStats.totalCredits.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                    Total Debits
                  </div>
                  <div className="text-2xl font-bold text-destructive">₦{walletStats.totalDebits.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                  <div className="text-2xl font-bold text-foreground">{walletStats.totalTransactions}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by description or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credits</SelectItem>
                      <SelectItem value="debit">Debits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Transactions Table */}
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWalletTransactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWalletTransactions?.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium text-foreground">
                            {tx.description}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {tx.reference ? tx.reference.slice(0, 20) + '...' : '-'}
                          </TableCell>
                          <TableCell>
                            {tx.type === 'credit' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                Credit
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Debit
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={`font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-destructive'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TransactionManagement;
