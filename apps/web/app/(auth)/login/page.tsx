"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, Loader2, Instagram, Check, Zap, Shield, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const TRUST_POINTS = [
  { icon: Zap, text: "Auto-DM in under 2 seconds" },
  { icon: Shield, text: "Official Meta API — zero bans" },
  { icon: BarChart3, text: "10M+ DMs sent, 99% delivery rate" },
];

const LinkBhejoLogo = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="44" height="44" rx="10" stroke="#00e599" strokeWidth="2" />
    <path d="M16 14V34H32" stroke="#00e599" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [igLoading, setIgLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    // Prefetch dashboard so JS chunks are ready before the user finishes logging in
    router.prefetch("/dashboard");

    if (lockoutUntil) {
      const timeRemaining = lockoutUntil - Date.now();
      if (timeRemaining > 0) {
        const timer = setTimeout(() => {
          setLockoutUntil(null);
          setFailedAttempts(0);
          setAuthError(null);
        }, timeRemaining);
        return () => clearTimeout(timer);
      } else {
        setLockoutUntil(null);
        setFailedAttempts(0);
      }
    }
  }, [lockoutUntil, router]);

  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    if (isLocked) {
      setAuthError("Too many failed attempts. Please wait.");
      toast.error("Account temporarily locked");
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 60 * 1000);
          setAuthError("Too many failed attempts. Please try again in 60s.");
          toast.error("Too many failed attempts");
        } else {
          setAuthError(`Invalid email or password. (${5 - newAttempts} attempts left)`);
          toast.error("Invalid email or password");
        }
      } else {
        setFailedAttempts(0);
        setLockoutUntil(null);
        // Hard redirect — sends the fresh session cookie immediately,
        // middleware sees it without waiting for client session sync.
        window.location.href = "/dashboard";
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInstagramSignIn() {
    setIgLoading(true);
    try {
      await signIn("instagram", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Instagram sign-in failed. Please try again.");
      setIgLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#080c0c] text-white selection:bg-[#00e599]/30 font-dm-sans">

      {/* ── Left Panel ─────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 bg-[#080c0c] border-r border-[#1e3030] px-16 py-14">
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 z-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(circle, #1e3030 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Warm glow orb */}
        <div
          className="absolute z-0 pointer-events-none w-[360px] h-[360px] bottom-[-120px] left-[-120px]"
          style={{ background: "radial-gradient(circle at center, rgba(180,80,0,0.45) 0%, transparent 70%)" }}
        />
        {/* Cool teal glow */}
        <div
          className="absolute z-0 pointer-events-none w-[300px] h-[300px] top-[-60px] right-[-60px]"
          style={{ background: "radial-gradient(circle at center, rgba(0,200,140,0.12) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <LinkBhejoLogo />
          <span className="font-syne font-bold text-xl text-white tracking-tight">LinkBhejo</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-8">
          <h2 className="font-syne font-semibold text-3xl text-white leading-snug max-w-[320px]">
            Automate your Instagram DMs and supercharge your sales.
          </h2>

          <ul className="flex flex-col gap-4">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#00e599]" />
                </div>
                <span className="font-dm-sans text-sm text-[#7a9490]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="font-jetbrains-mono text-[11px] text-[#3a5550]">
            Trusted by 10,000+ creators worldwide
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col relative bg-[#0d1111] px-8 py-10 md:px-16 md:py-12 overflow-y-auto">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 w-fit mb-12 text-[#7a9490] hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to website
        </Link>

        {/* Form Container */}
        <div className="w-full max-w-[420px] mx-auto flex flex-col mt-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-syne font-bold text-white mb-2">Sign in to LinkBhejo</h1>
            <p className="text-[#7a9490] text-sm">Welcome back! Please enter your details.</p>
          </div>

          {/* Social Auth — compact icon buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Instagram */}
            <button
              onClick={handleInstagramSignIn}
              type="button"
              disabled={igLoading}
              title="Continue with Instagram"
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#131c1b] border border-[#1e3030] hover:border-[#e1306c]/50 hover:bg-[#1a1014] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {igLoading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Instagram className="w-5 h-5 text-[#e1306c]" />
              }
              {/* Tooltip */}
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0d1111] border border-[#1e3030] px-2 py-1 text-[11px] text-[#7a9490] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                {igLoading ? "Connecting..." : "Continue with Instagram"}
              </span>
            </button>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={googleLoading}
              title="Continue with Google"
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#131c1b] border border-[#1e3030] hover:border-[#4285F4]/50 hover:bg-[#10131c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )
              }
              {/* Tooltip */}
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0d1111] border border-[#1e3030] px-2 py-1 text-[11px] text-[#7a9490] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </button>
          </div>


          {/* Divider */}
          <div className="flex items-center justify-between w-full mb-8">
            <hr className="flex-1 border-t border-[#1e3030]" />
            <span className="px-4 text-[#7a9490] text-xs font-medium uppercase tracking-wider">Or continue with email</span>
            <hr className="flex-1 border-t border-[#1e3030]" />
          </div>

          {/* Inline auth error */}
          {authError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold text-[#8aaeaa] uppercase tracking-wider">
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                className="w-full bg-[#0a1412] border border-[#1e3030] rounded-xl px-4 py-3 text-white placeholder:text-[#3a5550] outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/20 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-[#8aaeaa] uppercase tracking-wider">
                  Password
                </label>
                {/* Forgot password — links back to login with a query hint until the page exists */}
                <Link
                  href="/login?forgot=1"
                  className="text-[#00e599] text-xs hover:text-[#00b87a] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#0a1412] border border-[#1e3030] rounded-xl px-4 py-3 text-white placeholder:text-[#3a5550] outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a9490] hover:text-white transition-colors outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-[#00e599] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : isLocked ? (
                "Locked (Wait 60s)"
              ) : (
                "Sign in securely"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#7a9490]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#00e599] font-medium hover:text-white transition-colors"
            >
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
