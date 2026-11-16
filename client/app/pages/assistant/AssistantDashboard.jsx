import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { ResponsibilityBadge, CategoryBadge } from '../../components/Badges';
import { UserAvatar } from '../../components/UserAvatar';
import toast from 'react-hot-toast';

export const AssistantDashboard = () => {
  const { team } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/assistant');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Listen to real-time events via Socket.IO
    const socket = getSocket();
    if (socket) {
      socket.on('client_joined_emails_synced', (payload) => {
        toast.success(`🎉 Client ${payload.clientName} joined! Ingested ${payload.count} real-time emails.`, {
          duration: 5000,
        });
        fetchDashboard();
      });

      socket.on('conversation_updated', (payload) => {
        if (payload.type === 'DELEGATED_TO_PA') {
          toast.success(`Client ${payload.actorName} asked you to handle a conversation!`, {
            duration: 6000,
          });
        } else if (payload.type === 'HANDLED') {
          toast(`Client ${payload.actorName} marked an email as handled.`);
        }
        fetchDashboard();
      });

      socket.on('member_joined', (payload) => {
        toast(`New member joined: ${payload.user.name} (${payload.user.role})`);
        fetchDashboard();
      });
    }

    return () => {
      if (socket) {
        socket.off('client_joined_emails_synced');
        socket.off('conversation_updated');
        socket.off('member_joined');
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  const { stats, clients, priorityConversations, upcomingMeetings, insights } = data || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Workspace Overview</h2>
          <p className="text-xs text-muted mt-0.5">
            Real-time status across triage queues, client escalations, and appointments
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-white text-xs font-semibold text-gray-700 transition shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Connected Executive Clients Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Connected Executive Clients</h3>
              <p className="text-[11px] text-muted">
                Executive inboxes connected via Team Code & supervised by you
              </p>
            </div>
          </div>
          <Link
            to="/assistant/team"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Manage Team & Code &rarr;
          </Link>
        </div>

        {clients && clients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-200 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={c.name} email={c.email} avatar={c.avatar} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-muted">{c.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Client
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted">Emails routed to you</span>
                  <Link
                    to={`/assistant/inbox?search=${encodeURIComponent(c.email)}`}
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Ingested Emails &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>No executive clients joined yet. Provide your workspace Team Code ({team?.teamCode || 'ADIS-4BAAB6'}) to your client on registration.</span>
            <Link to="/assistant/team" className="font-bold underline text-amber-950 whitespace-nowrap">
              Share Workspace Code &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* AI Insights Banner calculated from actual data */}
      {insights && insights.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-brand-50/80 to-purple-50/50 rounded-2xl border border-brand-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-900 uppercase tracking-wider">MailPilot AI Insights</div>
              <div className="text-xs text-gray-700 mt-0.5 space-y-1">
                {insights.map((item, idx) => (
                  <p key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    {item.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <Link
            to="/assistant/inbox?segment=client-to-reply"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-brand-700 hover:bg-brand-50 border border-brand-200/80 shadow-2xs transition whitespace-nowrap"
          >
            Review Escalations &rarr;
          </Link>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Link
          to="/assistant/inbox"
          className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:border-brand-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Ingested</span>
            <Inbox className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalEmails || 0}</div>
          <div className="text-[11px] text-muted mt-1">{stats?.unreadEmails || 0} unread</div>
        </Link>

        <Link
          to="/assistant/inbox?segment=assistant-to-reply"
          className="p-4 bg-white rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-2xs hover:border-blue-400 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-900">PA to Reply</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-950 mt-2">{stats?.assistantToReply || 0}</div>
          <div className="text-[11px] text-blue-600 mt-1">Ready for routine action</div>
        </Link>

        <Link
          to="/assistant/inbox?segment=client-to-reply"
          className="p-4 bg-white rounded-2xl border border-amber-300 bg-amber-50/30 shadow-2xs hover:border-amber-400 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Client to Reply</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950 mt-2">{stats?.clientToReply || 0}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">Requires executive decision</div>
        </Link>

        <Link
          to="/assistant/inbox?segment=no-reply-needed"
          className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">No Reply Needed</span>
            <UserX className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.noReplyNeeded || 0}</div>
          <div className="text-[11px] text-muted mt-1">Receipts & newsletters</div>
        </Link>

        <Link
          to="/assistant/inbox?segment=waiting-response"
          className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Waiting Response</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats?.waitingForResponse || 0}</div>
          <div className="text-[11px] text-muted mt-1">Awaiting third-party</div>
        </Link>
      </div>

      {/* Main Grid: Priority Section + Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Section: 2 cols on desktop */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Priority Attention Threads</h3>
              <p className="text-xs text-muted">Critical conversations prioritized by AI and client tags</p>
            </div>
            <Link
              to="/assistant/inbox"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all inbox <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 shadow-2xs overflow-hidden">
            {priorityConversations && priorityConversations.length > 0 ? (
              priorityConversations.map((conv) => (
                <Link
                  key={conv._id}
                  to={`/assistant/inbox/${conv._id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-900 truncate">
                        {conv.participants[0]?.name || 'Sender'}
                      </span>
                      <ResponsibilityBadge responsibility={conv.currentResponsibility} />
                      <CategoryBadge category={conv.aiCategory} />
                      {conv.isImportant && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Important
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition truncate">
                      {conv.subject}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                      {conv.summary}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between text-xs text-muted">
                    <span>{new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="text-xs font-semibold text-brand-600 group-hover:underline flex items-center gap-0.5 mt-1">
                      Open thread <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">0 Emails — No Client Connected Yet</h4>
                <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                  As designed, when a Personal Assistant first sets up a workspace, there are 0 emails. Once an executive client registers with your Team Code (<span className="font-mono font-bold text-brand-600">{team?.teamCode || 'MAIL-8X92K'}</span>), their inbox will instantly synchronize here in real time!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(team?.teamCode || 'MAIL-8X92K');
                      toast.success('Team Code copied! Send this to your client.');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-2xs transition"
                  >
                    Copy Client Invite Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Upcoming Meetings & Extracted Items */}
        <div className="space-y-6">
          {/* Upcoming Meetings Section */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900">Extracted Calendar Items</h3>
              </div>
              <span className="text-[11px] font-semibold text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                {upcomingMeetings?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {upcomingMeetings && upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((item) => (
                  <Link
                    key={item._id}
                    to={`/assistant/inbox/${item._id}`}
                    className="block p-3 rounded-xl bg-gray-50 hover:bg-brand-50/40 border border-gray-100 hover:border-brand-200 transition"
                  >
                    <div className="text-xs font-semibold text-gray-900 truncate">{item.subject}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-brand-700 font-medium">
                      <Clock className="w-3 h-3" />
                      {item.extractedDates && item.extractedDates[0]
                        ? item.extractedDates[0].rawText
                        : 'Meeting coordination required'}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted text-center py-4">No upcoming meeting requests.</p>
              )}
            </div>
          </div>

          {/* Assistant Action Shortcuts */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Quick Assistant Tools</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Query your email database using conversational natural language with Gemini Copilot.
            </p>
            <Link
              to="/assistant/ai-chat"
              className="w-full py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open AI Copilot
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

