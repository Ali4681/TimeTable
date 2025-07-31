import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:8000";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  isActive?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    isActive: boolean;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordData {
  newPassword: string;
  phoneNumber: string;
}

export interface SaveChatIdData {
  phoneNumber: string;
  chatId: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: {
    email?: string;
    phoneNumber?: string;
    password?: string;
    fullName?: string;
    [key: string]: string | undefined;
  };
}

export const authService = {
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      if (!userData.password) throw new Error("Password is required");
      if (!userData.email) throw new Error("Email is required");
      if (!userData.fullName) throw new Error("Full name is required");
      if (!userData.phoneNumber) throw new Error("Phone number is required");
      if (!this.validatePhoneNumber(userData.phoneNumber)) {
        throw new Error(
          "Invalid phone number format. Please use international format (+1234567890)"
        );
      }

      const response = await axios.post(`${API_URL}/auth/signup`, userData, {
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 400) {
        const errorData = response.data as ApiError;
        throw new Error(
          errorData.message ||
            errorData.errors?.email ||
            errorData.errors?.phoneNumber ||
            errorData.errors?.password ||
            errorData.errors?.fullName ||
            "Sign up failed. Please check your information and try again."
        );
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiError;
        throw new Error(
          serverError?.message ||
            serverError?.errors?.email ||
            serverError?.errors?.phoneNumber ||
            serverError?.errors?.password ||
            serverError?.errors?.fullName ||
            "Network error. Please check your connection and try again."
        );
      }
      throw new Error((error as Error).message || "Sign up failed");
    }
  },

  async signIn(credentials: SignInData): Promise<AuthResponse> {
    try {
      if (!credentials.password) throw new Error("Password is required");
      if (!credentials.email) throw new Error("Email is required");

      const response = await axios.post(`${API_URL}/auth/signin`, credentials);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.errors?.password ||
          axiosError.response?.data?.errors?.email ||
          "Sign in failed. Please check your credentials and try again."
      );
    }
  },

  async getAdminData(token: string): Promise<string> {
    try {
      if (!token) throw new Error("Authentication token is required");

      const response = await axios.get(`${API_URL}/auth/admin-only`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch admin data"
      );
    }
  },

  async forgotPassword(phoneNumber: string): Promise<ForgotPasswordResponse> {
    try {
      if (!phoneNumber) throw new Error("Phone number is required");
      if (!this.validatePhoneNumber(phoneNumber)) {
        throw new Error("Invalid phone number format");
      }

      const response = await axios.post(`${API_URL}/user/forgot-password`, {
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message ||
          "Failed to initiate password reset"
      );
    }
  },

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      if (!data.phoneNumber || !data.newPassword) {
        throw new Error("Phone number and new password are required");
      }

      const response = await axios.post(`${API_URL}/user/reset-password`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error("An unexpected error occurred");
    }
  },

  async saveChatId(
    data: SaveChatIdData
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!data.phoneNumber || !data.chatId) {
        throw new Error("Phone number and chat ID are required");
      }
      if (!this.validatePhoneNumber(data.phoneNumber)) {
        throw new Error("Invalid phone number format");
      }

      const response = await axios.post(`${API_URL}/user/save-chat-id`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to save chat ID"
      );
    }
  },

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return phoneRegex.test(phoneNumber);
  },
};
