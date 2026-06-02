"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden pointer-events-none w-full h-full",
        className
      )}
    >
      <div className="absolute inset-0 bg-[var(--bg-base)] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      {/* Beam 1 */}
      <motion.div
        initial={{ opacity: 0, rotate: 15 }}
        animate={{ opacity: 0.5, rotate: 15 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 h-[1px] w-[80vw] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--accent-primary) 50%, rgba(255,255,255,0) 100%)",
          boxShadow: "0 0 40px 2px var(--accent-primary)",
        }}
      />
      {/* Beam 2 */}
      <motion.div
        initial={{ opacity: 0, rotate: -25 }}
        animate={{ opacity: 0.3, rotate: -25 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-1/3 left-1/2 h-[1px] w-[60vw] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--accent-secondary) 50%, rgba(255,255,255,0) 100%)",
          boxShadow: "0 0 30px 1px var(--accent-secondary)",
        }}
      />
    </div>
  );
};
