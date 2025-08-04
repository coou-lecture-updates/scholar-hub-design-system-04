import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

interface WalletStatusCardProps {
  className?: string;
  showTransactions?: boolean;
  compact?: boolean;
}

const WalletStatusCard: React.FC<WalletStatusCardProps> = ({
  className = '',
  showTransactions = false,
  compact = false
}) => {
  const { wallet, transactions, loading } = useWallet();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = wallet?.balance || 0;
  const recentTransactions = transactions.slice(0, 3);
  const isLowBalance = balance < 1000;

  if (compact) {
    return (
      <Card className={`${className} ${isLowBalance ? 'border-destructive/20 bg-destructive/5' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isLowBalance ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <Wallet className={`h-4 w-4 ${isLowBalance ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">₦{balance.toLocaleString()}</span>
                {isLowBalance && <AlertCircle className="h-3 w-3 text-destructive" />}
              </div>
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Balance Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isLowBalance ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                <Wallet className={`h-6 w-6 ${isLowBalance ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Wallet Balance</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">₦{balance.toLocaleString()}</span>
                  {isLowBalance && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">Low Balance</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Fund Wallet
            </Button>
          </div>

          {/* Low Balance Warning */}
          {isLowBalance && (
            <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
              <p className="text-sm text-destructive">
                Your wallet balance is running low. Consider funding your wallet to avoid disruptions 
                when creating paid events or making purchases.
              </p>
            </div>
          )}

          {/* Recent Transactions */}
          {showTransactions && recentTransactions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Transactions</h4>
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-muted/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₦{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletStatusCard;