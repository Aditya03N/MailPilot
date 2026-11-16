import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Shield,
  ArrowRight,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = ({ initialRole = 'assistant' }) => {
  const location = useLocation();
  const isClientPath = location.pathname.includes('/client') || initialRole === 'client';
  const [roleTab, setRoleTab] = useState(isClientPath ? 'client' : 'assistant');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/login/client') {
      setRoleTab('client');
    } else if (location.pathname === '/login') {
      setRoleTab('assistant');
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);

      if (rememberMe) {
        localStorage.setItem('mailpilot_remember_email', email);
      } else {
        localStorage.removeItem('mailpilot_remember_email');
      }

      // Automatic role-based routing
      if (data.user.role === 'assistant') {
        navigate('/assistant/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid credentials. Please verify your email and password.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      {/* Outer Card with Rounded Corners and Soft Shadow */}
      <div className="w-full max-w-[1040px] bg-white rounded-[32px] shadow-2xl shadow-indigo-950/5 border border-indigo-50/80 overflow-hidden flex flex-col md:flex-row min-h-[640px]">
        {/* ================= LEFT SIDE: Hero & Branding Showcase ================= */}
        <div className="w-full md:w-[48%] bg-gradient-to-br from-[#F6F4FF] via-[#EDE9FE]/90 to-[#FAF8FF] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-indigo-100/50">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

          {/* Top Branding */}
          <div className="relative z-10 space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {/* Origami Paper Plane Logo */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#543EE8] to-[#6E56FF] flex items-center justify-center shadow-md shadow-[#543EE8]/25 text-white">
                <svg className="w-5 h-5 -rotate-12 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-[#19154E] tracking-tight">MailPilot</span>
            </div>
            <p className="text-[12px] font-semibold text-[#6A52F4] tracking-wide pt-1">
              Your AI-Powered Email Assistant
            </p>
          </div>

          {/* Main Hero Copy & Central Workflow Illustration */}
          <div className="relative z-10 py-6 my-auto text-center">
            <h1 className="text-2xl sm:text-[28px] font-black text-[#14103E] tracking-tight leading-snug">
              Work Smarter.<br />
              <span className="text-[#543EE8]">Manage Emails Better.</span>
            </h1>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed font-normal">
              Let your Personal Assistant and AI handle the email workflow together.
            </p>

            {/* Workflow Diagram: PA <-> Gmail <-> Client */}
            <div className="relative mt-8 pt-4 pb-2 max-w-[340px] mx-auto">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 180" fill="none">
                <path
                  d="M75 90 C 85 45, 140 35, 170 45"
                  stroke="#8B5CF6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.45"
                />
                <path
                  d="M265 90 C 255 45, 200 35, 170 45"
                  stroke="#8B5CF6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.45"
                />
              </svg>

              {/* Central Gmail Hub */}
              <div className="relative z-10 flex justify-center -mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-md shadow-indigo-100 border border-purple-100 flex items-center justify-center p-2.5 transition hover:scale-105 duration-200">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
              </div>

              {/* Roles: PA (Left) & Client (Right) with Active Highlight */}
              <div className="flex items-center justify-between px-2">
                <div
                  onClick={() => setRoleTab('assistant')}
                  className={`w-[100px] p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border transition cursor-pointer ${
                    roleTab === 'assistant'
                      ? 'border-[#543EE8] ring-2 ring-[#543EE8]/30 shadow-md'
                      : 'border-purple-100 shadow-sm opacity-80 hover:opacity-100'
                  } flex flex-col items-center text-center space-y-1`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shadow-2xs">
                    👨‍💼
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight">
                    Personal<br />Assistant
                  </span>
                </div>

                {/* Sparkling Ray Accents */}
                <div className="flex flex-col items-center text-indigo-400">
                  <div className="flex gap-1">
                    <span className="w-1 h-2 bg-indigo-400 rounded-full rotate-[-25deg]"></span>
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                    <span className="w-1 h-2 bg-indigo-400 rounded-full rotate-[25deg]"></span>
                  </div>
                </div>

                <div
                  onClick={() => setRoleTab('client')}
                  className={`w-[100px] p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border transition cursor-pointer ${
                    roleTab === 'client'
                      ? 'border-[#543EE8] ring-2 ring-[#543EE8]/30 shadow-md'
                      : 'border-purple-100 shadow-sm opacity-80 hover:opacity-100'
                  } flex flex-col items-center text-center space-y-1`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-rose-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs shadow-2xs">
                    👩‍💼
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight">
                    Executive<br />Client
                  </span>
                </div>
              </div>

              {/* Central Laptop Showcase */}
              <div className="mt-4 flex justify-center">
                <div className="relative w-44">
                  <div className="w-36 mx-auto h-22 rounded-t-xl bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] p-1.5 shadow-lg border border-slate-300 flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full rounded-t-lg bg-gradient-to-b from-[#1E1B4B] to-[#312E81] flex items-center justify-center relative shadow-inner">
                      <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-xs">
                        <svg className="w-4 h-4 text-brand-300 -rotate-12 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="w-44 h-2.5 mx-auto rounded-b-lg bg-gradient-to-r from-[#94A3B8] via-[#E2E8F0] to-[#94A3B8] shadow-md border-t border-slate-200"></div>
                  <div className="w-36 h-1 mx-auto bg-indigo-500/15 rounded-full blur-xs mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Feature Pills */}
          <div className="relative z-10 pt-4 border-t border-indigo-100/60 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#543EE8] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 leading-tight">AI-Powered<br />Insights</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#543EE8] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 leading-tight">Smart<br />Prioritization</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#543EE8] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 leading-tight">Secure &amp;<br />Private</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Authentication Form ================= */}
        <div className="w-full md:w-[52%] p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-5">
            {/* Top Role Selector Tabs */}
            <div className="flex items-center justify-between p-1 bg-gray-100/90 rounded-2xl border border-gray-200/70">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('assistant');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  roleTab === 'assistant'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>Personal Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleTab('client');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  roleTab === 'client'
                    ? 'bg-white text-[#543EE8] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#543EE8]" />
                <span>Executive Client</span>
              </button>
            </div>

            {/* Header Titles Based on Active Role */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-[#14103E] tracking-tight">
                {roleTab === 'assistant' ? 'Personal Assistant Sign In' : 'Sign in as Executive Client'}
              </h2>
              <p className="text-xs text-gray-500 font-normal">
                {roleTab === 'assistant'
                  ? 'Sign in to manage client inboxes, AI triage, and executive workflows'
                  : 'Access your noise-free attention center to review matters & delegate to your PA'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  {roleTab === 'assistant' ? 'Work Email Address' : 'Client Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleTab === 'assistant' ? 'assistant@company.com' : 'client@company.com'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#543EE8] focus:ring-2 focus:ring-[#543EE8]/15 outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#543EE8] focus:ring-2 focus:ring-[#543EE8]/15 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#543EE8] focus:ring-[#543EE8]/20"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => toast('Password reset is managed by your workspace admin.', { icon: '🔑' })}
                  className="font-bold text-[#543EE8] hover:text-[#432EC8] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#543EE8] hover:bg-[#4632CC] shadow-md shadow-[#543EE8]/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{roleTab === 'assistant' ? 'Sign In as Personal Assistant' : 'Sign In as Client'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">Account Options</span>
              </div>
            </div>

            {/* Full Registration & Portal Switching Options */}
            <div className="space-y-2 text-center text-xs text-gray-600 pt-1">
              {roleTab === 'assistant' ? (
                <>
                  <div>
                    New Personal Assistant?{' '}
                    <Link to="/register" className="font-bold text-[#543EE8] hover:text-[#432EC8] hover:underline">
                      Create a Team Workspace
                    </Link>
                  </div>
                  <div>
                    Are you an Executive Client?{' '}
                    <button
                      type="button"
                      onClick={() => setRoleTab('client')}
                      className="font-bold text-gray-800 hover:text-[#543EE8] hover:underline inline-flex items-center gap-1"
                    >
                      Sign In as Client &rarr;
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    New Client?{' '}
                    <Link to="/register" className="font-bold text-[#543EE8] hover:text-[#432EC8] hover:underline">
                      Join with PA Team Code
                    </Link>
                  </div>
                  <div>
                    Are you a Personal Assistant?{' '}
                    <button
                      type="button"
                      onClick={() => setRoleTab('assistant')}
                      className="font-bold text-gray-800 hover:text-[#543EE8] hover:underline inline-flex items-center gap-1"
                    >
                      Sign In to PA Portal &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
