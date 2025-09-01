"use client";

import { signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  LoadingSpinner,
  PasswordInput,
} from "@repo/ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { authEventEmitter } from "@/providers/auth-provider";
import { AlertCircle, CheckCircle2, Mail, Lock } from "lucide-react";
import Link from "next/link";

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  // Listen to auth events
  useEffect(() => {
    const unsubscribe = authEventEmitter.subscribe((event) => {
      if (event.type === "SIGN_IN_SUCCESS") {
        setShowSuccess(true);
        setTimeout(() => router.push("/"), 1500);
      } else if (event.type === "SIGN_IN_ERROR") {
        form.setError("root", {
          type: "manual",
          message: event.error.message || "Failed to sign in",
        });
      }
    });

    return unsubscribe;
  }, [form, router]);

  const handleSubmit = useCallback(async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      form.clearErrors("root");
      
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        authEventEmitter.emit({ 
          type: "SIGN_IN_ERROR", 
          error: new Error(result.error.message || "Invalid credentials") 
        });
        return;
      }

      if (result.data?.user) {
        authEventEmitter.emit({ 
          type: "SIGN_IN_SUCCESS", 
          user: result.data.user 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      authEventEmitter.emit({ 
        type: "SIGN_IN_ERROR", 
        error: error instanceof Error ? error : new Error("An unexpected error occurred") 
      });
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
        <h2 className="text-xl font-semibold text-green-800 mb-2">Welcome back!</h2>
        <p className="text-green-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    startIcon={<Mail />}
                    aria-describedby={
                      form.formState.errors.email ? `email-error` : undefined
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage id="email-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link 
                    href="/recover" 
                    className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    aria-describedby={
                      form.formState.errors.password ? `password-error` : undefined
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage id="password-error" />
              </FormItem>
            )}
          />
          
          {form.formState.errors.root && (
            <div 
              role="alert"
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}
          
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading || !form.formState.isValid}
            aria-describedby={isLoading ? "loading-status" : undefined}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          {isLoading && (
            <div 
              id="loading-status" 
              className="sr-only" 
              aria-live="polite"
            >
              Signing in, please wait...
            </div>
          )}
        </form>
      </Form>

      <div className="text-center">
        <span className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link 
            href="/register" 
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default LoginForm;