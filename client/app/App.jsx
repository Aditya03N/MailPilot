import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import { AssistantLayout } from './layouts/AssistantLayout';
import { ClientLayout } from './layouts/ClientLayout';

// Pages
import { Login } from './pages/auth/Login';
import { ClientLogin } from './pages/auth/ClientLogin';
import { Register } from './pages/auth/Register';
import { AssistantOnboarding } from './pages/onboarding/AssistantOnboarding';
import { ClientOnboarding } from './pages/onboarding/ClientOnboarding';
import { AssistantDashboard } from './pages/assistant/AssistantDashboard';
import { InboxList } from './pages/assistant/InboxList';
import { ConversationDetail } from './pages/assistant/ConversationDetail';
import { AIChatCopilot } from './pages/assistant/AIChatCopilot';
import { ConnectedAccounts } from './pages/assistant/ConnectedAccounts';
import { TeamManagement } from './pages/assistant/TeamManagement';
import { WorkspaceSettings } from './pages/assistant/WorkspaceSettings';
import { ClientDashboard } from './pages/client/ClientDashboard';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'assistant' ? '/assistant/dashboard' : '/client/dashboard'} replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/client" element={<ClientLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Assistant Onboarding */}
          <Route
            path="/assistant/onboarding"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantOnboarding />
              </ProtectedRoute>
            }
          />

          {/* Client Onboarding */}
          <Route
            path="/client/onboarding"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientOnboarding />
              </ProtectedRoute>
            }
          />

          {/* Assistant Routes */}
          <Route
            path="/assistant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <AssistantDashboard />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant/inbox"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <InboxList />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant/inbox/:id"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <ConversationDetail />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant/ai-chat"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <AIChatCopilot />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant/accounts"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <ConnectedAccounts />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant/team"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <TeamManagement />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant/settings"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout>
                  <WorkspaceSettings />
                </AssistantLayout>
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientLayout>
                  <ClientDashboard />
                </ClientLayout>
              </ProtectedRoute>
            }
          />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

