"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/nav";

export default function SignUpPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { signUp, loading, error: authError } = useAuth();

  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidPhone, setIsValidPhone] = useState(false);

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
    setFormData((prev) => ({ ...prev, phoneNumber: formatted }));
    setIsValidPhone(/^\+963\d{9}$/.test(formatted));

    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t("errors.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("errors.email_invalid");
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("errors.fullname_required");
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = t("errors.fullname_length");
    }

    if (!formData.password) {
      newErrors.password = t("errors.password_required");
    } else if (formData.password.length < 8) {
      newErrors.password = t("errors.password_length");
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t("errors.password_uppercase");
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = t("errors.password_lowercase");
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = t("errors.password_number");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.password_mismatch");
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t("errors.phone_required");
    } else if (!/^\+963\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t("errors.phone_invalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      await signUp({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
      });
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div dir={dir} className={isRTL ? "font-arabic" : "font-sans"}>
      <Navbar />
      <div className="min-h-screen transition-colors mt-14 duration-300 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg ${
                  isRTL ? "ml-2" : "mr-2"
                }`}
              >
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t("create_account")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("get_started")}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm"
            >
              <div className="space-y-6">
                {authError && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {authError}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
                    {t("email_address")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder={t("enter_email")}
                      autoComplete="email"
                      dir="ltr"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm text-left">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Full Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
                    {t("full_name")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder={t("enter_full_name")}
                      dir="ltr"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm text-left">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
                    {t("phone_number")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : isValidPhone
                          ? "border-green-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      placeholder={t("phone_format_hint")}
                      autoComplete="tel"
                      dir="ltr"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm text-left">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
                      {t("password")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 ${
                          formData.password ? "pr-10" : "pr-3"
                        } py-3 border ${
                          errors.password
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder={t("create_password")}
                        autoComplete="new-password"
                        dir="ltr"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                      {formData.password && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label={
                            showPassword
                              ? t("hide_password")
                              : t("show_password")
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm text-left">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">
                      {t("confirm_password")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 ${
                          formData.confirmPassword ? "pr-10" : "pr-3"
                        } py-3 border ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder={t("confirm_password_placeholder")}
                        autoComplete="new-password"
                        dir="ltr"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      />
                      {formData.confirmPassword && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label={
                            showConfirmPassword
                              ? t("hide_password")
                              : t("show_password")
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm text-left">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div
                  className={`text-xs text-gray-500 dark:text-gray-400 space-y-1 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <p>{t("password_requirements")}:</p>
                  <ul
                    className={`list-disc ${isRTL ? "pr-5" : "pl-5"} space-y-1`}
                  >
                    <li
                      className={
                        formData.password.length >= 8 ? "text-green-500" : ""
                      }
                    >
                      {t("password_min_length")}
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(formData.password) ? "text-green-500" : ""
                      }
                    >
                      {t("password_uppercase")}
                    </li>
                    <li
                      className={
                        /[a-z]/.test(formData.password) ? "text-green-500" : ""
                      }
                    >
                      {t("password_lowercase")}
                    </li>
                    <li
                      className={
                        /[0-9]/.test(formData.password) ? "text-green-500" : ""
                      }
                    >
                      {t("password_number")}
                    </li>
                    <li
                      className={
                        formData.password === formData.confirmPassword &&
                        formData.confirmPassword
                          ? "text-green-500"
                          : ""
                      }
                    >
                      {t("password_match")}
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  {loading ? (
                    <div
                      className={`flex items-center justify-center ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("creating_account")}
                    </div>
                  ) : (
                    t("create_account_button")
                  )}
                </button>
              </div>

              <p
                className={`mt-6 text-center text-sm text-gray-600 dark:text-gray-400 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("already_have_account")}{" "}
                <button
                  type="button"
                  onClick={() => router.push("/Auth/signin")}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {t("sign_in")}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
