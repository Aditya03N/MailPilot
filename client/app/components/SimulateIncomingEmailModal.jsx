import React, { useState } from 'react';
import api from '../services/api';
import { Mail, Plus, Send, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const SimulateIncomingEmailModal = ({ isOpen, onClose, onEmailReceived }) => {
  const [senderName, setSenderName] = useState('Marcus Vance (VP Growth)');
  const [senderEmail, setSenderEmail] = useState('marcus.v@acmecorp.io');
  const [subject, setSubject] = useState('Urgent: Revised Q3 Marketing Budget Sign-off ($65,000)');
  const [bodyText, setBodyText] = useState(
    'Hi,\n\nWe updated our growth marketing proposal with new agency ad spend allocations totaling $65,000. Could you please review and grant formal approval by tomorrow noon so we can lock in the Q3 rates?\n\nBest,\nMarcus'
  );
  const [isImportant, setIsImportant] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/conversations', {
        subject,
        isImportant,
        participants: [
          { name: senderName, email: senderEmail, role: 'sender' },
        ],
        messages: [
          {
            senderName,
            senderEmail,
            recipientName: 'Client',
            recipientEmail: 'client@company.com',
            bodyText,
            timestamp: new Date(),
            isInbound: true,
          },
        ],
      });

      if (res.data.success) {
        toast.success(`Incoming email ingested! Gemini AI classified as: ${res.data.conversation.currentResponsibility.replace(/_/g, ' ')}`);
        if (onEmailReceived) onEmailReceived(res.data.conversation);
        onClose();
      }
    } catch (err) {
      toast.error('Failed to simulate incoming email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Simulate Live Incoming Email</h3>
              <p className="text-xs text-muted">Test real-time Gemini AI triage and classification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                Sender Name
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                Sender Email
              </label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
              Message Body
            </label>
            <textarea
              rows={4}
              required
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:border-brand-500 outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="importantCheck"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
            />
            <label htmlFor="importantCheck" className="text-xs text-gray-700 font-medium">
              Flag as High Importance
            </label>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 flex items-center gap-2 shadow-2xs transition disabled:opacity-50"
            >
              {loading ? 'Analyzing with Gemini...' : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Simulate Delivery & AI Triage
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
