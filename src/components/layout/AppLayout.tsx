
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { NotificationProvider } from '@/components/ui/notifications';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NotificationProvider>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </NotificationProvider>
    </div>
  );
};

export default AppLayout;
