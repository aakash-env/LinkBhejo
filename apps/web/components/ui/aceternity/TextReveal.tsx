"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextReveal = ({
  text,
  gradientWords = [],
  className,
}: {
  text: string;
  gradientWords?: string[];
  className?: string;
}) => {
  const words = text.split(" ");
  return (
    <div className={cn("flex flex-wrap justify-center font-bold leading-tight", className)}>
      {words.map((word, idx) => {
        const isGradient = gradientWords.some((gw) => word.toLowerCase().includes(gw.toLowerCase()));
        return (
          <motion.span
            key={`${word}-${idx}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: idx * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "mr-3 md:mr-4 inline-block",
              isGradient ? "bg-clip-text text-transparent bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))]" : "text-white"
            )}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};
