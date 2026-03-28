"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface PnLNumberProps {
  value: number;
  className?: string;
}

export function PnLNumber({ value, className }: PnLNumberProps) {
  const isProfit = value >= 0;
  
  // Count-up animation using framer-motion springs
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayValue = useTransform(spring, (latest) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(latest);
    return (latest >= 0 ? "+" : "") + formatted;
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span
      className={cn(
        "font-mono tabular-nums tracking-tighter",
        isProfit ? "text-profit" : "text-loss",
        className
      )}
    >
      <motion.span>{displayValue}</motion.span>
    </motion.span>
  );
}
