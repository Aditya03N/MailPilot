import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import {
  Sparkles,
  CheckCircle2,
  UserCheck,
  ExternalLink,
  Clock,
  Shield,
  AlertCircle,
  RefreshCw,
  X,
  Users,
  Mail,
  ArrowRight,
  Send,
  Check,
} from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';
import toast from 'react-hot-toast';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [provider, setProvider] = useState('google');
  const [clientEmailInput, setClientEmailInput] = useState(user?.email || '');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [clientNoteInput, setClientNoteInput] = useState('');
  const [activeNoteConvId, setActiveNoteConvId] = useState(null);
  const [isPostingClientNote, setIsPostingClientNote] = useState(false);

  const fetchClientDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/client');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load client attention center.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDashboard();

    // Check for query parameter notifications from Google OAuth callback
    const googleSynced = searchParams.get('google_synced');
    const oauthError = searchParams.get('oauth_error');
    const importedCount = searchParams.get('count');

    if (googleSynced) {
      toast.success(
        `🎉 Live Google Account connected! Ingested ${importedCount || 'new'} emails for PA evaluation.`,
        { duration: 6000 }
      );
      setSearchParams({}, { replace: true });
    } else if (oauthError) {
      toast(
        `Google OAuth notice: ${decodeURIComponent(oauthError)}. You can use Quick Ingest below anytime.`,
        { icon: 'ℹ️', duration: 7000 }
      );
      setSearchParams({}, { replace: true });
    }

    const socket = getSocket();
    if (socket) {
      socket.on('conversation_updated', (payload) => {
        if (payload?.type === 'ESCALATED_TO_CLIENT') {
          toast.success(`⭐ PA forwarded an important email: "${payload.subject || 'Action required'}"`, {
            duration: 6000,
          });
        } else if (payload?.type === 'REPLY_SENT') {
          toast(`New reply recorded on thread by ${payload.actorName}.`);
        } else if (payload?.type === 'INTERNAL_NOTE_ADDED') {
          toast(`💬 New note from ${payload.actorName} on conversation!`, { duration: 5000 });
        }
        fetchClientDashboard();
      });
      socket.on('client_joined_emails_synced', () => {
        fetchClientDashboard();
      });
    }

    return () => {
      if (socket) {
        socket.off('conversation_updated');
        socket.off('client_joined_emails_synced');
      }
    };
  }, []);

  // Action: Client sends internal note to PA
  const handleSendClientNote = async (convId) => {
    if (!clientNoteInput.trim()) {
      toast.error('Note cannot be empty.');
      return;
    }
    try {
      setIsPostingClientNote(true);
      const res = await api.post(`/conversations/${convId}/internal-note`, {
        message: clientNoteInput.trim(),
      });
      if (res.data.success) {
        toast.success(`Note sent to your Personal Assistant (${data?.assistant?.name || 'PA'})!`);
        setClientNoteInput('');
        fetchClientDashboard();
      }
    } catch (err) {
      toast.error('Failed to send note to PA.');
    } finally {
      setIsPostingClientNote(false);
    }
  };

  // Action: Direct Reply from Client
  const handleSendDirectReply = async (convId) => {
    if (!replyText.trim()) {
      toast.error('Reply content cannot be empty.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post(`/conversations/${convId}/reply`, {
        bodyText: replyText,
      });
      if (res.data.success) {
        toast.success('Your reply was recorded and sent! Matter marked as handled.');
        setReplyingId(null);
        setReplyText('');
        fetchClientDashboard();
      }
    } catch (err) {
      toast.error('Failed to send reply.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Mark as Handled
  const handleMarkHandled = async (convId) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/client/handle/${convId}`);
      if (res.data.success) {
        toast.success('Marked as Handled. Removed from pending attention.');
        setSelectedConversation(null);
        fetchClientDashboard();
      }
    } catch (err) {
      toast.error('Failed to mark conversation as handled.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Hand over to Assistant
  const handleAskAssistant = async (convId) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/client/handover/${convId}`, {
        note: handoverNote,
      });
      if (res.data.success) {
        toast.success(`Handed over to ${data?.assistant?.name || 'Personal Assistant'}! They have been notified.`);
        setShowHandoverModal(false);
        setHandoverNote('');
        setSelectedConversation(null);
        fetchClientDashboard();
      }
    } catch (err) {
      toast.error('Failed to hand over to assistant.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Real Live Google OAuth redirect
  const handleConnectLiveGoogle = async () => {
    try {
      setImporting(true);
      const res = await api.get('/email-accounts/google/url');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not generate Google authorization link.');
      }
    } catch (err) {
      toast.error('Could not initiate Google OAuth. Please use Quick Ingest.');
      setImporting(false);
    }
  };

  // Action: Quick One-Click Ingest for the client's email
  const handleQuickIngest = async () => {
    const targetEmail = (clientEmailInput && clientEmailInput.trim()) || user?.email;
    if (!targetEmail) {
      toast.error('Please enter an account email address.');
      return;
    }

    try {
      setImporting(true);
      const res = await api.post('/email-accounts/connect', {
        provider,
        emailAddress: targetEmail,
        clientId: user?.id || user?._id,
      });

      if (res.data.success) {
        toast.success(
          `Emails ingested for ${targetEmail}! Forwarded to ${data?.assistant?.name || 'your PA'} for evaluation.`
        );
        setShowImportModal(false);
        fetchClientDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Email ingest failed.');
    } finally {
      setImporting(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-100 rounded-xl w-1/3"></div>
        <div className="h-32 bg-gray-100 rounded-3xl"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
        </div>
        <div className="h-72 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  const { assistant, team, stats, attentionConversations } = data || {};

  return (
    <div className="space-y-8">
      {/* Header section with executive greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
            {getTimeGreeting()}, {user?.name || 'Client'}
          </h1>
          <p className="text-sm text-muted">
            Welcome to your executive attention center. Only items requiring your direct decision are sent here.
          </p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Import Emails / Sync Account</span>
        </button>
      </div>

      {/* Prominent Personal Assistant Connection Card */}
      <div className="bg-gradient-to-r from-brand-50/90 via-indigo-50/50 to-blue-50/70 p-6 rounded-3xl border border-brand-100/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-100/70">
          <div className="flex items-center gap-3.5">
            <UserAvatar
              name={assistant?.name}
              email={assistant?.email}
              avatar={assistant?.avatar}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{assistant?.name || 'Your Personal Assistant'}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Personal Assistant
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {assistant?.email} &bull; Workspace: <strong className="text-gray-800">{team?.name || 'Executive Workspace'}</strong> (Team Code: <code className="font-mono bg-white/80 px-1 py-0.5 rounded text-brand-700 font-semibold">{team?.teamCode || 'CONNECTED'}</code>)
              </p>
            </div>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-[11px] text-brand-700 font-semibold uppercase tracking-wider block">
              Supervision Status
            </span>
            <span className="text-xs text-gray-700 font-medium">All Inbound Emails Evaluated</span>
          </div>
        </div>

        {/* 3-Step Email Workflow Explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-brand-100/60 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">1</span>
              Inbound Emails Ingested
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every email to your address is received by {assistant?.name || 'your PA'}.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-brand-100/60 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">2</span>
              AI & PA Evaluation
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {assistant?.name || 'Your PA'} handles routine scheduling, inquiries, and newsletters directly.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-brand-100/60 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">3</span>
              Important Decisions Escalate
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Only high-impact emails requiring your direct decision appear here in your Attention Center.
            </p>
          </div>
        </div>
      </div>

      {/* High-level status bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Pending Decisions
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.pendingAttentionCount || 0}
          </div>
          <p className="text-[11px] text-muted mt-1">Requiring your authority</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            Important Marked
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.importantCount || 0}
          </div>
          <p className="text-[11px] text-muted mt-1">High-impact threads</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Matters Handled
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.handledCount || 0}
          </div>
          <p className="text-[11px] text-muted mt-1">Completed & cleared</p>
        </div>
      </div>

      {/* Main Focus Section: Attention Needed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Your Attention Needed</h2>
          <span className="text-xs font-medium text-muted">
            Filtered by AI & your PA: {assistant?.name || 'Personal Assistant'}
          </span>
        </div>

        {attentionConversations && attentionConversations.length > 0 ? (
          <div className="space-y-4">
            {attentionConversations.map((conv) => (
              <div
                key={conv._id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs hover:border-brand-300 transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-gray-900">
                      {conv.participants[0]?.name || 'Sender'}
                    </span>
                    <span className="text-xs text-muted">({conv.participants[0]?.email})</span>
                    {conv.isImportant && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Priority
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(conv.lastMessageAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Subject & Summary */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-gray-900">{conv.subject}</h3>

                  {conv.escalationNote && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                      <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        PA
                      </div>
                      <div>
                        <span className="font-bold">Personal Assistant Note ({assistant?.name || 'Personal Assistant'}): </span>
                        <span className="text-amber-950 font-medium">"{conv.escalationNote}"</span>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 text-xs text-gray-800 leading-relaxed">
                    <div className="font-semibold text-brand-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      Executive Summary & AI Rationale
                    </div>
                    <p>{conv.summary || conv.messages[0]?.bodyText}</p>
                    {conv.reason && (
                      <p className="mt-2 text-[11px] text-gray-500 italic">
                        <strong>Why escalated to you:</strong> {conv.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Body Snippet */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-100 text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {conv.messages[0]?.bodyText || 'No email body available.'}
                </div>

                {/* Suggested Action / Decision Box */}
                {conv.suggestedAction && (
                  <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 flex items-start gap-2.5 text-xs text-brand-950">
                    <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recommended Action: </span>
                      <span>{conv.suggestedAction}</span>
                    </div>
                  </div>
                )}

                {/* Suggested Reply Draft */}
                {conv.suggestedReply && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        Suggested Reply (Drafted by AI & PA)
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingId(conv._id);
                          setReplyText(conv.suggestedReply);
                        }}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 underline"
                      >
                        Use this to reply &rarr;
                      </button>
                    </div>
                    <p className="text-gray-600 italic bg-white p-2.5 rounded-lg border border-gray-100">
                      "{conv.suggestedReply}"
                    </p>
                  </div>
                )}

                {/* Discussion & Internal Notes with Personal Assistant */}
                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Discussion with your PA ({assistant?.name || 'Personal Assistant'})
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {(conv.internalNotes || []).length} Notes Exchanged
                    </span>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {conv.internalNotes && conv.internalNotes.length > 0 ? (
                      conv.internalNotes.map((note, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                            note.senderRole === 'assistant'
                              ? 'bg-amber-50/90 border-amber-200 text-amber-950 mr-4'
                              : 'bg-indigo-50/90 border-indigo-200 text-indigo-950 ml-4'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[11px]">
                            <span>
                              {note.senderRole === 'assistant' ? (
                                <span className="text-amber-800">💬 Message from PA ({note.senderName || assistant?.name})</span>
                              ) : (
                                <span className="text-indigo-800">💬 Message from You ({note.senderName || user?.name})</span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{note.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-muted italic">
                        No notes yet. Type a message below to discuss this matter directly with {assistant?.name || 'your PA'}.
                      </p>
                    )}
                  </div>

                  {/* Quick Input to message PA */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={activeNoteConvId === conv._id ? clientNoteInput : ''}
                      onFocus={() => setActiveNoteConvId(conv._id)}
                      onChange={(e) => {
                        setActiveNoteConvId(conv._id);
                        setClientNoteInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendClientNote(conv._id);
                        }
                      }}
                      placeholder={`Message ${assistant?.name || 'your PA'} regarding this email...`}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:border-brand-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendClientNote(conv._id)}
                      disabled={isPostingClientNote || activeNoteConvId !== conv._id || !clientNoteInput.trim()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark hover:bg-gray-800 text-white shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-brand-400" />
                      <span>Send Note</span>
                    </button>
                  </div>
                </div>

                {/* Inline Direct Reply Composer */}
                {replyingId === conv._id && (
                  <div className="p-4 bg-brand-50/40 rounded-2xl border border-brand-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-brand-600" />
                        Compose Executive Reply to {conv.participants[0]?.name || 'Sender'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingId(null);
                          setReplyText('');
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply message..."
                      className="w-full p-3 text-xs rounded-xl border border-gray-200 bg-white focus:border-brand-500 outline-none leading-relaxed"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingId(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendDirectReply(conv._id)}
                        disabled={actionLoading}
                        className="px-4 py-2 text-xs font-semibold text-white bg-dark hover:bg-gray-800 rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3 text-brand-400" />
                        <span>Send Reply & Mark Handled</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Client Decision Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="text-[11px] text-muted">
                    Supervised by {assistant?.name || 'your PA'}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (replyingId === conv._id) {
                          setReplyingId(null);
                        } else {
                          setReplyingId(conv._id);
                          setReplyText(conv.suggestedReply || '');
                        }
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-2xs transition"
                    >
                      <Send className="w-3.5 h-3.5 text-brand-600" />
                      <span>{replyingId === conv._id ? 'Close Reply' : 'Reply Directly'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConversation(conv);
                        setShowHandoverModal(true);
                      }}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Ask PA ({assistant?.name?.split(' ')[0] || 'Assistant'}) to Handle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkHandled(conv._id)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Handled</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">All Caught Up!</h3>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                Your Personal Assistant (<strong className="text-gray-700">{assistant?.name || 'Personal Assistant'}</strong>) has triaged all routine correspondence. When an important thread requires your decision, it will appear here.
              </p>
            </div>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Import More Emails / Sync Inbox</span>
            </button>
          </div>
        )}
      </div>

      {/* Handover Modal */}
      {showHandoverModal && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Delegate to Personal Assistant</h3>
                  <p className="text-[11px] text-muted">
                    Assigning to {assistant?.name || 'Personal Assistant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHandoverModal(false);
                  setSelectedConversation(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Instruction or Note for {assistant?.name || 'your PA'} (Optional)
              </label>
              <textarea
                rows={3}
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="e.g. Please approve the $35k budget and send the signed PDF back to David."
                className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowHandoverModal(false);
                  setSelectedConversation(null);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAskAssistant(selectedConversation._id)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition"
              >
                Confirm Delegation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Emails from Client Account Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Import Emails from Your Account</h3>
                  <p className="text-[11px] text-muted">Authorizes MailPilot to ingest and triage your correspondence</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Executive Email Pipeline:
              </p>
              <p className="text-blue-800 text-[11px]">
                Once authorized, your emails flow to your Personal Assistant ({assistant?.name || 'PA'}) for evaluation. Routine items are handled by your PA, and only Important decisions requiring your authority are sent back to your Attention Center.
              </p>
            </div>

            {/* Option 1: Live Google OAuth */}
            <div className="p-4 rounded-2xl border-2 border-brand-200/80 bg-brand-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Live Google / Gmail OAuth
                </span>
                <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full">
                  Real Google Auth
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Signs in directly with your Google account via Google OAuth 2.0 and fetches real inbox emails into MailPilot for AI & PA triage.
              </p>
              <button
                type="button"
                onClick={handleConnectLiveGoogle}
                disabled={importing}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-gray-800 text-xs font-semibold shadow-2xs hover:bg-gray-50 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Authorize & Connect with Google</span>
              </button>

              <div className="text-[11px] text-gray-500 bg-white/70 p-2.5 rounded-xl border border-brand-100 space-y-1">
                <span className="font-semibold text-gray-700 block text-[10px] uppercase tracking-wider">
                  OAuth Setup Requirement:
                </span>
                <span className="text-[10px] leading-tight block">
                  In Google Cloud Console, your Client ID must have this exact <strong>Authorized redirect URI</strong>:
                </span>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-200 font-mono text-[10px] text-brand-700">
                  <span className="truncate">http://localhost:5000/api/email-accounts/google/callback</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('http://localhost:5000/api/email-accounts/google/callback');
                      toast.success('Redirect URI copied to clipboard!');
                    }}
                    className="text-[10px] font-semibold text-gray-600 hover:text-gray-900 ml-2 shrink-0 underline"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Option 2: Quick Ingest / One-Click Sync */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-600" />
                  Quick Ingest & Sync Inbox
                </span>
                <span className="text-[10px] font-semibold text-gray-600 bg-gray-200/60 px-2 py-0.5 rounded-full">
                  Instant
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                  Your Account Email
                </label>
                <input
                  type="email"
                  value={clientEmailInput}
                  onChange={(e) => setClientEmailInput(e.target.value)}
                  placeholder={user?.email || "e.g. client@company.com"}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:border-brand-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleQuickIngest}
                disabled={importing}
                className="w-full py-2.5 px-4 rounded-xl bg-dark hover:bg-gray-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Quick Ingest & Forward to PA</span>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
