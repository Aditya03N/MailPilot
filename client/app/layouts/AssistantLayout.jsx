import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Inbox,
  LayoutDashboard,
  UserCheck,
  UserX,
  Sparkles,
  Clock,
  Calendar,
  AlertCircle,
  Settings,
  Users,
  LogOut,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ConnectEmailModal } from '../components/ConnectEmailModal';
import { SimulateIncomingEmailModal } from '../components/SimulateIncomingEmailModal';
import { UserAvatar } from '../components/UserAvatar';

export const AssistantLayout = ({ children }) => {
  const { user, team, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  const navLinks = [
    { name: 'Overview', path: '/assistant/dashboard', icon: LayoutDashboard },
    { name: 'All Inbox', path: '/assistant/inbox', icon: Inbox, exact: true },
    { name: 'Assistant to Reply', path: '/assistant/inbox?segment=assistant-to-reply', icon: UserCheck },
    { name: 'Client to Reply', path: '/assistant/inbox?segment=client-to-reply', icon: AlertCircle, badge: 'Escalations' },
    { name: 'No Reply Needed', path: '/assistant/inbox?segment=no-reply-needed', icon: UserX },
    { name: 'Meetings & Appts', path: '/assistant/inbox?segment=meetings', icon: Calendar },
    { name: 'Waiting Response', path: '/assistant/inbox?segment=waiting-response', icon: Clock },
    { name: 'AI Copilot Chat', path: '/assistant/ai-chat', icon: Sparkles, highlight: true },
    { name: 'Connected Accounts', path: '/assistant/accounts', icon: Mail },
    { name: 'Team Management', path: '/assistant/team', icon: Users },
    { name: 'Settings', path: '/assistant/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex text-[#171923]">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-brand-500/20">
                <Mail className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-base text-gray-900 tracking-tight">MailPilot</span>
                <span className="text-[10px] block font-semibold text-brand-600 uppercase tracking-widest">
                  PA Workspace
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Banner */}
        {!collapsed && (
          <div className="p-3 mx-3 my-2 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-semibold text-gray-800 truncate">{team?.name || "Aditya's Workspace"}</div>
              <div className="text-[11px] text-muted flex items-center gap-1 font-mono">
                Code: <span className="font-bold text-brand-600">{team?.teamCode || 'MAIL-8X92K'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(team?.teamCode || 'MAIL-8X92K');
                alert('Team Code copied to clipboard!');
              }}
              title="Copy Team Code"
              className="text-gray-400 hover:text-brand-600 p-1 text-xs"
            >
              Copy
            </button>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isFullActive = location.pathname + location.search === link.path;
            const isPathActive = location.pathname === link.path && !link.exact;
            const active = isFullActive || (link.path === '/assistant/inbox' && location.pathname === '/assistant/inbox' && !location.search);

            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                  active
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
                title={collapsed ? link.name : ''}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : link.highlight ? 'text-brand-500' : 'text-gray-500 group-hover:text-gray-900'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 flex items-center justify-between">
                    {link.name}
                    {link.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          {!collapsed && (
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50/40 text-xs font-semibold text-gray-700 hover:text-brand-600 transition"
            >
              <Plus className="w-3.5 h-3.5 text-brand-500" />
              Connect Client Inbox
            </button>
          )}

          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              avatar={user?.avatar}
              size="md"
            />
            {!collapsed && (
              <div className="flex-1 truncate">
                <div className="text-xs font-semibold text-gray-900 truncate">{user?.name}</div>
                <div className="text-[11px] text-muted truncate">{user?.email || 'Personal Assistant'}</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Executive Workspace</h1>
              <p className="text-xs text-muted hidden sm:block">AI-supervised email workflow & client escalation engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200 transition"
              title="Test real-time Gemini AI email triage"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Simulate Incoming Email</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Client Sync Active
            </div>

            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-xs font-medium text-gray-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Account</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Connect Modal */}
      <ConnectEmailModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnected={() => {
          // Trigger refresh if needed
        }}
      />

      {/* Real-time Email Simulator Modal */}
      <SimulateIncomingEmailModal
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
        onEmailReceived={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

