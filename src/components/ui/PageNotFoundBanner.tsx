import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PageNotFoundBannerProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const PageNotFoundBanner: React.FC<PageNotFoundBannerProps> = ({
  title = "Page Under Construction",
  description = "This page is currently being built and will be available soon.",
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          {showBackButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PageNotFoundBanner;