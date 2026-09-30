'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  ShieldCheck,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Please provide your registered official email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Unable to send password reset link. Please check the email address.');
    } finally {
      setLoading(false);
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
              Account Recovery
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Section */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Enter your official email address to receive a secure Firebase password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-criticalTone">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-forestSecondary shrink-0 mt-0.5" />
                <div className="text-xs text-forestPrimary space-y-1">
                  <p className="font-semibold">Reset link dispatched successfully</p>
                  <p className="leading-relaxed">
                    We have transmitted a secure password reset link to <strong className="font-mono">{email}</strong>.
                    Please check your inbox or spam directory.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-forestSecondary hover:bg-forestPrimary text-white rounded-lg text-sm font-semibold transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="email">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@pranamap.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-forestSecondary hover:bg-forestPrimary text-white rounded-lg text-sm font-semibold transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-text-secondary">
                <span>Remembered your password? </span>
                <Link href="/login" className="font-semibold text-forestSecondary hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border bg-surface text-center text-xs text-text-muted">
        <span>PranaMap AI · Environmental Intelligence & Climate Resilience Platform</span>
      </footer>
    </div>
  );
}
