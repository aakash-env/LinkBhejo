"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, Loader2, Zap, Shield, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

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

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupForm) {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      let json: any = {};
      try { json = await res.json(); } catch { /* non-JSON body */ }

      if (!res.ok) {
        const msg = json.error ?? `Registration failed (${res.status})`;
        setServerError(msg);
        toast.error(msg);
        return;
      }

      // Auto sign-in after registration
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to LinkBhejo! 🎉");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err?.message?.includes("fetch")
        ? "Cannot reach the server. Make sure the API is running."
        : (err?.message ?? "Something went wrong. Please try again.");
      console.error("[Signup] Error:", err);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
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
          <span className="font-syne font-bold text-xl bg-clip-text text-transparent bg-gradient-to-br from-[#00e599] to-[#00b87a]">
            LinkBhejo
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <p className="font-jetbrains-mono text-xs text-[#00e599] tracking-widest uppercase mb-4">
            Join 10,000+ creators
          </p>
          <h2 className="font-syne font-bold text-4xl text-white leading-tight mb-6">
            Start automating<br />your growth today.
          </h2>
          <div className="space-y-4">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#00e599]" />
                </div>
                <span className="font-dm-sans text-sm text-[#b0c8c4]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 p-5 rounded-2xl border border-[#1e3030] bg-[#0d1111]/80 backdrop-blur-sm">
          <p className="font-dm-sans text-sm text-[#b0c8c4] leading-relaxed mb-3">
            "Setup took 2 minutes. Within 24 hours I had 300 new leads from a single Reel. This thing is magic."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-[11px] font-bold">S</div>
            <div>
              <p className="font-syne text-xs font-semibold text-white">Sarah Jenkins</p>
              <p className="text-[10px] text-[#7a9490]">Fitness Coach · 280K followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────── */}
      <div className="flex flex-col w-full lg:w-1/2 min-h-screen px-6 sm:px-12 lg:px-16 py-10 overflow-y-auto">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#7a9490] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <LinkBhejoLogo />
            <span className="font-syne font-bold text-xl bg-clip-text text-transparent bg-gradient-to-br from-[#00e599] to-[#00b87a]">
              LinkBhejo
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-syne font-bold text-3xl text-white mb-2">Create your account</h1>
            <p className="font-dm-sans text-sm text-[#7a9490]">Free forever. No credit card required.</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-semibold text-[#8aaeaa] uppercase tracking-wider">
                Full name
              </label>
              <input
                {...register("name")}
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Aakash Sharma"
                className="w-full bg-[#0a1412] border border-[#1e3030] rounded-xl px-4 py-3 text-white placeholder:text-[#3a5550] outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/20 transition-all"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
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
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold text-[#8aaeaa] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#8aaeaa] uppercase tracking-wider">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="w-full bg-[#0a1412] border border-[#1e3030] rounded-xl px-4 py-3 text-white placeholder:text-[#3a5550] outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a9490] hover:text-white transition-colors outline-none"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 mt-2 py-3 rounded-xl bg-[#00e599] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create free account"
              )}
            </button>

            <p className="text-center text-[11px] text-[#3a5550] leading-relaxed">
              By signing up you agree to our{" "}
              <Link href="/terms-and-conditions" className="text-[#7a9490] hover:text-white transition-colors">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy-policy" className="text-[#7a9490] hover:text-white transition-colors">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-8 text-center text-sm text-[#7a9490]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00e599] font-medium hover:text-white transition-colors">
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
