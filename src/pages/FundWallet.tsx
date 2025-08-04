import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FundWallet from '@/components/wallet/FundWallet';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FundWalletPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/wallet">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fund Wallet</h1>
            <p className="text-muted-foreground">Add money to your wallet securely</p>
          </div>
        </div>

        {/* Fund Wallet Component */}
        <FundWallet />
      </div>
    </DashboardLayout>
  );
};

export default FundWalletPage;