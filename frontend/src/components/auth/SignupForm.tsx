'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';

interface SignupFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function SignupForm({
  redirectPath = '/command-center',
  onSuccess,
  className = '',
}: SignupFormProps) {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Environment Officer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your official email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      if (onSuccess) {
        onSuccess();
      }
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Unable to register account. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`w-full max-w-lg bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-card ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Register Officer Account
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Create credentials for the PranaMap environmental intelligence platform
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

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="signup-name">
            Full Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Sharma"
              autoComplete="name"
              className="w-full pl-9 pr-3 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="signup-email">
            Official Email <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-email"
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

        {/* Organization & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="signup-org">
              Organization <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="signup-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. CPCB / RSPCB / Municipal Corp"
                className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-xs focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="signup-role">
              Professional Role
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="signup-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface text-text-primary border border-border rounded-lg text-xs focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors cursor-pointer"
              >
                <option value="Environment Officer">Environment Officer</option>
                <option value="Municipal Commissioner">Municipal Authority</option>
                <option value="Pollution Board Scientist">Pollution Board Scientist</option>
                <option value="Researcher / Analyst">Researcher / Analyst</option>
                <option value="Civil Society / Citizen Analyst">Civil Society / Public</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="signup-password">
            Password <span className="text-rose-600">*</span> <span className="text-text-muted font-normal">(min. 6 characters)</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5" htmlFor="signup-confirm-password">
            Confirm Password <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              className="w-full pl-9 pr-3 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-forest text-white rounded-lg text-sm font-semibold hover:bg-forestSecondary transition-colors disabled:opacity-60 shadow-sm mt-2"
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
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="font-semibold text-forestSecondary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
