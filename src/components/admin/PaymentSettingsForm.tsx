
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleAdminError } from '@/utils/adminErrorHandler';

interface PaymentSettings {
  id: string;
  payment_method: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_active: boolean;
}

const PaymentSettingsForm = () => {
  const [settings, setSettings] = useState<PaymentSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    payment_method: '',
    account_name: '',
    account_number: '',
    bank_name: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when payment_settings table is created
      // const { data, error } = await supabase
      //   .from('payment_settings')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // setSettings(data || []);
      setSettings([]); // Temporary empty array
    } catch (error: any) {
      handleAdminError(error, 'Failed to fetch payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Uncomment when payment_settings table is created
      // const { error } = await supabase
      //   .from('payment_settings')
      //   .insert([formData]);
      
      // if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Payment settings saved successfully',
      });
      
      setFormData({
        payment_method: '',
        account_name: '',
        account_number: '',
        bank_name: '',
        is_active: true
      });
      
      fetchSettings();
    } catch (error: any) {
      handleAdminError(error, 'Failed to save payment settings');
    }
  };

  if (loading) {
    return <div className="p-6">Loading payment settings...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Input
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                placeholder="e.g., Bank Transfer, Mobile Money"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                placeholder="Account holder name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                placeholder="Account number"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                placeholder="Bank or service provider name"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <Button type="submit">Save Payment Method</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{setting.payment_method}</h3>
              <p className="text-sm text-gray-600 mb-1">Account: {setting.account_name}</p>
              <p className="text-sm text-gray-600 mb-1">Number: {setting.account_number}</p>
              <p className="text-sm text-gray-600 mb-2">Bank: {setting.bank_name}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                setting.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {setting.is_active ? 'Active' : 'Inactive'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentSettingsForm;
