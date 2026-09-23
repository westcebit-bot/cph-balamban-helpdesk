import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import { NotificationProvider } from './context/NotificationContext';
import { HeaderBrand } from './components/layout/HeaderBrand';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { TechDashboard } from './components/dashboards/TechDashboard';
import { DeptHeadDashboard } from './components/dashboards/DeptHeadDashboard';
import { EmployeeDashboard } from './components/dashboards/EmployeeDashboard';
import { TicketList } from './components/tickets/TicketList';
import { TicketForm } from './components/tickets/TicketForm';
import { AssetList } from './components/assets/AssetList';
import { ReportsModule } from './components/reports/ReportsModule';
import { AuditLogsList } from './components/audit/AuditLogsList';
import { SystemSettings } from './components/settings/SystemSettings';
import { Modal } from './components/ui/Modal';

const AppContent: React.FC = () => {
  const { role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (role === 'admin') return <AdminDashboard />;
        if (role === 'technician') return <TechDashboard />;
        if (role === 'supervisor') return <DeptHeadDashboard />;
        return <EmployeeDashboard onOpenNewTicket={() => setIsSubmitModalOpen(true)} />;

      case 'tickets':
        return <TicketList />;

      case 'submit-ticket':
        return (
          <TicketForm
            onSuccess={() => setCurrentTab('tickets')}
            onCancel={() => setCurrentTab('dashboard')}
          />
        );

      case 'tech-queue':
        return <TechDashboard />;

      case 'assets':
        return <AssetList />;

      case 'reports':
        return <ReportsModule />;

      case 'audit':
        return <AuditLogsList />;

      case 'settings':
        return <SystemSettings />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <HeaderBrand />
      <Navbar onOpenNewTicket={() => setIsSubmitModalOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 p-6 overflow-x-hidden min-h-[calc(100vh-8rem)]">
          {renderTabContent()}
        </main>
      </div>

      <Footer />

      {/* Global Quick Submit Modal */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Submit New IT Support Ticket"
          maxWidth="4xl"
        >
          <TicketForm
            onSuccess={() => {
              setIsSubmitModalOpen(false);
              setCurrentTab('tickets');
            }}
            onCancel={() => setIsSubmitModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TicketProvider>
          <AppContent />
        </TicketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
