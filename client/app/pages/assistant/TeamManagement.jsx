import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';
import toast from 'react-hot-toast';

export const TeamManagement = () => {
  const { team } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams/members');
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      toast.error('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      setApprovingId(userId);
      const res = await api.post('/teams/approve-member', {
        userId,
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Member status updated to ${newStatus}.`);
        setMembers((prev) =>
          prev.map((m) => (m._id === userId ? { ...m, membershipStatus: newStatus } : m))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update member status.');
    } finally {
      setApprovingId(null);
    }
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team?.teamCode || 'MAIL-8X92K');
    toast.success('Workspace Team Code copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Team & Workspace Management
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Manage client assignments, PA permissions, and member approvals
          </p>
        </div>

        <button
          onClick={fetchMembers}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Members
        </button>
      </div>

      {/* Team Code Share Card */}
      <div className="bg-gradient-to-r from-brand-50 to-indigo-50/60 p-5 rounded-2xl border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-900">
            Workspace Invite Credentials
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {team?.name || "Aditya's Workspace"}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed max-w-md">
            Share this non-guessable Team Code with executive clients or fellow assistants to register into this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-brand-200/80 shadow-xs">
          <span className="font-mono font-bold text-sm text-brand-600 tracking-wider">
            {team?.teamCode || 'MAIL-8X92K'}
          </span>
          <button
            onClick={copyTeamCode}
            className="p-1 text-gray-400 hover:text-brand-600 transition"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Member Roster Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Active Roster & Access Controls</h3>
          <span className="text-xs font-medium text-muted">{members.length} members</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div
                key={member._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={member.name}
                    email={member.email}
                    avatar={member.avatar}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{member.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          member.role === 'assistant'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {member.role === 'assistant' ? 'Personal Assistant' : 'Executive Client'}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>{member.email}</span>
                      {member.title && <span>&bull; {member.title}</span>}
                    </div>
                  </div>
                </div>

                {/* Membership Status & Administrative Actions */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      member.membershipStatus === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : member.membershipStatus === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        member.membershipStatus === 'active'
                          ? 'bg-emerald-500'
                          : member.membershipStatus === 'pending'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    {member.membershipStatus?.toUpperCase()}
                  </span>

                  {/* Actions for pending members */}
                  {member.membershipStatus === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(member._id, 'active')}
                        disabled={approvingId === member._id}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(member._id, 'rejected')}
                        disabled={approvingId === member._id}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted">No members found.</div>
        )}
      </div>
    </div>
  );
};

