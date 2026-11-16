import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, Send, Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AIChatCopilot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am your MailPilot Copilot. I have indexed your current workspace emails, classifications, client escalations, and calendar items. Ask me anything like:\n• 'What emails require client attention?'\n• 'Find upcoming meetings this week'\n• 'Summarize urgent budget approvals'\n• 'What am I waiting for a response on?'",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);

    try {
      setLoading(true);
      const res = await api.post('/ai/chat', { message: userQuery });
      if (res.data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
      }
    } catch (err) {
      toast.error('AI chat query failed.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error querying the workspace database. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Which emails require client attention?',
    'What meetings need scheduling coordination?',
    'Show me the highest priority threads',
    'Summarize emails from this week',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            AI Assistant Copilot
          </h2>
          <p className="text-xs text-muted">
            Conversational RAG query system over your authorized team email database
          </p>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 p-5 overflow-y-auto space-y-4 shadow-2xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-500 text-white rounded-br-none'
                  : 'bg-gray-50 border border-gray-200/70 text-gray-800 rounded-bl-none whitespace-pre-line'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            MailPilot Copilot is querying your database with Gemini...
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(q);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200/80 hover:border-brand-300 text-[11px] font-medium text-gray-700 whitespace-nowrap transition shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your emails or request an action..."
          disabled={loading}
          className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200 bg-white text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition shadow-2xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

