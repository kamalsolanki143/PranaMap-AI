'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Building,
  Briefcase,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('ENVIRONMENT_OFFICER');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/command-center');
    }
  }, [isAuthenticated, router]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full official name.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide a valid official email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
      router.push('/command-center');
    } catch (err: any) {
      setError(err.message || 'Unable to register account. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/command-center');
    } catch (err: any) {
      setError(err.message || 'Google registration could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between">
      {/* Top Header */}
      <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-border bg-surface">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forestSecondary/10 border border-forestSecondary/20 flex items-center justify-center text-forestSecondary">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-text-primary">
              PRANAMAP AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-surfaceAlt border border-border text-text-secondary">
              Officer Onboarding
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
        >
          <span>Already have an account? Sign in</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Form Section */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-forestSecondary font-medium mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Access Registration</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Create Officer Workspace
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Join environmental officers, municipal authorities, and atmospheric researchers across India.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-criticalTone">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="fullName">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Rajesh Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="email">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.sharma@cpcb.gov.in"
                  className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Organization & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="org">
                  Organization <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. CPCB, SPCB, Municipal Corp"
                    className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="role">
                  Professional Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors cursor-pointer"
                  >
                    <option value="ENVIRONMENT_OFFICER">Environment Officer</option>
                    <option value="CITY_AUTHORITY">Municipal Authority</option>
                    <option value="VIEWER">Atmospheric Researcher</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="password">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full pl-9 pr-9 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-forestSecondary hover:bg-forestPrimary text-white rounded-lg text-sm font-semibold transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-surface text-text-muted font-medium">Or register with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className="w-full py-2.5 px-4 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm font-medium text-text-primary transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-forestSecondary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border bg-surface text-center text-xs text-text-muted">
        <span>PranaMap AI · Environmental Intelligence & Climate Resilience Platform</span>
      </footer>
    </div>
  );
}
