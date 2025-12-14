import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Megaphone, Sparkles, Target } from 'lucide-react';

interface DemoAdCardsProps {
  onCreateAd: () => void;
}

export const DemoAdCards: React.FC<DemoAdCardsProps> = ({ onCreateAd }) => {
  return (
    <div className="space-y-4">
      {/* Text-only Demo Ad */}
      <Card className="bg-white p-4 border-2 border-primary/60 hover:border-primary hover:shadow-lg transition-all">
        <div className="flex items-start gap-1 mb-2">
          <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
            Sponsored
          </Badge>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              📢 Place Your Ad Here!
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Reach thousands of COOU students daily! Promote your business, event, or service 
            to the university community. Get your message seen where students are most active.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-primary">
              <Target className="h-3 w-3" />
              <span className="text-xs font-medium">Starting from ₦1,000</span>
            </div>
            <Button size="sm" variant="default" onClick={onCreateAd} className="gap-1">
              <Sparkles className="h-3 w-3" />
              Create Your Ad
            </Button>
          </div>
        </div>
      </Card>

      {/* Text + Image Demo Ad */}
      <Card className="bg-white p-4 border-2 border-primary/60 hover:border-primary hover:shadow-lg transition-all">
        <div className="flex items-start gap-1 mb-2">
          <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
            Sponsored
          </Badge>
        </div>
        
        <div className="flex gap-3">
          {/* Placeholder promotional image */}
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex-shrink-0 flex items-center justify-center">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
              🚀 Boost Your Visibility Today!
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              Your ad could be here! Connect with students, promote events, or grow your business on campus.
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-primary">
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">coouconnect.app/ads</span>
              </div>
              <Button size="sm" variant="outline" onClick={onCreateAd} className="text-xs h-7">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
