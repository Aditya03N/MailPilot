import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  UserCheck,
  UserX,
  AlertCircle,
  Clock,
  Send,
  Star,
  Archive,
  RefreshCw,
  Edit3,
  Calendar,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';
import { ResponsibilityBadge, CategoryBadge } from '../../components/Badges';
import toast from 'react-hot-toast';

export const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [history, setHistory] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI & Reply States
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyInstruction, setReplyInstruction] = useState('Polite, concise and professional');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationNote, setEscalationNote] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/conversations/${id}`);
      if (res.data.success) {
        setConversation(res.data.conversation);
        setHistory(res.data.history);
        setHandovers(res.data.handovers);
        if (res.data.conversation.suggestedReply) {
          setReplyDraft(res.data.conversation.suggestedReply);
        }
      }
    } catch (err) {
      toast.error('Failed to load conversation details.');
      navigate('/assistant/inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Handle Gemini Reanalysis
  const handleReanalyzeWithAI = async () => {
    try {
      setIsReanalyzing(true);
      const res = await api.post(`/ai/classify/${id}`);
      if (res.data.success) {
        setConversation(res.data.conversation);
        if (res.data.conversation.suggestedReply) {
          setReplyDraft(res.data.conversation.suggestedReply);
        }
        toast.success('Reanalyzed with Gemini AI!');
        fetchDetail(); // Refresh history
      }
    } catch (err) {
      toast.error('Reanalysis failed.');
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Handle Manual Override
  const handleOverrideResponsibility = async (newResp) => {
    try {
      const res = await api.patch(`/conversations/${id}/responsibility`, {
        responsibility: newResp,
        reason: 'Personal Assistant manual reassignment.',
      });
      if (res.data.success) {
        setConversation(res.data.conversation);
        setShowOverrideMenu(false);
        toast.success(`Responsibility changed to ${newResp.replace(/_/g, ' ')}`);
        fetchDetail();
      }
    } catch (err) {
      toast.error('Failed to update responsibility.');
    }
  };

  // Generate Custom AI Draft Reply
  const handleGenerateCustomDraft = async () => {
    try {
      setIsDrafting(true);
      const res = await api.post(`/ai/draft-reply/${id}`, {
        instruction: replyInstruction,
      });
      if (res.data.success) {
        setReplyDraft(res.data.draft);
        toast.success('Generated new reply draft with Gemini.');
      }
    } catch (err) {
      toast.error('Failed to draft reply.');
    } finally {
      setIsDrafting(false);
    }
  };

  // PA forwards / escalates evaluated important email to Client
  const handleEscalateToClient = async () => {
    try {
      setIsEscalating(true);
      const res = await api.post(`/conversations/${id}/escalate`, {
        note: escalationNote || 'Evaluated as important; requires client review.',
      });
      if (res.data.success) {
        toast.success('Important email forwarded to Client attention queue!');
        setShowEscalateModal(false);
        setEscalationNote('');
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to forward email to client.');
    } finally {
      setIsEscalating(false);
    }
  };

  // PA sends internal note to Client on this thread
  const handleSendInternalNote = async (e) => {
    e?.preventDefault();
    if (!internalNoteInput.trim()) {
      toast.error('Note cannot be empty.');
      return;
    }
    try {
      setIsPostingNote(true);
      const res = await api.post(`/conversations/${id}/internal-note`, {
        message: internalNoteInput.trim(),
      });
      if (res.data.success) {
        toast.success('Internal note sent to Client!');
        setInternalNoteInput('');
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send internal note.');
    } finally {
      setIsPostingNote(false);
    }
  };

  // Send Simulated Reply
  const handleSendReply = async () => {
    if (!replyDraft.trim()) {
      toast.error('Reply body cannot be empty.');
      return;
    }
    try {
      setIsSending(true);
      const res = await api.post(`/conversations/${id}/reply`, {
        bodyText: replyDraft,
      });
      if (res.data.success) {
        toast.success('Reply sent & recorded in conversation (Simulated)');
        setReplyDraft('');
        fetchDetail();
      }
    } catch (err) {
      toast.error('Failed to send reply.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleImportant = async () => {
    try {
      const res = await api.patch(`/conversations/${id}/important`);
      if (res.data.success) {
        setConversation((prev) => ({ ...prev, isImportant: res.data.isImportant }));
        toast.success(res.data.isImportant ? 'Marked as Important' : 'Unmarked');
      }
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleToggleArchive = async () => {
    try {
      const res = await api.patch(`/conversations/${id}/archive`);
      if (res.data.success) {
        toast.success('Conversation archived.');
        navigate('/assistant/inbox');
      }
    } catch (err) {
      toast.error('Failed to archive.');
    }
  };

  if (loading || !conversation) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <Link
          to="/assistant/inbox"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inbox
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleImportant}
            className={`p-2 rounded-xl border transition ${
              conversation.isImportant
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
            title="Toggle Important"
          >
            <Star className={`w-4 h-4 ${conversation.isImportant ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleToggleArchive}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={handleReanalyzeWithAI}
            disabled={isReanalyzing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            {isReanalyzing ? 'Reanalyzing...' : 'Reanalyze with AI'}
          </button>

          <button
            onClick={() => setShowEscalateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Forward Important to Client
          </button>
        </div>
      </div>

      {/* Main Grid: Thread Messages (Left) vs AI Insights & Classification Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Email Thread & Reply Composer (7 or 8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Thread Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-snug">
                {conversation.subject}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-muted pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-800">Assigned Client:</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                {conversation.clientId?.name || 'Executive Client'} ({conversation.clientId?.email})
              </span>
              <span>&bull;</span>
              <span>{conversation.messages.length} message{conversation.messages.length > 1 ? 's' : ''} in thread</span>
            </div>
          </div>

          {/* Internal PA & Client Notes / Discussion Box */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Internal Collaboration with {conversation.clientId?.name || 'Client'}
                  </h3>
                  <p className="text-[11px] text-muted">
                    Private notes & instructions exchanged between you and your client
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {(conversation.internalNotes || []).length} Notes
              </span>
            </div>

            {/* List of Notes */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {conversation.internalNotes && conversation.internalNotes.length > 0 ? (
                conversation.internalNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                      note.senderRole === 'assistant'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950 ml-6'
                        : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        {note.senderRole === 'assistant' ? (
                          <span className="text-amber-800">💬 Message from You (PA)</span>
                        ) : (
                          <span className="text-indigo-800">💬 Message from Client ({note.senderName || conversation.clientId?.name})</span>
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
                <div className="text-center py-3 text-xs text-muted italic bg-gray-50/50 rounded-xl">
                  No internal notes exchanged yet. You can send a direct note to {conversation.clientId?.name || 'the client'} below.
                </div>
              )}
            </div>

            {/* Post Note Form */}
            <form onSubmit={handleSendInternalNote} className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={internalNoteInput}
                onChange={(e) => setInternalNoteInput(e.target.value)}
                placeholder={`Type a note to ${conversation.clientId?.name || 'Client'}...`}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-brand-500 outline-none"
              />
              <button
                type="submit"
                disabled={isPostingNote || !internalNoteInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark hover:bg-gray-800 text-white shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-brand-400" />
                <span>Send Note</span>
              </button>
            </form>
          </div>

          {/* Email Messages */}
          <div className="space-y-4">
            {conversation.clientDelegationNote && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                    Client Handover Instruction ({conversation.clientId?.name || 'Client'})
                    <span className="text-[10px] font-normal text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      Action Delegated to You
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                    "{conversation.clientDelegationNote}"
                  </p>
                </div>
              </div>
            )}

            {conversation.escalationNote && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    Your Forwarding Note to Client
                    <span className="text-[10px] font-normal text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                      Sent to Client Attention
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    "{conversation.escalationNote}"
                  </p>
                </div>
              </div>
            )}

            {conversation.messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-5 shadow-2xs transition ${
                  msg.isSimulatedSent
                    ? 'bg-brand-50/30 border-brand-200'
                    : 'bg-white border-gray-200/80'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100/80">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        msg.isSimulatedSent
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {msg.senderName?.slice(0, 2) || 'EX'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">
                        {msg.senderName}
                        {msg.isSimulatedSent && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-brand-100 text-brand-800 font-bold uppercase">
                            Sent by PA (Simulated)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted">{msg.senderEmail}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(msg.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="mt-3.5 text-xs text-gray-800 leading-relaxed whitespace-pre-line font-sans">
                  {msg.bodyText}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Drafting Workflow */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900">Draft & Approve Response</h3>
              </div>
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Simulated Sending Only
              </span>
            </div>

            {/* Gemini Custom Instruction Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyInstruction}
                onChange={(e) => setReplyInstruction(e.target.value)}
                placeholder="e.g. Confirm Thursday at 2pm politely..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:border-brand-500 outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateCustomDraft}
                disabled={isDrafting}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                {isDrafting ? 'Drafting...' : 'Generate with Gemini'}
              </button>
            </div>

            {/* Editable Text Area */}
            <div>
              <textarea
                rows={5}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Write or edit your response here before sending..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
              <p className="text-[11px] text-muted mt-1">
                Product Principle: AI never automatically sends emails. PA reviews and triggers dispatch.
              </p>
            </div>

            {/* Send simulated action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendReply}
                disabled={isSending || !replyDraft.trim()}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                {isSending ? (
                  'Recording sent message...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Approve & Send (Simulated)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated AI Insights & Decision Management Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Intelligence Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900">AI Triage Intelligence</h3>
              </div>
              <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                Gemini 1.5 &bull; {Math.round((conversation.confidence || 0.94) * 100)}% Confidence
              </span>
            </div>

            {/* Current Responsibility & Override Button */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Current Assigned Responsibility
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <ResponsibilityBadge responsibility={conversation.currentResponsibility} />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
                  >
                    Change
                  </button>

                  {/* Override Dropdown */}
                  {showOverrideMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20 text-xs">
                      <div className="px-3 py-1 font-semibold text-gray-400 uppercase text-[10px]">
                        Manual Override
                      </div>
                      <button
                        onClick={() => handleOverrideResponsibility('ASSISTANT_TO_REPLY')}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Assistant to Reply
                      </button>
                      <button
                        onClick={() => handleOverrideResponsibility('CLIENT_TO_REPLY')}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Client to Reply
                      </button>
                      <button
                        onClick={() => handleOverrideResponsibility('NO_REPLY_NEEDED')}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                      >
                        <UserX className="w-3.5 h-3.5 text-gray-500" /> No Reply Needed
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {conversation.isManuallyOverridden && (
                <p className="text-[11px] text-amber-700 font-medium">
                  Note: Manually overridden by Personal Assistant.
                </p>
              )}
            </div>

            {/* AI Executive Summary */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Executive Summary
              </div>
              <p className="text-xs text-gray-800 bg-gray-50/70 p-3 rounded-xl border border-gray-100 leading-relaxed">
                {conversation.summary || 'Summary generated by Gemini.'}
              </p>
            </div>

            {/* Why this was classified */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                AI Classification Rationale
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {conversation.reason}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Suggested Next Action
              </div>
              <div className="p-3 bg-brand-50/40 rounded-xl border border-brand-100 text-xs text-brand-900 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>{conversation.suggestedAction}</span>
              </div>
            </div>

            {/* Extracted Key Dates */}
            {conversation.extractedDates && conversation.extractedDates.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Extracted Dates & Deadlines
                </div>
                <div className="space-y-1">
                  {conversation.extractedDates.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{d.title}:</span>
                      <span>{d.rawText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit History & Handover Log */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Classification & Handover Audit
            </h4>
            <div className="space-y-2 text-xs divide-y divide-gray-100">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="pt-2 first:pt-0 space-y-0.5">
                    <div className="flex items-center justify-between text-muted text-[11px]">
                      <span>{h.changeSource?.replace(/_/g, ' ')}</span>
                      <span>{new Date(h.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      Assigned to <span className="text-brand-600 font-bold">{h.newResponsibility?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-muted text-[11px]">{h.reason}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted text-[11px]">Initial classification recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Escalate Important to Client Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 text-sm">Forward Important Mail to Client</h3>
              </div>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              This email will be flagged as <strong>Important</strong> and moved directly into the client's attention queue (<span className="text-amber-800 font-semibold">CLIENT_TO_REPLY</span>) so they only see matters requiring their authority.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                Note for Client (Optional Evaluation)
              </label>
              <textarea
                rows={3}
                value={escalationNote}
                onChange={(e) => setEscalationNote(e.target.value)}
                placeholder="e.g. Reviewed with vendor: need your final executive sign-off on the revised budget terms."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-amber-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalateToClient}
                disabled={isEscalating}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {isEscalating ? 'Forwarding...' : 'Confirm & Forward to Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

