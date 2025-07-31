import React from "react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TheoreticalButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  isRTL: boolean;
  darkMode?: boolean;
}

export const TheoreticalButton: React.FC<TheoreticalButtonProps> = ({
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
  icon = <BookOpen className="h-4 w-4" />,
  isRTL,
  darkMode = false,
}) => {
  const { t } = useTranslation();

  // Variant styles with dark mode support
  const variantStyles = {
    primary: `
      bg-black text-white hover:bg-gray-800 focus:ring-gray-300
      dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-400
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300
      dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 dark:focus:ring-gray-400
    `,
    outline: `
      border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-200
      dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-500
    `,
    ghost: `
      text-gray-800 hover:bg-gray-100 focus:ring-gray-200
      dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-500
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: "h-8 px-3 text-sm gap-1.5",
    md: "h-10 px-4 text-base gap-2",
    lg: "h-12 px-6 text-lg gap-3",
  };

  // Icon sizing
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Animation styles
  const animationStyles = `
    transition-all duration-200
    hover:-translate-y-0.5
    active:translate-y-0
  `;

  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center
    rounded-md font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${darkMode ? "dark" : ""}
  `;

  // Clone icon with proper sizing
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {});
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={t("Add Theoretical Module")}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${animationStyles}
        ${className}
        ${isRTL ? "flex-row-reverse" : ""}
      `}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {renderIcon()}
      <span>{t("Add Theoretical Module")}</span>
    </button>
  );
};
