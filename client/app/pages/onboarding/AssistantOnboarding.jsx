import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Inbox, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AssistantOnboarding = () => {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('google');
  const [emailAddress, setEmailAddress] = useState('executive.inbox@acmecorp.io');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [importing, setImporting] = useState(false);

  const { user, team } = useAuth();
  const navigate = useNavigate();

  const handleConnectProvider = async () => {
    setConnecting(true);
    setTimeout(async () => {
      try {
        await api.post('/email-accounts/connect', {
          provider,
          emailAddress,
        });
        setConnected(true);
        toast.success(`Connected ${emailAddress} (Simulated)`);
      } catch (err) {
        toast.error('Connection failed.');
      } finally {
        setConnecting(false);
      }
    }, 1000);
  };

  const handleImportDemo = async () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      toast.success('18 conversations loaded & analyzed by Gemini AI!');
      setStep(4);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl p-8 shadow-card border border-gray-100">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === s
                    ? 'bg-brand-500 text-white'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
          <span className="text-xs font-medium text-muted">Step {step} of 4</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to MailPilot, {user?.name}!</h2>
              <p className="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed">
                You've created the workspace <strong className="text-gray-900">{team?.name}</strong>. MailPilot empowers you as a Personal Assistant to triage emails with Gemini AI, handle routine communication, and seamlessly escalate critical decisions to your clients.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs space-y-2">
              <div className="font-semibold text-gray-800">Your Shareable Team Code:</div>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 font-mono text-sm">
                <span className="font-bold text-brand-600">{team?.teamCode || 'MAIL-8X92K'}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(team?.teamCode || 'MAIL-8X92K');
                    toast.success('Team Code copied!');
                  }}
                  className="px-2.5 py-1 text-xs font-sans rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-[11px] text-muted">
                Share this code with your client so they can register and join their private attention portal.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center justify-center gap-2 transition"
            >
              Continue to Integration <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Connect Provider */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Connect Client Email Provider</h2>
              <p className="text-xs text-muted mt-1">
                Establish a simulated or live sync to ingest incoming communications
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={`p-4 rounded-2xl border text-left transition ${
                  provider === 'google'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 ring-2 ring-brand-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold">Google / Gmail</div>
                <div className="text-[11px] text-muted mt-0.5">Google Workspace accounts</div>
              </button>
              <button
                type="button"
                onClick={() => setProvider('microsoft')}
                className={`p-4 rounded-2xl border text-left transition ${
                  provider === 'microsoft'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 ring-2 ring-brand-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold">Microsoft Outlook</div>
                <div className="text-[11px] text-muted mt-0.5">Office 365 Exchange</div>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Client Inbox Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            {connected ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Connection verified: {emailAddress} (Simulated Active)
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectProvider}
                disabled={connecting}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-2 transition"
              >
                {connecting ? 'Simulating Authorization...' : 'Authorize Provider'}
              </button>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center justify-center gap-2 transition"
            >
              Next: Sample Conversations <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Import Sample Conversations */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Import Demo Conversations</h2>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                Populate your workspace with 18 realistic executive emails including budget approvals, flight confirmations, and interview scheduling.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs space-y-2">
              <div className="font-semibold text-gray-800">What will be loaded:</div>
              <ul className="space-y-1.5 text-muted">
                <li>• Budget approvals assigned to <strong>Client to Reply</strong></li>
                <li>• Calendar reschedules assigned to <strong>Assistant to Reply</strong></li>
                <li>• Newsletters and receipts assigned to <strong>No Reply Needed</strong></li>
                <li>• Gemini AI classifications, executive summaries & drafted replies</li>
              </ul>
            </div>

            <button
              onClick={handleImportDemo}
              disabled={importing}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center justify-center gap-2 transition"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Conversations with Gemini...
                </>
              ) : (
                'Import & Classify Demo Emails'
              )}
            </button>
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Onboarding Complete!</h2>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                Your MailPilot assistant workspace is configured and ready for live triage.
              </p>
            </div>
            <button
              onClick={() => navigate('/assistant/dashboard')}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm flex items-center justify-center gap-2 transition"
            >
              Open Assistant Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

