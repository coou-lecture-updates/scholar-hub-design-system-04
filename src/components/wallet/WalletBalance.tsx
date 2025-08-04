import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';

interface WalletBalanceProps {
  showActions?: boolean;
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  showActions = true, 
  className = "" 
}) => {
  const { wallet, loading } = useWallet();

  if (loading) {
    return (
      <Card className={`bg-gradient-to-r from-primary/10 to-primary/5 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <div className="h-6 w-20 bg-muted/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = wallet?.balance || 0;

  return (
    <Card className={`bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  ₦{balance.toLocaleString()}
                </span>
                {balance < 2000 && (
                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                    Low Balance
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Button 
                asChild 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
              >
                <Link to="/wallet/fund">
                  <Plus className="h-4 w-4 mr-1" />
                  Fund
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="border-primary/20 hover:bg-primary/5"
              >
                <Link to="/wallet">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;