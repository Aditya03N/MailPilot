import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Plus, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  // 'create' = Create a Team (Personal Assistant)
  // 'join'   = Join a Team (Client)
  const [mode, setMode] = useState('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (mode === 'create' && !workspaceName.trim()) {
      toast.error('Please provide a workspace / team name.');
      return;
    }

    if (mode === 'join' && !teamCode.trim()) {
      toast.error('Please enter the PA Team Code.');
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        password,
        mode,
        workspaceName: mode === 'create' ? workspaceName.trim() : undefined,
        teamCode: mode === 'join' ? teamCode.trim().toUpperCase() : undefined,
        requestedRole: mode === 'join' ? 'client' : 'assistant',
      });

      if (mode === 'create') {
        toast.success(`Workspace created! Team Code: ${data.team.teamCode}`);
        navigate('/assistant/dashboard');
      } else {
        toast.success(`Successfully joined ${data.team?.name || 'the workspace'} as Client!`);
        navigate('/client/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white mx-auto flex items-center justify-center font-bold shadow-lg shadow-brand-500/25 mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Create Your MailPilot Account
        </h2>
        <p className="mt-1 text-xs text-muted">
          Choose whether you are setting up as a Personal Assistant or joining an existing PA workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-card border border-gray-100">
          {/* Registration Mode Selector */}
          <div className="grid grid-cols-2 p-1 bg-gray-100/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                mode === 'create'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-brand-600" />
              Create a Team (PA)
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                mode === 'join'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-brand-600" />
              Join a Team (Client)
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'create' ? "Aditya Anande" : "Rahul Sharma"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition"
                />
              </div>
            </div>

            {mode === 'create' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Workspace / Team Name
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Aditya's Executive Office"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition"
                />
                <p className="mt-1 text-[11px] text-muted">
                  You will become the workspace owner (Personal Assistant) and receive a unique Team Code to share with your clients.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  PA Team Code
                </label>
                <input
                  type="text"
                  required
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MAIL-8X92K"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-mono uppercase tracking-wider outline-none transition"
                />
                <p className="mt-1 text-[11px] text-muted">
                  Enter the unique Team Code provided by your Personal Assistant to automatically link your accounts.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-sm shadow-brand-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{mode === 'create' ? 'Create Team & Register as PA' : 'Join Team & Register as Client'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
