import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  Wallet, 
  ArrowRight,
  Sparkles,
  Users,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';

const CreateEventCTA: React.FC = () => {
  const { userProfile } = useAuth();
  const { wallet } = useWallet();
  
  const userRole = userProfile?.role || 'user';
  const canCreateEvents = userRole === 'admin' || userRole === 'moderator';
  const hasBalance = (wallet?.balance || 0) >= 2000;

  if (!canCreateEvents) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 border-primary/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Create Events</h3>
                  <Badge variant="secondary" className="text-xs">
                    {userRole === 'admin' ? 'Admin Access' : 'Moderator Access'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {userRole === 'admin' 
                  ? 'Create, manage, and organize campus events' 
                  : 'Create and manage your own events'}
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-primary/60" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Free Events</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Paid Events</span>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="p-3 bg-background/50 rounded-lg border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">₦{wallet?.balance?.toLocaleString() || '0'}</span>
                {!hasBalance && (
                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                    Low Balance
                  </Badge>
                )}
              </div>
            </div>
            {!hasBalance && (
              <p className="text-xs text-yellow-600 mt-1">
                ₦2,000 required for paid events
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild className="flex-1 gap-2">
              <Link to="/admin/events">
                <Plus className="h-4 w-4" />
                Create Event
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="pt-2 border-t border-primary/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Event Management</span>
              <span className="flex items-center gap-1">
                {userRole === 'admin' ? 'Full Access' : 'Create Only'}
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateEventCTA;