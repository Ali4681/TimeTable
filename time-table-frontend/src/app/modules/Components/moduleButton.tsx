import React from "react";
import { Book } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ModuleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactElement<{ className?: string }> | React.ReactNode;
  darkMode?: boolean;
  isRTL: boolean;
}

const ModuleButton: React.FC<ModuleButtonProps> = ({
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
  isRTL,
  icon = <Book className="mr-2" />,
  darkMode = false,
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  // Variant styles with dark mode support
  const variantStyles = {
    primary: `
      bg-black text-white hover:bg-gray-800 focus:ring-gray-300
      dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-400
    `,
    secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300
      dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-400
    `,
    outline: `
      border border-black text-black hover:bg-gray-100 focus:ring-gray-200
      dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600
    `,
    ghost: `
      text-gray-800 hover:bg-gray-100 focus:ring-gray-200
      dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  // Icon sizing based on button size
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Safely clone icon with className
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      const iconProps = {
        className: `mr-2 ${iconSize[size]} ${
          (icon.props as { className?: string }).className || ""
        }`,
      };
      return React.cloneElement(icon, iconProps);
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={t("Add New Module")}
      dir={dir}
      className={`
        flex items-center justify-center rounded-md transition-all
        duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
        ${darkMode ? "dark" : ""}
      `}
    >
      {renderIcon()}
      {t("Add New Module")}
    </button>
  );
};

export default ModuleButton;
