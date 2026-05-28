import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  profileComplete: boolean;
  role?: "user" | "farmer" | "admin";
  farmName?: string;
  farmLocation?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  loginWithGoogle: (role?: "user" | "farmer" | "admin") => Promise<void>;
  // remember: when true persist token across sessions (localStorage); when false keep in sessionStorage
  loginWithEmail: (email: string, password: string, role?: "user" | "farmer" | "admin", remember?: boolean) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, role?: "user" | "farmer" | "admin", farmName?: string, farmLocation?: string, remember?: boolean) => Promise<void>;
  loginWithPhone: (phone: string, remember?: boolean) => Promise<any>;
  verifyOTP: (otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:8080");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    // Check both persistent and session storage for an auth token
    const token = localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
    // Dev helper: allow quick local admin via query param ?dev_admin=1 or localStorage.dev-admin = '1'
    const urlParams = new URLSearchParams(window.location.search);
    const devAdminRequested = urlParams.get('dev_admin') === '1' || localStorage.getItem('dev-admin') === '1';
    const isDev = (import.meta as any).env && (import.meta as any).env.DEV;

    if (!token && isDev && devAdminRequested) {
      // set a mock token and short-circuit verify
      localStorage.setItem('auth-token', 'mock-admin-token');
      console.log('Dev auto-login: setting mock-admin-token');
      verifyTokenWithServer('mock-admin-token');
      return;
    }

    if (token) {
      // Verify token with server
      verifyTokenWithServer(token);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyTokenWithServer = async (token: string) => {
    console.log("Verifying token with server...");

    if (token === "mock-admin-token") {
      console.log("Mock admin token found, setting mock user");
      const mockUser: User = {
        id: "google-" + Date.now(),
        email: "admin@gmail.com",
        name: "",
        profileComplete: true,
        role: "admin",
      };
      setState({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Token verified, user data:", data.user);
        setState({
          isAuthenticated: true,
          user: data.user,
          isLoading: false
        });
      } else {
        console.log("Token invalid");
        // Token invalid, remove it
        localStorage.removeItem("auth-token");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("auth-token");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const loginWithGoogle = async (role: "user" | "farmer" | "admin" = "user") => {
    console.log("Attempting to log in with Google...");
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // Mock Google OAuth - in real implementation, integrate with Google Identity Services
      const mockUser: User = {
        id: "google-" + Date.now(),
        email: "admin@gmail.com",
        name: "",
        profileComplete: true, // Mark profile as complete for testing dashboard access
        role: role,
      };
      // Set a mock token
      localStorage.setItem("auth-token", "mock-admin-token");
      console.log("Mock user created:", mockUser);
      setState({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false
      });
      // notify global listeners
      try {
        window.dispatchEvent(
          new CustomEvent("organic:auth-changed", {
            detail: { user: mockUser },
          }),
        );
      } catch (e) {}
    } catch (error) {
      console.error("Google login failed:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string, role: "user" | "farmer" | "admin" = "user", farmName?: string, farmLocation?: string, remember: boolean = true) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role, farmName, farmLocation, remember }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON to get a specific error message
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Registration failed");
        } catch (e) {
          // If not JSON, use the raw text
          throw new Error(errorText || "Registration failed");
        }
      }

      const data = await response.json();

      // Store token according to remember preference.
      if (remember) {
        localStorage.setItem("auth-token", data.token);
      } else {
        sessionStorage.setItem("auth-token", data.token);
      }

      setState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
      });

      // Notify listeners
      try {
        window.dispatchEvent(
          new CustomEvent("organic:auth-changed", {
            detail: { user: data.user },
          }),
        );
      } catch (e) {}
    } catch (error) {
      console.error("Email registration failed:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string, role?: "user" | "farmer" | "admin", remember: boolean = true) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role, remember }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON to get a specific error message
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Login failed");
        } catch (e) {
          // If not JSON, use the raw text
          throw new Error(errorText || "Login failed");
        }
      }

      const data = await response.json();

      // Store token according to remember flag
      if (remember) {
        localStorage.setItem("auth-token", data.token);
      } else {
        sessionStorage.setItem("auth-token", data.token);
      }

      setState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
      });

      // Notify listeners
      try {
        window.dispatchEvent(
          new CustomEvent("organic:auth-changed", {
            detail: { user: data.user },
          }),
        );
      } catch (e) {}
    } catch (error) {
      console.error("Email login failed:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const loginWithPhone = async (phone: string, remember: boolean = true) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // Call server to send OTP
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) {
        const err = await response.text().catch(() => 'Failed to send OTP');
        throw new Error(err || 'Failed to send OTP');
      }
      const data = await response.json();
      // Store pending phone info including remember flag so verifyOTP can use it
      localStorage.setItem('pending-phone-login', JSON.stringify({ phone, remember }));
      setState((prev) => ({ ...prev, isLoading: false }));
      // In dev, server returns OTP in response.data. We don't use it here; UI will prompt for OTP.
      return data;
    } catch (error) {
      console.error('Phone login failed:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const verifyOTP = async (otp: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const pending = localStorage.getItem('pending-phone-login');
      if (!pending) throw new Error('No pending phone login');
      const { phone, remember } = JSON.parse(pending);

      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, remember }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid OTP');
      }
      const data = await response.json();

      // Store token according to remember flag
      if (remember) {
        localStorage.setItem('auth-token', data.token);
      } else {
        sessionStorage.setItem('auth-token', data.token);
      }

      setState({ isAuthenticated: true, user: data.user, isLoading: false });
      try { window.dispatchEvent(new CustomEvent('organic:auth-changed', { detail: { user: data.user } })); } catch (e) {}
      localStorage.removeItem('pending-phone-login');
    } catch (error) {
      console.error('OTP verification failed:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  localStorage.removeItem("auth-token");
  sessionStorage.removeItem("auth-token");
    try {
      window.dispatchEvent(
        new CustomEvent("organic:auth-changed", { detail: { user: null } }),
      );
    } catch (e) {}
  };

  const updateUser = (updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  const value: AuthContextType = {
    ...state,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginWithPhone,
    verifyOTP,
    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to request password reset');
      }
      return await response.json();
    },
    resetPassword: async (token: string, newPassword: string) => {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reset password');
      }
    },
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
