import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Bell,
  Shield,
  Bot,
  Mail,
  Save,
  CheckCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WorkspaceSettings = () => {
  const { user, team } = useAuth();

  const [aiAutoTriage, setAiAutoTriage] = useState(true);
  const [clientEscalationThreshold, setClientEscalationThreshold] = useState('high');
  const [notifyOnDelegation, setNotifyOnDelegation] = useState(true);
  const [simulatedDelay, setSimulatedDelay] = useState('instant');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Workspace preferences updated successfully.');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600" />
            Workspace & AI Triage Configuration
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Configure Gemini AI sensitivity, escalation triggers, and PA notifications
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white shadow-2xs transition disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* AI Engine Settings */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Bot className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900">Google Gemini AI Engine</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-gray-900">Automatic Inbound Classification</div>
              <p className="text-xs text-muted">
                Analyze incoming threads immediately using Gemini 1.5 to assign responsibility badges.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiAutoTriage}
                onChange={(e) => setAiAutoTriage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-gray-900">Client Escalation Sensitivity</div>
              <p className="text-xs text-muted">
                Define when threads are routed to <span className="font-semibold text-amber-800">CLIENT_TO_REPLY</span>.
              </p>
            </div>
            <select
              value={clientEscalationThreshold}
              onChange={(e) => setClientEscalationThreshold(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white outline-none focus:border-brand-500"
            >
              <option value="high">Strict: Financial & Legal Authority Only (Default)</option>
              <option value="medium">Balanced: Key Meetings & Contracts</option>
              <option value="low">Permissive: All VIP Contacts</option>
            </select>
          </div>
        </div>
      </div>

      {/* PA Delegation & Notification Preferences */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Bell className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900">Notification & Handover Alerts</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-gray-900">Instant Handover Notifications</div>
              <p className="text-xs text-muted">
                Receive dashboard alerts whenever a client chooses "Ask My Assistant to Handle This".
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnDelegation}
                onChange={(e) => setNotifyOnDelegation(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-gray-900">Email Outbox Safety Lock</div>
              <p className="text-xs text-muted">
                Always require manual PA click confirmation before registering simulated sent replies.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Enforced (Product Principle)
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Metadata */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Shield className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-gray-900">Workspace Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted block mb-1">Workspace Name</span>
            <span className="font-semibold text-gray-900">{team?.name || "Aditya's Workspace"}</span>
          </div>
          <div>
            <span className="text-muted block mb-1">Workspace Team Code</span>
            <span className="font-mono font-bold text-brand-600">{team?.teamCode || 'MAIL-8X92K'}</span>
          </div>
          <div>
            <span className="text-muted block mb-1">Primary Assistant</span>
            <span className="font-semibold text-gray-900">{user?.name} ({user?.email})</span>
          </div>
          <div>
            <span className="text-muted block mb-1">Database Scope</span>
            <span className="font-mono text-gray-700">mongodb://localhost:27017/mailpilot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

