"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { ChevronRight, Check, Zap, MessageSquare, Target, BarChart3, Instagram, Twitter, Github, Linkedin, Mail, Workflow, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/ui/aceternity/TextReveal";
import { HoverBorderGradient } from "@/components/ui/aceternity/HoverBorderGradient";
import { InfiniteMovingCards } from "@/components/ui/aceternity/InfiniteMovingCards";
import { BackgroundBeams } from "@/components/ui/aceternity/BackgroundBeams";

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  className,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex flex-col p-8 rounded-2xl border border-[#1e3030] bg-[var(--bg-surface)] transition-all duration-300",
        "hover:border-[var(--accent-primary)]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.08)]",
        className
      )}
    >
      {/* Subtle gradient shimmer on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/0 to-transparent group-hover:from-[var(--accent-primary)]/5 transition-all duration-500 pointer-events-none" />

      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 border", iconBg)}>
        {icon}
      </div>
      <h3 className="font-syne font-semibold text-xl text-white mb-3">{title}</h3>
      <p className="font-dm-sans text-[var(--text-secondary)] text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function HeroChatAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let mounted = true;
    const sequence = async () => {
      while (mounted) {
        setStep(0);
        await new Promise(r => setTimeout(r, 1000));
        if (!mounted) break;
        setStep(1);
        await new Promise(r => setTimeout(r, 1500));
        if (!mounted) break;
        setStep(2);
        await new Promise(r => setTimeout(r, 1200));
        if (!mounted) break;
        setStep(3);
        await new Promise(r => setTimeout(r, 3500));
      }
    };
    sequence();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-full rounded-2xl bg-[#080c0c] border border-[#1e3030] overflow-hidden flex flex-col md:flex-row text-[#e8f0ee] relative items-center justify-center p-4 md:p-8 gap-8 md:gap-12">
      {/* Left side: The Engine / Automation Logic */}
      <div className="flex-1 flex flex-col justify-center relative z-10 w-full max-w-sm hidden md:flex">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,153,0.15)]">
            <Workflow className="w-5 h-5 text-[#00e599]" />
          </div>
          <h3 className="font-syne font-bold text-2xl text-white">Live Automation</h3>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${step >= 1 ? 'bg-[#00e599]/10 border-[#00e599]/40' : 'bg-[#0d1111] border-[#1e3030]'}`}>
            <span className={`font-dm-sans text-sm font-medium ${step >= 1 ? 'text-white' : 'text-[#7a9490]'}`}>1. Keyword Detected: "Price?"</span>
            {step >= 1 && <Check className="w-4 h-4 text-[#00e599]" />}
          </div>
          <div className={`p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${step >= 2 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#0d1111] border-[#1e3030]'}`}>
            <span className={`font-dm-sans text-sm font-medium ${step >= 2 ? 'text-white' : 'text-[#7a9490]'}`}>2. Generating Reply</span>
            {step === 2 && <span className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" /><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '100ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '200ms' }} /></span>}
            {step >= 3 && <Check className="w-4 h-4 text-amber-400" />}
          </div>
          <div className={`p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${step >= 3 ? 'bg-blue-500/10 border-blue-500/40' : 'bg-[#0d1111] border-[#1e3030]'}`}>
            <span className={`font-dm-sans text-sm font-medium ${step >= 3 ? 'text-white' : 'text-[#7a9490]'}`}>3. DM Sent Successfully</span>
            {step >= 3 && <Check className="w-4 h-4 text-blue-400" />}
          </div>
        </div>
      </div>

      {/* Right side: The Phone Mockup */}
      <div className="relative z-10 origin-center scale-[0.80] sm:scale-100 flex-shrink-0">
        <div className="w-[280px] h-[520px] bg-black rounded-[40px] border-[8px] border-[#1e3030] shadow-[0_0_60px_rgba(0,229,153,0.15)] relative overflow-hidden flex flex-col">
          {/* Notch */}
          <div className="w-32 h-6 bg-[#1e3030] rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-20"></div>

          {/* Header */}
          <div className="pt-10 pb-3 px-4 border-b border-[#1e3030] flex items-center gap-3 bg-[#0a0a0a]">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div className="text-[12px] font-syne font-bold text-white leading-tight">LinkBhejo</div>
              <div className="text-[10px] text-gray-500">Instagram</div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 bg-[#050505] overflow-hidden flex flex-col gap-4">
            <div className="text-[10px] text-center text-gray-600 font-jetbrains-mono mt-2 mb-2">Today 9:41 AM</div>

            {/* User message */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : 20, scale: step >= 1 ? 1 : 0.9 }}
              className="self-end bg-[#262626] text-white text-[13px] px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] font-dm-sans"
            >
              Price?
            </motion.div>

            {/* Typing indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step === 2 ? 1 : 0, y: step === 2 ? 0 : 10 }}
              className="self-start bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-tl-sm w-16 flex items-center justify-center gap-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '200ms' }} />
            </motion.div>

            {/* Bot reply */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 20, scale: step >= 3 ? 1 : 0.9 }}
              className="self-start w-[90%]"
            >
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-tl-sm overflow-hidden font-dm-sans">
                <div className="p-3 text-[13px] text-white border-b border-[#2a2a2a]">
                  Hey! 👋 Thanks for asking. Here is the special pricing link with a 20% discount just for our followers:
                </div>
                <div className="p-3 bg-[#111] flex items-center justify-between group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Secure Link</span>
                    <span className="text-[13px] text-[#00e599] font-medium group-hover:underline">linkbhejo.com/offer</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-[#1e3030] bg-[#0a0a0a] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-gray-400 text-lg leading-none">+</span>
            </div>
            <div className="flex-1 h-8 rounded-full border border-[#2a2a2a] bg-[#111] px-3 flex items-center">
              <span className="text-gray-500 text-[12px]">Message...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background atmosphere inside container */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#00e599]/10 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingInterval, setPricingInterval] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 60);
    });
  }, [scrollY]);

  return (
    <div className="theme-luxury min-h-screen relative overflow-x-hidden selection:bg-[var(--accent-primary)]/30 selection:text-white">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BACKGROUND ATMOSPHERE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Blob 1: Top-left, Neon Green */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,229,153,0.12) 0%, transparent 70%)' }} />
        {/* Blob 2: Top-right, Amber warm glow — matches login page left panel */}
        <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,80,0,0.18) 0%, transparent 70%)' }} />
        {/* Blob 3: Bottom-center, Teal */}
        <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,200,140,0.06) 0%, transparent 70%)' }} />

        {/* SVG Noise Texture */}
        <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay">
          <svg width="100%" height="100%">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Dot grid texture — matches login page left panel */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #1e3030 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.4,
            maskImage: "linear-gradient(to bottom, black 30%, transparent 80%)",
          }}
        />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NAVBAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled
          ? "bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-2xl"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="44" height="44" rx="10" stroke="url(#logo-grad)" strokeWidth="2" />
            <path d="M16 14V34H32" stroke="url(#logo-grad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--accent-primary)" />
                <stop offset="1" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-syne font-bold text-xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] tracking-tight">
            LinkBhejo
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10 font-dm-sans text-[14px] ml-8">
          {["Features", "Testimonials", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[var(--text-secondary)] hover:text-white transition-colors relative group font-medium"
            >
              {item}
              <span className="absolute -bottom-1.5 left-0 w-full h-[1px] bg-[var(--text-primary)] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden sm:block font-dm-sans text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="block">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="div"
              className="px-6 py-2.5 font-syne font-medium text-sm bg-[#0a1a14] text-[#00e599] hover:bg-[#0f2a1e] transition-all duration-300 rounded-full"
            >
              Get Started
            </HoverBorderGradient>
          </Link>
        </div>
      </motion.nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center pt-48 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 backdrop-blur-md px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-secondary)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-secondary)]"></span>
          </span>
          <span className="font-jetbrains-mono text-[12px] text-[var(--text-primary)] tracking-wide">
            Now in Beta · Join 10,000+ creators
          </span>
        </motion.div>

        <TextReveal
          text="Automate your Instagram growth."
          gradientWords={["Automate", "Instagram"]}
          className="text-center font-syne text-[clamp(40px,6vw,80px)] max-w-4xl tracking-tight leading-[1.1]"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center font-dm-sans text-[20px] text-[var(--text-secondary)] max-w-2xl font-light"
        >
          Convert comments into customers automatically. Detect intent, reply instantly, and slide into DMs — all while you sleep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-syne font-medium text-[16px] text-[#001a10] bg-[#00e599] flex items-center justify-center gap-2"
            style={{ boxShadow: "var(--glow-violet)" }}
          >
            <Link href="/login" className="flex items-center gap-2">
              Start Free Trial <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.button>

          {/* Social Proof */}
          <div className="flex items-center gap-3">
            {/* Stacked Avatars */}
            <div className="flex -space-x-2.5">
              {[
                "from-pink-400 to-rose-500",
                "from-violet-400 to-purple-500",
                "from-sky-400 to-blue-500",
                "from-amber-400 to-orange-500",
              ].map((grad, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} border-2 border-[#080c0c] flex items-center justify-center text-white text-[11px] font-bold`}
                >
                  {["S", "D", "E", "M"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-[#f0c060] fill-[#f0c060]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-dm-sans text-[12px] text-[var(--text-secondary)]">
                <span className="text-white font-semibold">10,000+</span> creators growing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges Strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          <div className="flex items-center gap-2 text-[#7a9490]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0082fb] to-[#00c6ff] flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5.448-1.5 1-1.5 1 .672 1 1.5zm-8 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5.448-1.5 1-1.5 1 .672 1 1.5zm4 7c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z" /></svg>
            </div>
            <span className="font-dm-sans text-[12px] font-medium">Official Meta Graph API</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-[#1e3030]" />
          <div className="flex items-center gap-2 text-[#7a9490]">
            <div className="w-5 h-5 rounded-full bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#00e599" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <span className="font-dm-sans text-[12px] font-medium">100% TOS Compliant</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-[#1e3030]" />
          <div className="flex items-center gap-2 text-[#7a9490]">
            <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>
            </div>
            <span className="font-dm-sans text-[12px] font-medium">Zero Ban Risk</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-[#1e3030]" />
          <div className="flex items-center gap-2 text-[#7a9490]">
            <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <span className="font-dm-sans text-[12px] font-medium">Setup in 2 Minutes</span>
          </div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 relative w-full max-w-5xl min-h-[550px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-2xl shadow-2xl p-2"
          style={{ transform: "perspective(1200px) rotateX(8deg)" }}
        >
          <div className="absolute -top-6 -left-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl backdrop-blur-md z-20">
            <Zap className="w-5 h-5 text-[var(--accent-gold)]" />
            <span className="font-jetbrains-mono text-sm font-medium">10x Faster Replies</span>
          </div>
          <div className="absolute -bottom-6 -right-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl backdrop-blur-md z-20">
            <Check className="w-5 h-5 text-[var(--accent-secondary)]" />
            <span className="font-jetbrains-mono text-sm font-medium">99.9% Uptime</span>
          </div>

          <HeroChatAnimation />
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LOGO MARQUEE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* <section className="relative z-10 py-20 border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-jetbrains-mono text-sm text-[var(--text-muted)] mb-10 tracking-widest uppercase">
            Trusted by elite teams at
          </p>
          <div className="flex justify-center gap-16 flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all duration-500"> */}
      {/* Fake logos */}
      {/* {["Acme Corp", "GlobalNet", "Nebula", "Vortex", "Polymer"].map((logo) => (
              <span key={logo} className="font-syne font-bold text-3xl md:text-4xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section> */}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DEEP DIVE FEATURES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-32">
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-white mb-6">
            Everything you need. <br /> Nothing you don't.
          </h2>
          <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-[#00e599] to-[#00b87a] rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Box 1: Col-Span 2 - Instant DM */}
          <div className="lg:col-span-2 rounded-3xl bg-[#080c0c] border border-[#1e3030] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00e599]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col md:flex-row h-full">
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-end relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-[#00e599]" />
                </div>
                <h3 className="font-syne font-bold text-2xl text-white mb-3">Instant DM Delivery</h3>
                <p className="font-dm-sans text-[15px] text-[#7a9490] leading-relaxed">The moment someone comments your trigger keyword, we slide into their DMs with your link. Zero delay, maximum conversion.</p>
              </div>
              <div className="p-6 md:p-8 md:w-1/2 relative min-h-[250px] flex items-center justify-center">
                <div className="relative z-10 w-full max-w-[280px] space-y-3">
                  <div className="bg-[#0d1111] border border-[#1e3030] rounded-xl p-3 shadow-xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-[10px] font-bold shrink-0">U</div>
                      <div className="text-[11px] text-[#7a9490]">@user: "Send me the link!"</div>
                    </div>
                  </div>
                  <div className="bg-[#0f2a1e] border border-[#00e599]/30 rounded-xl p-3 shadow-xl transform translate-x-6 rotate-1 group-hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#00e599] flex items-center justify-center text-[#080c0c] text-[10px] font-bold shrink-0">L</div>
                      <div className="text-[11px] text-[#00e599] font-medium">LinkBhejo: "Here is your link! 🚀"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Row-Span 2 - Smart Filters */}
          <div className="lg:row-span-2 rounded-3xl bg-[#080c0c] border border-[#1e3030] overflow-hidden relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex-1 relative p-8 min-h-[300px] flex items-center justify-center overflow-hidden">
              <div className="relative z-10 w-full flex flex-col gap-3">
                {[
                  { user: "@bot99", status: "Blocked", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                  { user: "@real_fan", status: "Verified", color: "text-[#00e599]", bg: "bg-[#00e599]/10", border: "border-[#00e599]/20" },
                  { user: "@troll_acc", status: "Ignored", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                ].map((item, i) => (
                  <div key={i} className={`border rounded-xl p-3 flex justify-between items-center bg-[#0d1111] border-[#1e3030] group-hover:translate-x-2 transition-transform duration-500`} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="text-[11px] text-[#e8f0ee]">{item.user}</div>
                    <div className={`text-[10px] font-syne font-bold px-2 py-1 rounded-md ${item.color} ${item.bg} ${item.border} border`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 md:p-8 pt-0 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-syne font-bold text-2xl text-white mb-3">Smart Filters</h3>
              <p className="font-dm-sans text-[15px] text-[#7a9490] leading-relaxed">Ignore bots, trolls, and duplicates automatically using our AI-powered intent detection engine.</p>
            </div>
          </div>

          {/* Box 3: Col-Span 1 - Deep Analytics */}
          <div className="rounded-3xl bg-[#080c0c] border border-[#1e3030] overflow-hidden relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-t from-[#f0c060]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-48 relative flex items-end justify-center gap-2 px-8 pt-8 overflow-hidden">
              {[40, 65, 45, 80, 55, 95].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-[#f0c060]/80 to-[#f0c060]/20 rounded-t-sm group-hover:from-[#f0c060] transition-colors duration-500" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="p-6 md:p-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#f0c060]/10 border border-[#f0c060]/20 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-[#f0c060]" />
              </div>
              <h3 className="font-syne font-bold text-2xl text-white mb-3">Deep Analytics</h3>
              <p className="font-dm-sans text-[15px] text-[#7a9490] leading-relaxed">Track delivery rates, click-throughs, and revenue attribution directly from your dashboard.</p>
            </div>
          </div>

          {/* Box 4: Col-Span 1 - Official Meta API */}
          <div className="rounded-3xl bg-[#080c0c] border border-[#1e3030] overflow-hidden relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-48 relative flex items-center justify-center overflow-hidden">
              <div className="w-24 h-24 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl border border-white/20">
                  <Instagram className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-syne font-bold text-2xl text-white mb-3">Official Meta API</h3>
              <p className="font-dm-sans text-[15px] text-[#7a9490] leading-relaxed">100% compliant with Instagram Terms of Service. No bans, no sketchy scraping — ever.</p>
            </div>
          </div>

          {/* Box 5: Col-Span 2 - Multi-Step Sequences */}
          <div className="lg:col-span-2 rounded-3xl bg-[#080c0c] border border-[#1e3030] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col md:flex-row h-full">
              <div className="p-6 md:p-8 md:w-1/3 flex flex-col justify-center relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                  <Workflow className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-syne font-bold text-2xl text-white mb-3">Multi-Step Sequences</h3>
                <p className="font-dm-sans text-[15px] text-[#7a9490] leading-relaxed">Build drip campaigns in the DMs. Don't just send one link — build multi-step sequences that nurture leads over days, fully automated.</p>
              </div>
              <div className="p-6 md:p-8 md:w-2/3 relative min-h-[200px] flex items-center justify-center overflow-hidden">
                {/* Fake Horizontal Workflow Mockup */}
                <div className="relative z-10 w-full flex items-center justify-center md:gap-4 gap-2">
                  <div className="bg-[#0d1111] border border-purple-500/40 rounded-xl p-4 shadow-lg text-center z-10 group-hover:-translate-y-2 transition-transform duration-500 w-full max-w-[140px]">
                    <div className="text-[10px] font-syne font-bold text-purple-400 mb-1">Trigger</div>
                    <div className="text-[11px] text-[#e8f0ee] whitespace-nowrap">Comment: "Link"</div>
                  </div>

                  <div className="w-8 md:w-16 h-[2px] bg-[#1e3030] relative shrink-0">
                    <div className="absolute top-0 left-0 h-full w-full bg-purple-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
                  </div>

                  <div className="bg-[#0d1111] border border-[#00e599]/40 rounded-xl p-4 shadow-lg text-center z-10 group-hover:-translate-y-2 transition-transform duration-500 delay-100 w-full max-w-[140px]">
                    <div className="text-[10px] font-syne font-bold text-[#00e599] mb-1">Action 1</div>
                    <div className="text-[11px] text-[#e8f0ee] whitespace-nowrap">Send Link DM</div>
                  </div>

                  <div className="w-8 md:w-16 h-[2px] bg-[#1e3030] relative shrink-0 hidden md:block">
                    <div className="absolute top-0 left-0 h-full w-full bg-purple-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-300" />
                  </div>

                  <div className="bg-[#0d1111] border border-amber-500/40 rounded-xl p-4 shadow-lg text-center z-10 hidden md:block group-hover:-translate-y-2 transition-transform duration-500 delay-200 w-full max-w-[140px]">
                    <div className="text-[10px] font-syne font-bold text-amber-400 mb-1">Wait 24h</div>
                    <div className="text-[11px] text-[#e8f0ee] whitespace-nowrap">Follow-up DM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box 6: Col-Span 1 - Follow-Gated DMs */}
          <div className="rounded-3xl bg-[#080c0c] border border-[#1e3030] overflow-hidden relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-48 relative flex items-center justify-center overflow-hidden">
              <div className="bg-[#0d1111] border border-[#1e3030] rounded-xl p-4 shadow-xl z-10 group-hover:-translate-y-2 transition-transform duration-500 w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#7a9490]">Action required</div>
                    <div className="text-[11px] font-syne font-bold text-white">Follow @brand</div>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[11px] font-bold py-2 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity">
                  Follow to Unlock Link
                </button>
              </div>
            </div>
            <div className="p-6 md:p-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-syne font-bold text-2xl text-white mb-3">Follow-Gated DMs</h3>
              <p className="font-dm-sans text-[15px] text-[#7a9490] leading-relaxed">Require users to follow your account before they receive the DM link. The ultimate growth hack.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATS STRIP
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="stats" className="relative z-10 py-20 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 md:gap-12 text-center">
          <div>
            <div className="font-syne font-extrabold text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-2">
              10M+
            </div>
            <div className="font-dm-sans text-sm text-[var(--text-secondary)] uppercase tracking-widest">DMs Sent</div>
          </div>
          <div>
            <div className="font-syne font-extrabold text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-2">
              99%
            </div>
            <div className="font-dm-sans text-sm text-[var(--text-secondary)] uppercase tracking-widest">Delivery Rate</div>
          </div>
          <div>
            <div className="font-syne font-extrabold text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-2">
              2.4s
            </div>
            <div className="font-dm-sans text-sm text-[var(--text-secondary)] uppercase tracking-widest">Avg Latency</div>
          </div>
          <div>
            <div className="font-syne font-extrabold text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-2">
              10k+
            </div>
            <div className="font-dm-sans text-sm text-[var(--text-secondary)] uppercase tracking-widest">Creators</div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TESTIMONIALS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="testimonials" className="relative z-10 py-32 overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="font-syne font-bold text-4xl text-[var(--text-primary)]">Loved by the best.</h2>
        </div>
        <InfiniteMovingCards
          items={[
            {
              quote: "LinkBhejo completely transformed my launch. We captured 5,000 leads purely through comment automation in 48 hours.",
              name: "Sarah Jenkins",
              title: "Fitness Coach",
            },
            {
              quote: "The interface feels like a luxury product, but the backend is an absolute workhorse. Best tool in my stack.",
              name: "David Chen",
              title: "Agency Owner",
            },
            {
              quote: "I sleep, and LinkBhejo sells. It's literally printing money for my e-commerce brand.",
              name: "Elena Rodriguez",
              title: "E-comm Founder",
            },
            {
              quote: "We switched from ManyChat and never looked back. The UX is unparalleled and it just works.",
              name: "Marcus Thorne",
              title: "CMO, StartupX",
            },
          ]}
          speed="slow"
        />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PRICING
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="pricing" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-[var(--text-primary)] mb-8">Simple, transparent pricing.</h2>
          <div className="flex items-center justify-center gap-4">
            <span className={`font-dm-sans text-sm ${pricingInterval === "monthly" ? "text-white" : "text-[var(--text-muted)]"}`}>Monthly</span>
            <button
              onClick={() => setPricingInterval(pricingInterval === "monthly" ? "annual" : "monthly")}
              className="w-14 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative p-1 transition-colors"
            >
              <motion.div
                layout
                className="w-6 h-6 rounded-full bg-[var(--accent-primary)] shadow-lg"
                animate={{ x: pricingInterval === "annual" ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`font-dm-sans text-sm ${pricingInterval === "annual" ? "text-white" : "text-[var(--text-muted)]"}`}>
              Annual <span className="text-[var(--accent-gold)] text-xs ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-[#1e3030] bg-[#0d1111] p-8 flex flex-col h-full">
            <h3 className="font-syne text-xl text-white mb-1">Free</h3>
            <p className="font-dm-sans text-sm text-[#7a9490] mb-6">For creators just starting out.</p>
            <div className="mb-2">
              <span className="font-syne text-4xl font-bold text-white">$0</span>
            </div>
            <p className="font-jetbrains-mono text-[11px] text-[#3a5550] mb-8">/account /month</p>
            <ul className="space-y-3.5 mb-8 flex-1">
              {[
                "1,000 Auto-DMs / month",
                "1,000 Contacts",
                "1 Instagram Account",
                "Community Support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 font-dm-sans text-sm text-[#7a9490]">
                  <Check className="w-4 h-4 text-[#00b87a] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="w-full py-3 rounded-xl border border-[#1e3030] font-syne text-sm text-white hover:bg-[#131c1b] transition-colors text-center block"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl border border-[#00e599]/40 bg-gradient-to-b from-[#00e599]/10 to-[#0d1111] p-8 flex flex-col relative md:scale-105 shadow-2xl z-10 h-full"
            style={{ boxShadow: "0 0 40px rgba(0,229,153,0.12)" }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00e599] text-[#001a10] font-syne text-[11px] font-bold px-4 py-1 rounded-full tracking-wider uppercase whitespace-nowrap">
              Most Popular
            </div>
            <h3 className="font-syne text-xl text-white mb-1">Pro</h3>
            <p className="font-dm-sans text-sm text-[#7a9490] mb-6">For growing businesses.</p>
            <div className="mb-2">
              <span className="font-syne text-4xl font-bold text-white">
                ${pricingInterval === "monthly" ? "14.90" : "119"}
              </span>
            </div>
            <p className="font-jetbrains-mono text-[11px] text-[#3a5550] mb-8">
              /account /month{pricingInterval === "annual" && <span className="text-[#f0c060] ml-1">(Save 20%)</span>}
            </p>
            <ul className="space-y-3.5 mb-8 flex-1">
              {[
                "Unlimited Auto-DMs",
                "Unlimited Contacts",
                "Unlimited Automations",
                "Priority Support",
                "Custom Branding",
                "Deep Analytics",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 font-dm-sans text-sm text-[#e8f0ee]">
                  <Check className="w-4 h-4 text-[#00e599] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-[#00e599] font-syne font-semibold text-sm text-[#001a10] hover:opacity-90 transition-opacity text-center block"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-[#1e3030] bg-[#0d1111] p-8 flex flex-col h-full">
            <h3 className="font-syne text-xl text-white mb-1">Enterprise</h3>
            <p className="font-dm-sans text-sm text-[#7a9490] mb-6">For high-volume brands & agencies.</p>
            <div className="mb-2">
              <span className="font-syne text-4xl font-bold text-white">Custom</span>
            </div>
            <p className="font-jetbrains-mono text-[11px] text-[#3a5550] mb-8">/account /month</p>
            <ul className="space-y-3.5 mb-8 flex-1">
              {[
                "Unlimited Auto-DMs",
                "Unlimited Accounts",
                "Dedicated Account Rep",
                "24/7 Phone Support",
                "SLA Guarantee",
                "Custom Integrations",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 font-dm-sans text-sm text-[#7a9490]">
                  <Check className="w-4 h-4 text-[#00b87a] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="mailto:aakashsharma.ghd@gmail.com"
              className="w-full py-3 rounded-xl border border-[#1e3030] font-syne text-sm text-white hover:bg-[#131c1b] transition-colors text-center block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA BANNER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 py-32 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden flex flex-col items-center justify-center text-center px-6">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,229,153,0.08) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-jetbrains-mono text-xs text-[var(--accent-primary)] tracking-widest uppercase mb-6">Start for free today</p>
            <h2 className="font-syne font-bold text-4xl md:text-6xl text-white mb-6 leading-tight">
              Ready to scale your DMs?
            </h2>
            <p className="font-dm-sans text-[18px] text-[var(--text-secondary)] mb-12 max-w-xl mx-auto">
              Join thousands of creators automating their Instagram growth. Setup takes less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto text-center px-10 py-4 rounded-xl font-syne font-semibold text-[16px] text-[#001a10] bg-[var(--accent-primary)] hover:opacity-90 transition-opacity inline-block"
                style={{ boxShadow: "0 0 40px rgba(0,229,153,0.3)" }}
              >
                Get Started Free
              </Link>
              <Link
                href="/contact-us"
                className="w-full sm:w-auto text-center px-10 py-4 rounded-xl font-syne font-medium text-[16px] text-white border border-[#1e3030] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors inline-block"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="relative z-10 border-t border-[#1e3030] bg-[#080c0c] pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2 md:pr-8">
            <Link href="/" className="flex items-center gap-2.5 mb-5 hover:opacity-80 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                <rect x="2" y="2" width="44" height="44" rx="10" stroke="#00e599" strokeWidth="2.5" />
                <path d="M16 14V34H32" stroke="#00e599" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-syne font-bold text-lg text-white">LinkBhejo</span>
            </Link>
            <p className="font-dm-sans text-sm text-[#7a9490] mb-6 leading-relaxed">
              The premium Instagram DM automation engine for creators and brands. Set it up once, grow forever.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: "https://twitter.com/AakashSharma07", icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
                // { href: "https://instagram.com/the.sharmaji._", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { href: "https://github.com/aakashsharma7", icon: <Github className="w-4 h-4" />, label: "GitHub" },
                { href: "https://www.linkedin.com/in/aakash-sharma-dev/", icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
              ].map(({ href, icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-[#0d1111] border border-[#1e3030] flex items-center justify-center text-[#7a9490] hover:text-[#00e599] hover:border-[#00664a] transition-all duration-200 hover:scale-110"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          {/* <div>
            <h4 className="font-syne text-[13px] font-semibold text-white mb-5 uppercase tracking-widest">Product</h4>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Changelog", href: "#" },
                { label: "API Docs", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="font-dm-sans text-sm text-[#7a9490] hover:text-[#00e599] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Compare */}
          <div>
            <h4 className="font-syne text-[13px] font-semibold text-white mb-5 uppercase tracking-widest">Compare</h4>
            <ul className="space-y-3">
              {[
                { label: "vs Manychat", href: "#" },
                { label: "vs LinkPlease", href: "#" },
                { label: "vs LinkDM", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="font-dm-sans text-sm text-[#7a9490] hover:text-[#00e599] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-syne text-[13px] font-semibold text-white mb-5 uppercase tracking-widest">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "Pricing", href: "/#pricing" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Contact Us", href: "/contact-us" },
                { label: "Refund Policy", href: "/refund-policy" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="font-dm-sans text-sm text-[#7a9490] hover:text-[#00e599] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[#1e3030] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="font-jetbrains-mono text-[11px] text-[#3a5550]">
              © {new Date().getFullYear()} LinkBhejo
            </p>
            {/* Uptime Status */}
            <a
              href="https://linkbhejo.betteruptime.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00e599]/5 border border-[#00e599]/15 hover:bg-[#00e599]/10 transition-colors group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e599] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e599]" />
              </span>
              <span className="font-jetbrains-mono text-[10px] text-[#00e599] group-hover:text-[#00c97a] transition-colors">
                All systems operational
              </span>
            </a>
          </div>
          <div className="flex items-center gap-4 font-dm-sans text-[12px] text-[#3a5550]">
            <Link href="/privacy-policy" className="hover:text-[#7a9490] transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms-and-conditions" className="hover:text-[#7a9490] transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/contact-us" className="hover:text-[#00e599] transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" /> aakashsharma.ghd@gmail.com
            </Link>
          </div>
        </div>
      </footer>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GHOST WATERMARK
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative z-10 w-full overflow-hidden bg-[#080c0c] flex items-end justify-center" style={{ height: "160px" }}>
        <span
          className="font-syne font-bold select-none pointer-events-none whitespace-nowrap"
          style={{
            fontSize: "clamp(80px, 16vw, 180px)",
            lineHeight: 1,
            background: "linear-gradient(to bottom, rgba(232,240,238,0.18) 0%, rgba(232,240,238,0.06) 60%, transparent 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.03em",
          }}
        >
          LinkBhejo
        </span>
      </div>
    </div >
  );
}
