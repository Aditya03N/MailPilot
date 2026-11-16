import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  CheckCircle2,
  AlertCircle,
  Star,
  Archive,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ResponsibilityBadge, CategoryBadge } from '../../components/Badges';
import toast from 'react-hot-toast';

export const InboxList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = searchParams.get('segment') || '';
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (segment) params.segment = segment;
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (sort) params.sort = sort;

      const res = await api.get('/conversations', { params });
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      toast.error('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [segment, sort, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchConversations();
  };

  const handleToggleImportant = async (e, convId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.patch(`/conversations/${convId}/important`);
      if (res.data.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === convId ? { ...c, isImportant: res.data.isImportant } : c))
        );
        toast.success(res.data.isImportant ? 'Marked as Important' : 'Removed from Important');
      }
    } catch (err) {
      toast.error('Failed to update importance.');
    }
  };

  const handleToggleArchive = async (e, convId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.patch(`/conversations/${convId}/archive`);
      if (res.data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        toast.success('Conversation archived.');
      }
    } catch (err) {
      toast.error('Failed to archive conversation.');
    }
  };

  const segmentTitles = {
    '': 'All Ingested Communications',
    'assistant-to-reply': 'Assistant to Reply Queue',
    'client-to-reply': 'Client Attention Escalations',
    'no-reply-needed': 'No Reply Needed (Newsletters & Receipts)',
    'action-required': 'Action Required',
    'important': 'Important Conversations',
    'meetings': 'Meetings & Calendar Appointments',
    'waiting-response': 'Waiting for Response',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {segmentTitles[segment] || 'Inbox'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {conversations.length} conversation{conversations.length === 1 ? '' : 's'} found
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, sender, body..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
            />
          </form>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:border-brand-500"
          >
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="MEETINGS">Meetings</option>
            <option value="IMPORTANT">Important</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="FINANCE">Finance</option>
            <option value="LEGAL">Legal</option>
            <option value="NEWSLETTER">Newsletter</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:border-brand-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <button
            onClick={fetchConversations}
            title="Refresh"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Segment Pill Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { label: 'All', val: '' },
          { label: 'PA to Reply', val: 'assistant-to-reply' },
          { label: 'Client to Reply', val: 'client-to-reply' },
          { label: 'No Reply Needed', val: 'no-reply-needed' },
          { label: 'Meetings', val: 'meetings' },
          { label: 'Action Required', val: 'action-required' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setSearchParams(item.val ? { segment: item.val } : {})}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition ${
              segment === item.val
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Conversations Table / List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => {
            const sender = conv.participants[0] || { name: 'Unknown', email: 'unknown@example.com' };
            const previewText = conv.messages[0]?.bodyText || conv.summary;

            return (
              <Link
                key={conv._id}
                to={`/assistant/inbox/${conv._id}`}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition group hover:bg-gray-50/80 ${
                  conv.isUnread ? 'bg-brand-50/20' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Unread & Star Icons */}
                  <div className="flex items-center gap-2 pt-0.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        conv.isUnread ? 'bg-brand-500' : 'bg-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleToggleImportant(e, conv._id)}
                      className={`p-1 rounded hover:bg-gray-200/60 transition ${
                        conv.isImportant ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${conv.isImportant ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Main Details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs ${conv.isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {sender.name}
                      </span>
                      <span className="text-[11px] text-muted hidden sm:inline">&bull; {sender.email}</span>
                      <ResponsibilityBadge responsibility={conv.currentResponsibility} />
                      <CategoryBadge category={conv.aiCategory} />
                      {conv.clientId && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Client: {conv.clientId.name || 'Client'}
                        </span>
                      )}
                      {conv.escalatedToClient && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Sent to Client
                        </span>
                      )}
                    </div>

                    <div className={`text-sm ${conv.isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'} group-hover:text-brand-600 transition truncate`}>
                      {conv.subject}
                    </div>

                    <p className="text-xs text-muted line-clamp-1 leading-relaxed">
                      {previewText}
                    </p>
                  </div>
                </div>

                {/* Right metadata and quick actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pl-8 md:pl-0 shrink-0">
                  <span className="text-xs text-muted font-medium">
                    {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleToggleArchive(e, conv._id)}
                    title="Archive thread"
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No conversations in this view</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              No matching emails found for this segment or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

