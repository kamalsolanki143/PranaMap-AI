'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  MapPin,
  Wind,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/command-center';
  const { signIn, signInWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your official email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Google authentication could not be completed.');
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
              GovTech Platform
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
        >
          <span>Return to Observatory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: Brand Identity & Atmospheric Visualization */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surfaceAlt border border-border text-xs text-forestSecondary font-medium w-fit">
              <ShieldCheck className="w-4 h-4 text-forestSecondary" />
              <span>Verified Indian Environmental Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.15]">
              Environmental intelligence,{' '}
              <span className="text-forestSecondary">grounded in real data.</span>
            </h1>

            <p className="text-base text-text-secondary leading-relaxed max-w-xl">
              Monitor air quality, understand atmospheric conditions, and coordinate evidence-based
              climate response across India with continuous CPCB ground monitoring and Copernicus assimilation.
            </p>

            {/* Environmental Snapshot Preview Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forestSecondary" />
                  <span className="text-xs font-semibold text-text-primary">National Airshed Coverage</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-forestSecondary border border-emerald-200">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-surfaceAlt rounded-xl border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Active Stations</span>
                  <span className="text-lg font-bold text-text-primary">27 CAAQMS</span>
                  <span className="text-[11px] text-forestSecondary block">Verified CPCB</span>
                </div>

                <div className="p-3 bg-surfaceAlt rounded-xl border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Resolution</span>
                  <span className="text-lg font-bold text-text-primary">Hyperlocal</span>
                  <span className="text-[11px] text-atmoBlue block">Spatial Truth</span>
                </div>

                <div className="p-3 bg-surfaceAlt rounded-xl border border-border">
                  <span className="text-[10px] text-text-muted uppercase font-mono block">Coupling</span>
                  <span className="text-lg font-bold text-text-primary">Synoptic NWP</span>
                  <span className="text-[11px] text-terracotta block">Open-Meteo & CAMS</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-atmoBlue" />
                  Diurnal Inversion & Dispersion Modeling
                </span>
                <span className="font-mono text-[11px]">CPCB NAQI Standard</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Clean GovTech Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  Sign In
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Access your environmental intelligence workspace
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-criticalTone">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-text-primary" htmlFor="password">
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
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:border-forestSecondary focus:ring-1 focus:ring-forestSecondary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-forestSecondary hover:bg-forestPrimary text-white rounded-lg text-sm font-semibold transition-all shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-surface text-text-muted font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
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

              {/* Bottom Registration Link */}
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
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border bg-surface text-center text-xs text-text-muted">
        <span>PranaMap AI · Environmental Intelligence & Climate Resilience Platform · CPCB Standard</span>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-text-muted">Loading authentication workspace...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
