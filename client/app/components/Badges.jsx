import React from 'react';
import { Sparkles, Bot, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const ResponsibilityBadge = ({ responsibility }) => {
  switch (responsibility) {
    case 'ASSISTANT_TO_REPLY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
          <Bot className="w-3.5 h-3.5 text-blue-600" />
          PA to Reply
        </span>
      );
    case 'CLIENT_TO_REPLY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Client to Reply
        </span>
      );
    case 'NO_REPLY_NEEDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
          No Reply Needed
        </span>
      );
    case 'NEEDS_REVIEW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
          Needs Review
        </span>
      );
  }
};

export const CategoryBadge = ({ category }) => {
  const styles = {
    MEETINGS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    IMPORTANT: 'bg-rose-50 text-rose-700 border-rose-200',
    ACTION_REQUIRED: 'bg-orange-50 text-orange-700 border-orange-200',
    WAITING_RESPONSE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    NEWSLETTER: 'bg-slate-100 text-slate-600 border-slate-200',
    FINANCE: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    LEGAL: 'bg-violet-50 text-violet-700 border-violet-200',
    GENERAL: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const currentStyle = styles[category] || styles.GENERAL;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${currentStyle}`}>
      {category?.replace('_', ' ')}
    </span>
  );
};

