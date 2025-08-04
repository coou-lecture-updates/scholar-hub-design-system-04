import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';

const WalletBalanceNav: React.FC = () => {
  const { wallet, loading } = useWallet();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-muted/50 rounded animate-pulse" />
      </div>
    );
  }

  const balance = wallet?.balance || 0;

  return (
    <div className="flex items-center gap-2">
      <Link to="/wallet" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            ₦{balance.toLocaleString()}
          </span>
          {balance < 2000 && (
            <Badge variant="outline" className="text-xs ml-1 border-yellow-500 text-yellow-600">
              Low
            </Badge>
          )}
        </div>
      </Link>
      
      <Button asChild size="sm" variant="outline" className="hidden md:flex">
        <Link to="/wallet/fund">
          <Plus className="h-3 w-3 mr-1" />
          Fund
        </Link>
      </Button>
    </div>
  );
};

export default WalletBalanceNav;