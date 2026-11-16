import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Filter, UserCheck } from 'lucide-react';

export const ClientOnboarding = () => {
  const { user, team } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFE] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl p-8 shadow-card border border-gray-100 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 text-brand-700 uppercase tracking-wider">
            Workspace: {team?.name || "Executive Team"}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            Welcome to Your Focus Portal, {user?.name}
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed max-w-md mx-auto">
            MailPilot is calibrated to protect your time. Your Personal Assistant and Gemini AI filter the noise so you only see decisions requiring your direct authority.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-left">
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <Filter className="w-5 h-5 text-brand-600 mb-2" />
            <div className="text-xs font-semibold text-gray-900">Zero Noise</div>
            <p className="text-[11px] text-muted mt-1 leading-snug">
              Newsletters, logistics, and routine replies stay with your PA.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <Sparkles className="w-5 h-5 text-brand-600 mb-2" />
            <div className="text-xs font-semibold text-gray-900">Executive Summaries</div>
            <p className="text-[11px] text-muted mt-1 leading-snug">
              Understand context and why your input is required in 5 seconds.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <UserCheck className="w-5 h-5 text-brand-600 mb-2" />
            <div className="text-xs font-semibold text-gray-900">Instant Handover</div>
            <p className="text-[11px] text-muted mt-1 leading-snug">
              One click to ask your PA to take over or mark as handled.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/client/dashboard')}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-dark hover:bg-gray-800 shadow-sm flex items-center justify-center gap-2 transition"
        >
          Open Client Attention Center <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

