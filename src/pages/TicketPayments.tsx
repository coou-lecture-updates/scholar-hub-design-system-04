
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, DollarSign, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TicketPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Mock data for ticket payments since the table doesn't exist in Supabase
    const mockPayments = [
      {
        id: '1',
        payer_name: 'John Doe',
        email: 'john@example.com',
        amount: 5000,
        reference: 'TKT001',
        payment_date: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        payer_name: 'Jane Smith',
        email: 'jane@example.com',
        amount: 3000,
        reference: 'TKT002',
        payment_date: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending'
      }
    ];
    
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Ticket Payments</h1>
            <p className="text-gray-600">Manage and view ticket payment records</p>
          </div>
          <div className="w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && !payments.length ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-10">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Payments Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No payments match "${searchTerm}"`
                : "No payments have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map(payment => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{payment.payer_name}</CardTitle>
                  <CardDescription>{payment.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <Badge variant="secondary">
                      <DollarSign className="mr-2 h-4 w-4" />
                      ₦{payment.amount.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Calendar className="mr-2 inline-block h-4 w-4" />
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="mr-2 inline-block h-4 w-4" />
                    {new Date(payment.payment_date).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    <User className="mr-2 inline-block h-4 w-4" />
                    Reference: {payment.reference}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TicketPayments;
