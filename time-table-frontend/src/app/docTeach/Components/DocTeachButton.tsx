"use client";

import React from "react";
import { Plus } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useTranslation } from "react-i18next";

type ButtonVariant = "solid" | "outline" | "ghost" | "gradient";
type ButtonSize = "sm" | "md" | "lg";
type ColorScheme =
  | "purple"
  | "emerald"
  | "rose"
  | "indigo"
  | "custom"
  | "black";

interface DocTeachButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  colorScheme?: ColorScheme;
  customColor?: string;
  children?: React.ReactNode;
}

const colorSchemes = {
  purple: {
    bg: "bg-purple-600",
    hover: "hover:bg-purple-700",
    text: "text-white",
    border: "border-purple-600",
    shadow: "shadow-purple-500/30",
    gradientFrom: "from-purple-500",
    gradientTo: "to-purple-700",
  },
  emerald: {
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-700",
    text: "text-white",
    border: "border-emerald-600",
    shadow: "shadow-emerald-500/30",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-emerald-700",
  },
  rose: {
    bg: "bg-rose-600",
    hover: "hover:bg-rose-700",
    text: "text-white",
    border: "border-rose-600",
    shadow: "shadow-rose-500/30",
    gradientFrom: "from-rose-500",
    gradientTo: "to-rose-700",
  },
  indigo: {
    bg: "bg-indigo-600",
    hover: "hover:bg-indigo-700",
    text: "text-white",
    border: "border-indigo-600",
    shadow: "shadow-indigo-500/30",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-indigo-700",
  },
  black: {
    bg: "bg-black dark:bg-gray-800",
    hover: "hover:bg-gray-800 dark:hover:bg-gray-700",
    text: "text-white",
    border: "border-black dark:border-gray-700",
    shadow: "shadow-black/30 dark:shadow-gray-700/30",
    gradientFrom: "from-black dark:from-gray-800",
    gradientTo: "to-gray-800 dark:to-gray-700",
  },
} as const;

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

const DocTeachButton: React.FC<DocTeachButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  icon,
  variant = "solid",
  size = "md",
  fullWidth = false,
  colorScheme = "black",
  customColor = "#6d28d9",
  children,
}) => {
  const { t, i18n } = useTranslation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isRTL = i18n.dir() === "rtl";

  const handleMouseMove = ({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const getColorStyles = () => {
    if (colorScheme === "custom") {
      return {
        bg: `bg-[${customColor}] dark:bg-[${shadeColor(customColor, -20)}]`,
        hover: `hover:bg-[${shadeColor(
          customColor,
          -20
        )}] dark:hover:bg-[${shadeColor(customColor, -40)}]`,
        text: "text-white",
        border: `border-[${customColor}] dark:border-[${shadeColor(
          customColor,
          -20
        )}]`,
        shadow: `shadow-[${customColor}]/30 dark:shadow-[${shadeColor(
          customColor,
          -20
        )}]/30`,
        gradientFrom: `from-[${customColor}] dark:from-[${shadeColor(
          customColor,
          -20
        )}]`,
        gradientTo: `to-[${shadeColor(customColor, -20)}] dark:to-[${shadeColor(
          customColor,
          -40
        )}]`,
      };
    }
    return colorSchemes[colorScheme];
  };

  const colors = getColorStyles();

  const shadeColor = (color: string, percent: number): string => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const adjusted = (value: number) =>
      Math.min(255, Math.max(0, value + (value * percent) / 100));

    return `#${[adjusted(r), adjusted(g), adjusted(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const baseClasses = [
    "group relative inline-flex items-center justify-center gap-2",
    "rounded-lg font-medium transition-all duration-300 ease-out",
    fullWidth ? "w-full" : "w-auto",
    disabled || isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "dark:focus-visible:ring-offset-gray-900",
    sizeStyles[size],
    isRTL ? "flex-row-reverse" : "",
  ].join(" ");

  const variantClasses = {
    solid: `${colors.bg} ${colors.hover} ${colors.text} shadow-md hover:shadow-lg ${colors.shadow}`,
    outline: `bg-transparent border ${colors.border} ${colors.text} hover:bg-opacity-10 hover:bg-current dark:hover:bg-opacity-10 dark:hover:bg-current`,
    ghost: `bg-transparent ${colors.text} hover:bg-opacity-10 hover:bg-current dark:hover:bg-opacity-10 dark:hover:bg-current`,
    gradient: "text-white",
  }[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses}`}
      dir={i18n.dir()} // Add direction based on language
    >
      {variant === "gradient" && (
        <>
          <motion.div
            className="absolute inset-0 rounded-lg opacity-100 bg-gradient-to-br group-hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(to bottom right, ${colors.gradientFrom}, ${colors.gradientTo})`,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.2), transparent 80%)`,
            }}
          />
        </>
      )}

      {isLoading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
        </motion.span>
      )}

      <motion.span
        animate={{
          opacity: isLoading ? 0 : 1,
          y: isLoading ? 2 : 0,
        }}
        className={`relative z-10 flex items-center gap-2 ${
          variant === "gradient" ? "text-white" : colors.text
        } ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {icon || (
          <Plus
            size={iconSizes[size]}
            className="transition-transform duration-300 group-hover:rotate-90"
          />
        )}
        <span>{children || t("Add New Teacher")}</span>
      </motion.span>

      {!isLoading && (
        <span className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.span
            className="absolute bg-white/30 rounded-full origin-center"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{
              scale: 10,
              opacity: [0.3, 0],
            }}
            transition={{ duration: 0.6 }}
          />
        </span>
      )}

      {(variant === "solid" || variant === "gradient") && (
        <motion.span
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.4), transparent 80%)`,
          }}
        />
      )}
    </motion.button>
  );
};

export default DocTeachButton;
