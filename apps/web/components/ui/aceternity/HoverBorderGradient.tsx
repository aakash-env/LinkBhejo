"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, var(--accent-secondary) 0%, rgba(255, 255, 255, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, var(--accent-secondary) 0%, rgba(255, 255, 255, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, var(--accent-secondary) 0%, rgba(255, 255, 255, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.19% at 100% 50%, var(--accent-secondary) 0%, rgba(255, 255, 255, 0) 100%)",
  };

  const highlight = "radial-gradient(75% 181.159% at 50% 50%, var(--accent-primary) 0%, rgba(255, 255, 255, 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-fit w-fit items-center justify-center overflow-visible rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/20 transition-transform duration-500 hover:-translate-y-1 hover:border-[var(--border-glow)]",
        containerClassName
      )}
      {...props}
    >
      <div className={cn("relative z-10 w-full rounded-[inherit] bg-[var(--bg-surface)] backdrop-blur-md", className)}>
        {children}
      </div>
      <motion.div
        className={cn(
          "absolute inset-0 z-0 h-full w-full rounded-[inherit] opacity-0 transition-opacity duration-500",
          hovered ? "opacity-100" : ""
        )}
        style={{
          boxShadow: "var(--glow-violet)",
        }}
      />
      <motion.div
        className="absolute inset-0 z-[-1] rounded-[inherit] opacity-10"
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
    </Tag>
  );
}
