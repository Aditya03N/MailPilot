import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Mail,
  Trash2,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { ConnectEmailModal } from '../../components/ConnectEmailModal';
import toast from 'react-hot-toast';

export const ConnectedAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/email-accounts');
      if (res.data.success) {
        setAccounts(res.data.accounts);
      }
    } catch (err) {
      toast.error('Failed to load email accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSync = async (id) => {
    try {
      setSyncingId(id);
      const res = await api.post(`/email-accounts/${id}/sync`);
      if (res.data.success) {
        toast.success('Inbox synchronized successfully.');
        fetchAccounts();
      }
    } catch (err) {
      toast.error('Sync failed.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to disconnect this email inbox?')) return;
    try {
      const res = await api.delete(`/email-accounts/${id}`);
      if (res.data.success) {
        toast.success('Account disconnected.');
        setAccounts((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      toast.error('Failed to disconnect account.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-600" />
            Connected Client Email Accounts
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Monitor synchronized mailboxes, provider connections, and sync telemetry
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          Connect New Mailbox
        </button>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Safe Simulation Active:</strong> In accordance with prototype standards, connected accounts simulate OAuth tokens and sync events with realistic message parsing without storing sensitive client passwords.
        </p>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              key={acc._id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {acc.provider === 'google' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  ) : (
                    <Mail className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{acc.emailAddress}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Connected
                    </span>
                    {acc.isSimulated && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        Simulated
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
                    <span>Client: {acc.clientId?.name || 'Executive Client'}</span>
                    <span>&bull;</span>
                    <span>Last synced: {new Date(acc.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleSync(acc._id)}
                  disabled={syncingId === acc._id}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingId === acc._id ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
                <button
                  onClick={() => handleDelete(acc._id)}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Disconnect"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-muted">
            No email accounts connected yet. Click 'Connect New Mailbox' above to add one.
          </div>
        )}
      </div>

      <ConnectEmailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConnected={fetchAccounts}
      />
    </div>
  );
};

