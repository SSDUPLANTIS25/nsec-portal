"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, Wrench, Calendar, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const { isLoggedIn, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace("/dashboard");
  }, [isLoggedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email || "seth@nationalstage.com", password);
      setLoading(false);
    }, 600);
  };

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-navy-900 flex-col justify-between p-10 relative overflow-hidden">
        {/* Gradient orb decoration */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white text-sm font-bold shadow-lg">
              NS
            </div>
            <div>
              <p className="text-white font-semibold text-sm">National Stage</p>
              <p className="text-navy-400 text-xs">Equipment Company</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your crew,<br />your projects,<br />
            <span className="text-brand-blue">one platform.</span>
          </h2>
          <p className="text-navy-300 text-sm leading-relaxed max-w-sm">
            Manage installations, track orders, coordinate crews, and keep every project on schedule from a single dashboard.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3 text-navy-300 text-sm">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-brand-blue" />
            </div>
            Installation scheduling & crew dispatch
          </div>
          <div className="flex items-center gap-3 text-navy-300 text-sm">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-brand-blue" />
            </div>
            Project tracking from bid to completion
          </div>
          <div className="flex items-center gap-3 text-navy-300 text-sm">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-brand-blue" />
            </div>
            Real-time KPIs powered by Monday.com
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 lg:hidden bg-navy-900">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center text-white text-xl font-bold mb-5 shadow-lg shadow-blue-500/30">
            NS
          </div>
          <h1 className="text-xl font-bold text-white text-center">National Stage Equipment</h1>
          <p className="text-navy-300 mt-1.5 text-sm text-center">Employee Portal</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-t-3xl lg:rounded-none flex-1 flex items-start lg:items-center justify-center px-6 pt-8 pb-10 lg:px-16 xl:px-24 shadow-2xl lg:shadow-none">
          <div className="w-full max-w-sm">
            {/* Desktop header */}
            <div className="hidden lg:block mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to your employee portal</p>
            </div>

            {/* Mobile header */}
            <div className="lg:hidden mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
              <p className="text-sm text-gray-500 mt-0.5">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@nationalstage.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <button type="button" className="text-xs text-brand-blue font-medium hover:text-blue-700 transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                <span className="text-sm text-gray-600">Keep me signed in</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-brand-blue text-white font-semibold text-sm shadow-sm hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Demo mode — enter any email or just tap Sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
