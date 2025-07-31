"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PracticalButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const PracticalButton: React.FC<PracticalButtonProps> = ({
  onClick,
  disabled = false,
  className = "",
  loading = false,
  variant = "primary",
  size = "md",
  icon = <PlusCircle className="mr-2" />,
}) => {
  const { t } = useTranslation();
  const dir = document.documentElement.getAttribute("dir") || "ltr";

  // Updated theme-aware styles with black/dark-gray scheme
  const variantStyles = {
    primary: `
      bg-black text-white hover:bg-gray-800 
      dark:bg-gray-700 dark:hover:bg-gray-600 
      focus:ring-gray-300 dark:focus:ring-gray-500
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300 
      dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500
      focus:ring-gray-200 dark:focus:ring-gray-400
    `,
    outline: `
      border border-gray-800 text-gray-800 hover:bg-gray-100 
      dark:border-gray-500 dark:text-white dark:hover:bg-gray-700
      focus:ring-gray-100 dark:focus:ring-gray-400
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-5 py-2.5 text-lg gap-3",
  };

  // Animation styles
  const animationStyles = `
    transition-all duration-200
    hover:-translate-y-0.5
    active:translate-y-0
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={t("Add New Practical")}
      dir={dir}
      className={`
        flex items-center justify-center 
        rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${animationStyles}
        ${loading ? "cursor-wait" : ""}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{t("Processing...")}</span>
        </div>
      ) : (
        <>
          {icon}
          <span>{t("Add New Practical")}</span>
        </>
      )}
    </button>
  );
};

export default PracticalButton;
