"use client";

import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import React from "react";

interface StudentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactElement;
  children?: React.ReactNode;
  darkMode?: boolean;
}

const StudentButton: React.FC<StudentButtonProps> = ({
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
  icon = <PlusCircle className="h-4 w-4" />,
  children,
  darkMode = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

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
      border border-gray-800 text-gray-800 hover:bg-gray-100 focus:ring-gray-200
      dark:border-gray-500 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-400
    `,
    ghost: `
      text-gray-800 hover:bg-gray-100 focus:ring-gray-200
      dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-400
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-5 py-2.5 text-lg gap-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Type-safe icon rendering
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      const iconClassName = [
        iconSizes[size],
        isRTL ? "ml-2" : "mr-2",
        (icon.props as { className?: string })?.className || "",
      ]
        .join(" ")
        .trim();

      return React.cloneElement(icon, {});
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
        ${darkMode ? "dark" : ""}
      `}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {renderIcon()}
      {children || t("addNewStudent")}
    </button>
  );
};

export default StudentButton;
