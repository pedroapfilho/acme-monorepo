"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut as authSignOut } from "@/lib/auth-client";
import { AuthContextType, AuthState, BetterAuthUser, AuthEvent } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth event emitter for global state management
class AuthEventEmitter {
  private listeners: ((event: AuthEvent) => void)[] = [];

  subscribe(listener: (event: AuthEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(event: AuthEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

const authEventEmitter = new AuthEventEmitter();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Type-safe user transformation
  const transformUser = (userData: unknown): BetterAuthUser | null => {
    if (!userData || typeof userData !== 'object') return null;
    
    const user = userData as Record<string, unknown>;
    
    // Validate required fields
    if (typeof user.id !== 'string' || typeof user.email !== 'string') {
      console.warn('Invalid user data received:', userData);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: typeof user.name === 'string' ? user.name : undefined,
      username: typeof user.username === 'string' ? user.username : user.email,
      displayName: typeof user.displayName === 'string' ? user.displayName : user.name,
      emailVerified: typeof user.emailVerified === 'boolean' ? user.emailVerified : false,
      image: typeof user.image === 'string' ? user.image : undefined,
      createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(),
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(),
    } as BetterAuthUser;
  };

  const transformSession = (sessionData: unknown) => {
    if (!sessionData || typeof sessionData !== 'object') return null;
    
    const session = sessionData as Record<string, unknown>;
    
    if (typeof session.id !== 'string' || typeof session.userId !== 'string') {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt as string),
      token: typeof session.token === 'string' ? session.token : '',
      ipAddress: typeof session.ipAddress === 'string' ? session.ipAddress : undefined,
      userAgent: typeof session.userAgent === 'string' ? session.userAgent : undefined,
      createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(),
      updatedAt: session.updatedAt instanceof Date ? session.updatedAt : new Date(),
    };
  };

  const user = transformUser(session.data?.user);
  const sessionInfo = transformSession(session.data?.session);

  const authState: AuthState = {
    isAuthenticated: !!user,
    isLoading: session.isPending || isRefreshing,
    user,
    session: sessionInfo,
    error: session.error || error,
  };

  const refreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      await session.refetch();
      
      if (user) {
        authEventEmitter.emit({ type: "SESSION_REFRESH", user });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to refresh session");
      setError(error);
      authEventEmitter.emit({ type: "SESSION_EXPIRED" });
    } finally {
      setIsRefreshing(false);
    }
  }, [session, user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authSignOut();
      setError(null);
      authEventEmitter.emit({ type: "SIGN_OUT_SUCCESS" });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to sign out");
      setError(error);
      authEventEmitter.emit({ type: "SIGN_OUT_ERROR", error });
      throw error;
    }
  }, []);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session.data?.session) return;

    const expiresAt = new Date(session.data.session.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000;
    
    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        refreshSession();
      }, refreshTime);
      
      return () => clearTimeout(timer);
    }
  }, [session.data?.session, refreshSession]);

  // Handle auth errors globally
  useEffect(() => {
    if (session.error) {
      console.error("Auth error:", session.error);
    }
  }, [session.error]);

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        refreshSession, 
        clearError, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export auth event emitter for external use
export { authEventEmitter };

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    fallback?: React.ComponentType;
    requireEmailVerified?: boolean;
  }
) => {
  const WithAuthComponent = (props: P) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    
    React.useEffect(() => {
      if (!isLoading && !isAuthenticated && options?.redirectTo) {
        router.replace(options.redirectTo);
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state
    if (isLoading) {
      const FallbackComponent = options?.fallback;
      return FallbackComponent ? <FallbackComponent /> : <div>Loading...</div>;
    }
    
    // Check authentication
    if (!isAuthenticated) {
      return null; // Router will handle redirect
    }

    // Check email verification if required
    if (options?.requireEmailVerified && user && !user.emailVerified) {
      router.replace('/verify-email');
      return null;
    }
    
    return <Component {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAuthComponent;
};