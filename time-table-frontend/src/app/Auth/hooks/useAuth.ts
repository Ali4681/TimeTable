import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AuthResponse,
  authService,
  SignInData,
  SignUpData,
  ForgotPasswordResponse,
  ResetPasswordData,
  SaveChatIdData,
} from "../auth.service";

export function useAuth() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const isAuthenticated = () => {
    return !!token;
  };

  const signUp = async (userData: SignUpData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signUp(userData);
      setUser(response.user || null);
      setToken(response.token || null);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      router.push("/home");
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: SignInData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signIn(credentials);
      setUser(response.user || null);
      setToken(response.token || null);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      router.push("/home");
      return response;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/login");
  };

  const forgotPassword = async (
    phoneNumber: string
  ): Promise<ForgotPasswordResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(phoneNumber);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    data: ResetPasswordData
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(data);
      // Return success=true when password reset is successful
      return { success: true, message: response.message };
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      // Return success=false when there's an error
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const saveChatId = async (data: SaveChatIdData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.saveChatId(data);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initializeAuth = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Optionally: You might want to fetch user data here if needed
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    saveChatId,
    initializeAuth,
  };
}
