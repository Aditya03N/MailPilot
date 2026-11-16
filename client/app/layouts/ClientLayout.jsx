import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, LogOut, CheckCircle, Shield } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';

export const ClientLayout = ({ children }) => {
  const { user, team, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-[#171923] flex flex-col">
      {/* Premium Minimalist Client Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-dark text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Mail className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900 tracking-tight">MailPilot</span>
              <span className="text-[11px] ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                Client Attention Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              avatar={user?.avatar}
              size="md"
            />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-gray-900">{user?.name}</div>
              <div className="text-[11px] text-muted">{user?.email} &bull; {team?.name || 'Executive Workspace'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Focus Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Subtle Client Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
          <p>MailPilot Client Attention System — Supervised by your Personal Assistant</p>
          <div className="flex items-center gap-1 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI recommends &bull; PA manages &bull; You decide</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

