"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ResetPasswordComponent } from "./OTPverification";
import {
  Phone,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ForgotPasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>({
    text: "",
    isError: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [storedOtp, setStoredOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "password">("phone");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const API_URL = "http://localhost:8000";

  useEffect(() => {
    const storedOtpData = localStorage.getItem("otpData");
    if (storedOtpData) {
      const { otp: savedOtp, expiresAt } = JSON.parse(storedOtpData);
      if (new Date().getTime() < expiresAt) {
        setStoredOtp(savedOtp);
      } else {
        localStorage.removeItem("otpData");
      }
    }
  }, []);

  const resetAllStates = () => {
    setPhoneNumber("");
    setMessage({ text: "", isError: false });
    setIsLoading(false);
    setShowResetPassword(false);
    setIsValidPhone(false);
    setOtp(["", "", "", ""]);
    setOtpError("");
    setOtpVerified(false);
    setStoredOtp("");
    setStep("phone");
    localStorage.removeItem("otpData");
  };

  const handleClose = () => {
    resetAllStates();
    onClose();
  };

  const handlePasswordResetSuccess = () => {
    resetAllStates();
    onClose();
  };

  const handleBackToPhoneInput = () => {
    setStep("phone");
    setShowResetPassword(false);
    setOtp(["", "", "", ""]);
    setOtpError("");
    setOtpVerified(false);
    setMessage({ text: "", isError: false });
  };

  const formatPhoneNumber = (input: string): string => {
    let cleaned = input.replace(/\D/g, "");

    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return `+963${cleaned.substring(1)}`;
    }

    if (cleaned.startsWith("963") && cleaned.length >= 10) {
      return `+${cleaned}`;
    }

    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    return cleaned ? `+${cleaned}` : cleaned;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setPhoneNumber(formatted);
    setIsValidPhone(/^\+963\d{9}$/.test(formatted));

    if (message.text) {
      setMessage({ text: "", isError: false });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input if a digit was entered
      if (value && index < 3) {
        otpInputRefs.current[index + 1]?.focus();
      }

      // Move focus to previous input if backspace was pressed and current input is empty
      if (!value && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }

      if (otpError) setOtpError("");
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    const otpArray = pasteData.split("").slice(0, 4);

    if (otpArray.length === 4) {
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      otpInputRefs.current[3]?.focus();
    }
  };

  const validateOtp = () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      setOtpError(t("errors.otp_invalid_length"));
      return false;
    }

    if (otpString !== storedOtp) {
      setOtpError(t("errors.otp_mismatch"));
      return false;
    }

    return true;
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateOtp()) {
      setOtpVerified(true);
      setOtpError("");
      setStep("password");
      setShowResetPassword(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone) {
      setMessage({
        text: t("errors.phone_invalid"),
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const response = await fetch(`${API_URL}/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setMessage({
            text: t("errors.token_expired"),
            isError: true,
          });
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 3000);
          return;
        }
        throw new Error(data.message || t("forgot_password_error"));
      }

      const expiresAt = new Date().getTime() + 5 * 60 * 1000;

      localStorage.setItem(
        "otpData",
        JSON.stringify({
          otp: data.otp,
          expiresAt,
          phoneNumber,
        })
      );

      setStoredOtp(data.otp);
      setMessage({
        text: data.message || t("forgot_password_success"),
        isError: false,
      });
      setStep("otp");
      // Focus first OTP input when moving to OTP step
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      setMessage({
        text: error.message || t("network_error"),
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const maskedPhone = phoneNumber.replace(
    /(\+963)(\d{3})(\d{3})(\d{3})/,
    "$1$2***$4"
  );

  const StepIndicator = () => (
    <div className={`flex items-center justify-center mb-8`}>
      <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              step === "phone"
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                : step === "otp" || step === "password"
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 text-gray-400"
            }`}
          >
            {step === "otp" || step === "password" ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Phone className="w-6 h-6" />
            )}
          </div>
          <span
            className={`text-xs mt-2 font-medium ${
              step === "phone" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {t("phone_number")}
          </span>
        </div>

        {/* Connector */}
        <div
          className={`h-px bg-gray-300 transition-all duration-300 mx-4 ${
            step === "otp" || step === "password" ? "bg-green-500" : ""
          }`}
          style={{ width: "60px" }}
        />

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              step === "otp"
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                : step === "password"
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 text-gray-400"
            }`}
          >
            {step === "password" ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>
          <span
            className={`text-xs mt-2 font-medium ${
              step === "otp" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {t("verify_otp")}
          </span>
        </div>

        {/* Connector */}
        <div
          className={`h-px bg-gray-300 transition-all duration-300 mx-4 ${
            step === "password" ? "bg-green-500" : ""
          }`}
          style={{ width: "60px" }}
        />

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              step === "password"
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "border-gray-300 text-gray-400"
            }`}
          >
            <Shield className="w-6 h-6" />
          </div>
          <span
            className={`text-xs mt-2 font-medium ${
              step === "password" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {t("reset_password")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div dir={dir} className={isRTL ? "font-arabic" : "font-sans"}>
      <style jsx>{`
        /* Modern Glass Morphism Close Button */
        .modern-close-btn {
          position: absolute;
          top: 1rem;
          ${isRTL ? "left: 1rem;" : "right: 1rem;"}
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .modern-close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .modern-close-btn:active {
          transform: scale(0.95);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .modern-close-icon {
          width: 24px;
          height: 24px;
          color: rgba(0, 0, 0, 0.7);
          transition: all 0.3s ease;
        }

        .modern-close-btn:hover .modern-close-icon {
          color: rgba(0, 0, 0, 0.9);
          transform: rotate(90deg);
        }

        /* Dark mode styles */
        .dark .modern-close-btn {
          background: rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .dark .modern-close-btn:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .dark .modern-close-icon {
          color: rgba(255, 255, 255, 0.8);
        }

        .dark .modern-close-btn:hover .modern-close-icon {
          color: rgba(255, 255, 255, 1);
        }

        /* Alternative: Floating Action Button Style */
        .fab-close-btn {
          position: absolute;
          top: -12px;
          ${isRTL ? "left: -12px;" : "right: -12px;"}
          width: 56px;
          height: 56px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          border: 3px solid white;
        }

        .fab-close-btn:hover {
          transform: scale(1.1) rotate(180deg);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
        }

        .fab-close-btn:active {
          transform: scale(0.9) rotate(180deg);
        }

        .fab-close-icon {
          width: 24px;
          height: 24px;
          color: white;
          transition: all 0.3s ease;
        }

        /* Alternative: Minimalist Square with Border */
        .minimal-close-btn {
          position: absolute;
          top: 1.5rem;
          ${isRTL ? "left: 1.5rem;" : "right: 1.5rem;"}
          width: 40px;
          height: 40px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 20;
        }

        .minimal-close-btn:hover {
          border-color: #ef4444;
          background: #fef2f2;
          transform: scale(1.05);
        }

        .minimal-close-btn:active {
          transform: scale(0.95);
        }

        .minimal-close-icon {
          width: 20px;
          height: 20px;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .minimal-close-btn:hover .minimal-close-icon {
          color: #ef4444;
        }

        .dark .minimal-close-btn {
          background: #374151;
          border-color: #4b5563;
        }

        .dark .minimal-close-btn:hover {
          background: #7f1d1d;
          border-color: #ef4444;
        }

        .dark .minimal-close-icon {
          color: #9ca3af;
        }

        .dark .minimal-close-btn:hover .minimal-close-icon {
          color: #ef4444;
        }

        /* Alternative: Neon Glow Style */
        .neon-close-btn {
          position: absolute;
          top: 1rem;
          ${isRTL ? "left: 1rem;" : "right: 1rem;"}
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 20;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .neon-close-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
          border-color: rgba(59, 130, 246, 0.6);
          transform: scale(1.1);
        }

        .neon-close-btn:active {
          transform: scale(0.95);
        }

        .neon-close-icon {
          width: 22px;
          height: 22px;
          color: rgba(59, 130, 246, 0.9);
          transition: all 0.3s ease;
        }

        .neon-close-btn:hover .neon-close-icon {
          color: rgba(59, 130, 246, 1);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }

        /* OTP Input Boxes */
        .otp-input-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 20px 0;
        }

        .otp-input {
          width: 60px;
          height: 60px;
          text-align: center;
          font-size: 24px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .otp-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }

        .dark .otp-input {
          background-color: #1e293b;
          border-color: #334155;
          color: white;
        }

        .dark .otp-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
        }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {/* Modal Container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-lg relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20" />

          {/* Modern Glass Morphism Close Button */}
          <button
            onClick={handleClose}
            className="modern-close-btn"
            type="button"
            aria-label={t("close")}
          >
            <X className="modern-close-icon" />
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t("forgot_password")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {step === "phone" &&
                  t("Enter your phone number to reset your password")}
                {step === "otp" &&
                  t("Enter the verification code sent to your phone")}
                {step === "password" && t("Create your new password")}
              </p>
            </div>

            <StepIndicator />

            {/* Phone Number Step */}
            {step === "phone" && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-inner">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("phone_number")}
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 ${
                          isRTL ? "right-4" : "left-4"
                        } flex items-center pointer-events-none`}
                      >
                        <Phone
                          className={`h-5 w-5 transition-colors ${
                            isValidPhone ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        className={`block w-full ${
                          isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                        } py-4 border-2 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                          message.isError
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                            : isValidPhone
                            ? "border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/20"
                            : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        }`}
                        placeholder={
                          isRTL ? "مثال: 0912345678" : "e.g. 0912345678"
                        }
                        required
                        dir="ltr"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                      {isValidPhone && (
                        <div
                          className={`absolute inset-y-0 ${
                            isRTL ? "left-4" : "right-4"
                          } flex items-center`}
                        >
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center ${
                        isRTL ? "text-right justify-end" : "text-left"
                      }`}
                    >
                      <AlertCircle
                        className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`}
                      />
                      {t("phone_format_hint")}
                    </p>
                  </div>

                  {message.text && (
                    <div
                      className={`p-4 rounded-xl border ${
                        message.isError
                          ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                          : "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                      }`}
                    >
                      <div
                        className={`flex items-center ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        {message.isError ? (
                          <AlertCircle
                            className={`w-4 h-4 ${
                              isRTL ? "ml-2" : "mr-2"
                            } flex-shrink-0`}
                          />
                        ) : (
                          <CheckCircle
                            className={`w-4 h-4 ${
                              isRTL ? "ml-2" : "mr-2"
                            } flex-shrink-0`}
                          />
                        )}
                        <span className="text-sm font-medium">
                          {message.text}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex ${
                      isRTL ? "flex-row-reverse" : ""
                    } gap-3 pt-4`}
                  >
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-300 dark:border-gray-600"
                      disabled={isLoading}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !isValidPhone}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" />
                          <span className={isRTL ? "mr-2" : "ml-2"}>
                            {t("sending")}
                          </span>
                        </>
                      ) : (
                        <>
                          {t("send_otp")}
                          {isRTL ? (
                            <ArrowLeft className="w-4 h-4 mr-2" />
                          ) : (
                            <ArrowRight className="w-4 h-4 ml-2" />
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* OTP Verification Step */}
            {step === "otp" && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-850 rounded-2xl p-6 border border-blue-200 dark:border-gray-700 shadow-inner">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {t("otp_sent_to")}{" "}
                    <span
                      className="font-semibold text-blue-600 dark:text-blue-400"
                      dir="ltr"
                      style={{ unicodeBidi: "bidi-override" }}
                    >
                      {maskedPhone}
                    </span>{" "}
                    {t("on_telegram")}.
                    <br />
                    {t("go_to_telegram_open_bot")}{" "}
                    <a
                      href="tg://resolve?domain=time_table_system_bot"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      onClick={(e) => {
                        if (!navigator.userAgent.includes("Telegram")) {
                          window.open(
                            "https://t.me/time_table_system_bot",
                            "_blank"
                          );
                          e.preventDefault();
                        }
                        navigator.clipboard
                          .writeText("@time_table_system_bot")
                          .then(() => toast.success(t("bot_name_copied")));
                      }}
                    >
                      @time_table_system_bot
                    </a>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label
                      className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center`}
                    >
                      {t("enter_otp")}
                    </label>
                    <div className="otp-input-container">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onPaste={handleOtpPaste}
                          maxLength={1}
                          className="otp-input"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div
                          className={`flex items-center ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <AlertCircle
                            className={`w-4 h-4 text-red-500 ${
                              isRTL ? "ml-2" : "mr-2"
                            }`}
                          />
                          <span className="text-red-700 text-sm font-medium">
                            {otpError}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex ${
                      isRTL ? "flex-row-reverse" : ""
                    } gap-3 pt-4`}
                  >
                    <button
                      type="button"
                      onClick={handleBackToPhoneInput}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                    >
                      {isRTL ? (
                        <>
                          <ArrowRight className="w-4 h-4 ml-2" />
                          {t("back")}
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {t("back")}
                        </>
                      )}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                      disabled={otp.join("").length !== 4}
                    >
                      {t("verify_otp")}
                      {isRTL ? (
                        <ArrowLeft className="w-4 h-4 ml-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 ml-2" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Reset Step */}
            {step === "password" && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-850 rounded-2xl p-6 border border-green-200 dark:border-gray-700 shadow-inner">
                <ResetPasswordComponent
                  phoneNumber={phoneNumber}
                  onClose={handleClose}
                  onSuccess={handlePasswordResetSuccess}
                  isRTL={isRTL}
                  dir={dir}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
