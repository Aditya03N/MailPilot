import React, { useState } from 'react';
import { Mail, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ConnectEmailModal = ({ isOpen, onClose, onConnected }) => {
  const [provider, setProvider] = useState('google');
  const [emailAddress, setEmailAddress] = useState('executive.inbox@acmecorp.io');
  const [loading, setLoading] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedConnect = async () => {
    setIsAuthorizing(true);
    // Simulate OAuth consent window delay
    setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.post('/email-accounts/connect', {
          provider,
          emailAddress,
        });

        if (res.data.success) {
          toast.success(`Successfully connected ${emailAddress} (Simulated)`);
          if (onConnected) onConnected(res.data.account);
          onClose();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Connection failed.');
      } finally {
        setLoading(false);
        setIsAuthorizing(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Connect Email Provider</h3>
              <p className="text-xs text-muted">Manage client communication with MailPilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Simulated Integration Mode:</strong> You can link any client email inbox to test Gemini AI triage without exposing production credentials.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  provider === 'google'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Google</div>
                  <div className="text-[11px] text-muted">Gmail & Workspace</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('microsoft')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  provider === 'microsoft'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Outlook</div>
                  <div className="text-[11px] text-muted">Office 365</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address to Sync
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition"
              placeholder="e.g. client@company.com"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSimulatedConnect}
            disabled={loading || isAuthorizing}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          >
            {isAuthorizing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Authorizing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Authorize & Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

