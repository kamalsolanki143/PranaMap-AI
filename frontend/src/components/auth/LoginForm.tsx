'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';

interface LoginFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function LoginForm({
  redirectPath = '/command-center',
  onSuccess,
  className = '',
}: LoginFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your official email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      if (onSuccess) {
        onSuccess();
      }
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`w-full max-w-md bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          PranaMap AI
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Sign in to your environmental intelligence workspace
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="login-email">
            Official Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@pranamap.gov.in"
              autoComplete="email"
              className="w-full pl-9 pr-3 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-text-primary" htmlFor="login-password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-forestSecondary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="w-full pl-9 pr-10 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-forest text-white rounded-lg text-sm font-semibold hover:bg-forestSecondary transition-colors disabled:opacity-60 shadow-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-3 text-text-muted font-medium">Or continue with</span>
        </div>
      </div>

      {/* Google Sign-in */}
      <GoogleSignInButton
        redirectPath={redirectPath}
        onError={(msg) => setError(msg)}
      />

      {/* Bottom link */}
      <div className="mt-6 text-center text-xs text-text-secondary">
        <span>New environmental officer or researcher? </span>
        <Link
          href="/signup"
          className="font-semibold text-forestSecondary hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
