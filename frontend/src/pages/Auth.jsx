import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, Mail, Lock, User, BookOpen, Hash, Eye, EyeOff, 
  Sparkles, ArrowRight, FileText, Brain, Target, TrendingUp
} from 'lucide-react';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'CSE',
    semester: 5,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        await register(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ ...form, email: 'student@edutrack.com', password: 'student123' });
    setError('');
  };

  const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'];

  const features = [
    { icon: FileText, label: 'Smart Notes', desc: 'AI-powered note organization', color: 'from-purple-500 to-pink-500' },
    { icon: Brain, label: 'AI Insights', desc: 'Personalized study analysis', color: 'from-indigo-500 to-violet-500' },
    { icon: Target, label: 'Study Hub', desc: 'Track assignments & tasks', color: 'from-orange-500 to-red-500' },
    { icon: TrendingUp, label: 'Progress', desc: 'Visualize your growth', color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">EduTrack</h1>
              <p className="text-white/60 text-sm">Your study companion</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-sm font-medium text-white/70 uppercase tracking-wider">Smart Learning Platform</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Study smarter,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">not harder.</span>
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              Organize notes, track progress, and get AI-powered insights — all in one place.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10
                         hover:bg-white/15 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-indigo-500/30">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EduTrack
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Your study companion</p>
          </div>

          {/* Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-500/10 dark:shadow-black/30 border border-gray-200/50 dark:border-gray-700/50 p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                {isLogin ? 'Sign in to continue your learning journey' : 'Start your study journey with EduTrack'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-1.5">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  isLogin
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (register only) */}
              {!isLogin && (
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rahul Mahato"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
                               bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                               focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
                             bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                             focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
                             bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                             focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Branch & Semester (register only) */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Branch</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <select
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
                                 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                                 transition-all duration-200 appearance-none cursor-pointer"
                      >
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <select
                        name="semester"
                        value={form.semester}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl 
                                 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                                 transition-all duration-200 appearance-none cursor-pointer"
                      >
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                         text-white font-semibold rounded-xl transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed 
                         shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                         transform hover:scale-[1.02] active:scale-[0.98]
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>

            {/* Demo credentials */}
            {isLogin && (
              <button
                onClick={fillDemo}
                type="button"
                className="mt-4 w-full p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 
                         rounded-2xl border border-indigo-100 dark:border-indigo-800/50 
                         hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30
                         transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Try Demo Account
                    </p>
                    <p className="text-xs text-indigo-500/70 dark:text-indigo-300/50 mt-0.5 font-mono">
                      student@edutrack.com
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            © 2026 EduTrack. Built for students, by students.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
