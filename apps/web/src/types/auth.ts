export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  username?: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  user: AuthUser;
  expiresAt: string;
  token: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  displayName?: string;
  image?: string;
}

export interface AuthResponse<T = unknown> {
  data?: T;
  error?: AuthError;
}

export type AuthEventType =
  | "SESSION_CREATED"
  | "SESSION_REFRESHED"
  | "SESSION_EXPIRED"
  | "SIGN_IN"
  | "SIGN_OUT"
  | "SIGN_UP"
  | "USER_UPDATED"
  | "ERROR";

export interface AuthEvent {
  type: AuthEventType;
  payload?: unknown;
  timestamp: Date;
}
