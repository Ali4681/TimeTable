"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Phone, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/Auth/hooks/useAuth";

// ResetPassword Component integrated into the same modal
export function ResetPasswordComponent({
  phoneNumber,
  onClose,
  onSuccess,
  isRTL,
  dir,
}: {
  phoneNumber: string;
  onClose: () => void;
  onSuccess?: () => void;
  isRTL: boolean;
  dir: string;
}) {
  const { t } = useTranslation("common");
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>({
    text: "",
    isError: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8)
      return t(
        "errors.password_length",
        "Password must be at least 8 characters"
      );
    if (!/[A-Z]/.test(password))
      return t(
        "errors.password_uppercase",
        "Password must contain at least one uppercase letter"
      );
    if (!/[a-z]/.test(password))
      return t(
        "errors.password_lowercase",
        "Password must contain at least one lowercase letter"
      );
    if (!/[0-9]/.test(password))
      return t(
        "errors.password_number",
        "Password must contain at least one number"
      );
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return setMessage({
        text: t("errors.password_mismatch", "Passwords do not match"),
        isError: true,
      });
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return setMessage({ text: passwordError, isError: true });
    }

    setIsLoading(true);
    setMessage({ text: "", isError: false });

    try {
      // This now expects just the message string
      await resetPassword({
        phoneNumber,
        newPassword,
      });

      // Success case
      setMessage({
        text: t("password_reset_success", "Password reset successfully"),
        isError: false,
      });

      localStorage.removeItem("otpData");

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (error: any) {
      setMessage({
        text: error?.message || t("network_error", "Network error occurred"),
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t("reset_password_title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("create_new_password_instruction")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {["newPassword", "confirmPassword"].map((field) => (
          <div key={field}>
            <label
              className={`block text-sm font-medium mb-1 ${
                isRTL ? "text-right" : "text-left"
              } text-gray-700 dark:text-gray-300`}
            >
              {t(field === "newPassword" ? "new_password" : "confirm_password")}
            </label>
            <div className="relative">
              <input
                type={
                  field === "newPassword"
                    ? showPassword
                      ? "text"
                      : "password"
                    : showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={field === "newPassword" ? newPassword : confirmPassword}
                onChange={(e) => {
                  field === "newPassword"
                    ? setNewPassword(e.target.value)
                    : setConfirmPassword(e.target.value);
                  message.isError && setMessage({ text: "", isError: false });
                }}
                className={`block w-full pl-3 pr-10 py-2 border ${
                  field === "newPassword"
                    ? message.isError && message.text.includes("password")
                      ? "border-red-500"
                      : newPassword && !validatePassword(newPassword)
                      ? "border-green-500"
                      : "border-gray-300"
                    : confirmPassword && newPassword !== confirmPassword
                    ? "border-red-500"
                    : confirmPassword && newPassword === confirmPassword
                    ? "border-green-500"
                    : "border-gray-300"
                } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm`}
                style={{ textAlign: "left", direction: "ltr" }}
                placeholder={t(
                  field === "newPassword"
                    ? "enter_new_password"
                    : "confirm_new_password"
                )}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() =>
                  field === "newPassword"
                    ? setShowPassword(!showPassword)
                    : setShowConfirmPassword(!showConfirmPassword)
                }
                className={`absolute inset-y-0 right-0 pr-2 flex items-center`}
              >
                {field === "newPassword" ? (
                  showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )
                ) : showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Compact password requirements */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-xs">
          <div className="grid grid-cols-2 gap-1">
            {[
              {
                cond: newPassword.length >= 8,
                text: "8+ chars",
              },
              {
                cond: /[A-Z]/.test(newPassword),
                text: "Uppercase",
              },
              {
                cond: /[a-z]/.test(newPassword),
                text: "Lowercase",
              },
              {
                cond: /[0-9]/.test(newPassword),
                text: "Number",
              },
            ].map((req, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    req.cond ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span
                  className={
                    req.cond
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500"
                  }
                >
                  {req.text}
                </span>
              </div>
            ))}
          </div>
          {confirmPassword && (
            <div
              className={`flex items-center gap-1 mt-1 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  newPassword === confirmPassword && confirmPassword
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span
                className={
                  newPassword === confirmPassword && confirmPassword
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500"
                }
              >
                Passwords match
              </span>
            </div>
          )}
        </div>

        {message.text && (
          <div
            className={`p-2 rounded-lg flex items-center text-sm ${
              isRTL ? "flex-row-reverse" : ""
            } ${
              message.isError
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
            }`}
          >
            {message.isError ? (
              <svg
                className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"} flex-shrink-0`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"} flex-shrink-0`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="truncate">{message.text}</span>
          </div>
        )}

        <div
          className={`flex ${
            isRTL ? "justify-start" : "justify-end"
          } gap-2 pt-1`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            disabled={isLoading}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={
              isLoading ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !!validatePassword(newPassword)
            }
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className={`animate-spin ${
                    isRTL ? "-mr-1 ml-1" : "-ml-1 mr-1"
                  } h-3 w-3`}
                  xmlns="http://www.w3.org/2000/svg"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("resetting")}
              </span>
            ) : (
              t("reset_password")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
