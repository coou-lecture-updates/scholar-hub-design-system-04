import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TicketRecovery from '@/components/payment/TicketRecovery';

const TicketRecoveryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Recovery</h1>
          <p className="text-muted-foreground">Recover your event tickets using your email or recovery token</p>
        </div>

        <TicketRecovery />
      </div>
    </DashboardLayout>
  );
};

export default TicketRecoveryPage;