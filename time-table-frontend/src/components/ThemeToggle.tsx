"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

export default function ThemeToggle() {
  const { toggleTheme, isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Motion values (must be declared unconditionally)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const backgroundOpacity = useTransform(mouseX, [0, 100], [0.3, 0.7]);
  const backgroundX = useTransform(mouseX, [0, 100], [-20, 20]);
  const backgroundY = useTransform(mouseY, [0, 100], [-20, 20]);

  // Particle positions (pre-calculated to avoid dynamic hook calls)
  const sunRayPositions = Array.from({ length: 8 }).map((_, i) => ({
    x: Math.cos((i * 45 * Math.PI) / 180) * 12,
    y: Math.sin((i * 45 * Math.PI) / 180) * 12,
  }));

  const starPositions = Array.from({ length: 5 }).map(() => ({
    x: Math.random() * 16 - 8,
    y: Math.random() * 16 - 8,
  }));

  useEffect(() => setMounted(true), []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="invisible"
        aria-hidden="true"
      />
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden transition-all duration-300 ${
        isDarkMode
          ? "bg-slate-900/80 border-slate-700/50 hover:bg-slate-800/90"
          : "bg-white/80 hover:bg-slate-100/90"
      } backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        transform: isPressed ? "scale(0.95)" : "scale(1)",
      }}
    >
      {/* Animated background gradient */}
      <motion.span
        className={`absolute inset-0 rounded-full ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"
            : "bg-gradient-to-br from-slate-100 via-slate-50 to-white"
        }`}
        style={{
          opacity: backgroundOpacity,
          x: backgroundX,
          y: backgroundY,
        }}
      />

      {/* Glow effect */}
      <motion.span
        className={`absolute inset-0 rounded-full ${
          isDarkMode ? "bg-yellow-400/10" : "bg-blue-400/10"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Animated icons with particle effects */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDarkMode ? "dark" : "light"}
          initial={{ y: 20, opacity: 0, rotate: 90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -90 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 20,
            duration: 0.3,
          }}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
          {isDarkMode ? (
            <>
              <Sun size={18} className="text-yellow-400" />
              {/* Sun rays animation - pre-calculated positions */}
              {sunRayPositions.map((pos, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isHovered ? [0, 0.7, 0] : 0,
                    scale: isHovered ? [0, 1.5, 0] : 0,
                    x: pos.x,
                    y: pos.y,
                  }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.6,
                    repeat: isHovered ? Infinity : 0,
                    repeatDelay: 2,
                  }}
                />
              ))}
            </>
          ) : (
            <>
              <Moon size={18} className="text-slate-700" />
              {/* Stars animation - pre-calculated positions */}
              {starPositions.map((pos, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 bg-slate-700 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isHovered ? [0, 0.7, 0] : 0,
                    scale: isHovered ? [0, 1.5, 0] : 0,
                    x: pos.x,
                    y: pos.y,
                  }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.8,
                    repeat: isHovered ? Infinity : 0,
                    repeatDelay: 3,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ripple effect on click */}
      <AnimatePresence>
        {isPressed && (
          <motion.span
            className={`absolute rounded-full ${
              isDarkMode ? "bg-yellow-400/20" : "bg-blue-400/20"
            }`}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
    </Button>
  );
}
