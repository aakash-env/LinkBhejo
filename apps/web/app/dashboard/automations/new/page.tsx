"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Video, Radio, Zap, ArrowRight, ArrowLeft,
  Plus, X, Loader2, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { automationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = ["Type", "Keywords", "Message", "Settings"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["COMMENT", "STORY", "LIVE", "DM_REPLY"]),
  postId: z.string().optional(),
  watchAllPosts: z.boolean().default(false),
  dmTemplate: z.string().min(1, "DM message is required"),
  commentReplyEnabled: z.boolean().default(true),
  commentReplyTemplate: z.string().optional(),
  delaySeconds: z.number().min(0).max(60).default(5),
  followGate: z.boolean().default(false),
  aiEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const automationTypes = [
  {
    id: "COMMENT", icon: MessageSquare, label: "Comment Trigger",
    description: "DM users who comment with specific keywords on your posts",
    color: "from-brand-500 to-brand-600",
  },
  {
    id: "STORY", icon: Video, label: "Story Reply",
    description: "Auto-DM anyone who replies to or reacts on your stories",
    color: "from-violet-500 to-violet-600",
  },
  {
    id: "LIVE", icon: Radio, label: "Live Comment",
    description: "Detect keywords during Instagram Live and send instant DMs",
    color: "from-red-500 to-red-600",
  },
  {
    id: "DM_REPLY", icon: Zap, label: "DM Auto-Reply",
    description: "Respond to keywords in incoming direct messages automatically",
    color: "from-amber-500 to-amber-600",
  },
];

export default function NewAutomationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        type: "COMMENT",
        watchAllPosts: true,
        commentReplyEnabled: true,
        delaySeconds: 5,
        followGate: false,
        aiEnabled: false,
      },
    });

  const selectedType = watch("type");

  const createMutation = useMutation({
    mutationFn: (data: any) => automationsApi.create(data),
    onSuccess: () => {
      toast.success("Automation created! 🎉");
      router.push("/dashboard/automations");
    },
    onError: () => toast.error("Failed to create automation"),
  });

  function addKeyword() {
    const kw = kwInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
    }
    setKwInput("");
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function onSubmit(data: FormValues) {
    createMutation.mutate({
      ...data,
      keywords: keywords.map((k) => ({ keyword: k, matchType: "CONTAINS" })),
    });
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">New Automation</h1>
              <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 max-w-2xl mx-auto">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    i < step
                      ? "gradient-bg text-white"
                      : i === step
                      ? "border-2 border-brand-500 text-brand-400"
                      : "border border-border text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-sm", i === step ? "text-white font-medium" : "text-muted-foreground")}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px w-8", i < step ? "bg-brand-500" : "bg-border")} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 0: Type */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Choose trigger type</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      What event should trigger your automated DM?
                    </p>
                  </div>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Automation name
                    </label>
                    <input
                      {...register("name")}
                      placeholder="e.g. Free Guide Giveaway"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {automationTypes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setValue("type", t.id as any)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all duration-200",
                          selectedType === t.id
                            ? "border-brand-500/50 bg-brand-500/10"
                            : "border-border bg-white/3 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3",
                            t.color
                          )}
                        >
                          <t.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-semibold text-white text-sm">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {t.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Keywords */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">Set trigger keywords</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Add keywords that will trigger the DM. Case-insensitive, partial match.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={kwInput}
                      onChange={(e) => setKwInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                      placeholder="Type a keyword and press Enter..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-3 rounded-xl gradient-bg text-white hover:opacity-90 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Keyword tags */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {keywords.map((kw) => (
                      <div
                        key={kw}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg gradient-bg-subtle border border-brand-500/20 text-sm text-brand-300"
                      >
                        {kw}
                        <button
                          type="button"
                          onClick={() => removeKeyword(kw)}
                          className="text-brand-400 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {keywords.length === 0 && (
                      <p className="text-muted-foreground text-sm italic">
                        No keywords yet — add at least one
                      </p>
                    )}
                  </div>

                  <div className="glass-dark rounded-xl p-4 text-sm text-muted-foreground">
                    💡 <strong className="text-white">Pro tip:</strong> Add multiple variants like
                    &quot;link&quot;, &quot;send&quot;, &quot;info&quot; to catch more comments.
                  </div>
                </motion.div>
              )}

              {/* Step 2: Message */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">Write your DM</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      This message will be sent automatically. Use{" "}
                      <code className="text-brand-400">{"{name}"}</code> for their username.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      DM Message
                    </label>
                    <textarea
                      {...register("dmTemplate")}
                      rows={5}
                      placeholder="Hey {name}! 👋 Here's the link you asked for: https://..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none"
                    />
                    {errors.dmTemplate && (
                      <p className="text-red-400 text-xs mt-1">{errors.dmTemplate.message}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 glass rounded-xl">
                    <input
                      type="checkbox"
                      {...register("commentReplyEnabled")}
                      id="commentReply"
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <label htmlFor="commentReply" className="text-sm font-medium text-white cursor-pointer">
                        Also reply to their comment
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Post a public reply like &quot;Check your DMs!&quot; to acknowledge them
                      </p>
                    </div>
                  </div>

                  {watch("commentReplyEnabled") && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Public comment reply
                      </label>
                      <input
                        {...register("commentReplyTemplate")}
                        placeholder="Sent you the link! Check your DMs 📩"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Settings */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">Configure settings</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Fine-tune your automation behavior
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Send delay:{" "}
                      <span className="text-brand-400">{watch("delaySeconds")}s</span>
                    </label>
                    <input
                      type="range"
                      {...register("delaySeconds", { valueAsNumber: true })}
                      min={0}
                      max={60}
                      step={5}
                      className="w-full accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Instant</span>
                      <span>60 seconds</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">Follow gate</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Only send DM to followers; ask others to follow first
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        {...register("followGate")}
                        className="accent-brand-500 w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">AI-powered replies</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Use Claude to generate context-aware DMs (Pro feature)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        {...register("aiEnabled")}
                        className="accent-brand-500 w-4 h-4"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {isLastStep ? (
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all glow-brand-sm disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Automation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="flex items-center gap-2 gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
