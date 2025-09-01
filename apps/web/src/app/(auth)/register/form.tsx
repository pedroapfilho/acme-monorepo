"use client";

import { signUp } from "@/lib/auth-client";
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
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { authEventEmitter } from "@/providers/auth-provider";
import { AlertCircle, CheckCircle2, Mail, User } from "lucide-react";
import Link from "next/link";

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
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
          message: event.error.message || "Failed to create account",
        });
      }
    });

    return unsubscribe;
  }, [form, router]);

  const onSubmit = useCallback(async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      form.clearErrors("root");

      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        authEventEmitter.emit({ 
          type: "SIGN_IN_ERROR", 
          error: new Error(result.error.message || "Failed to create account") 
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
      console.error("Registration error:", error);
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
        <h2 className="text-xl font-semibold text-green-800 mb-2">Welcome to Acme!</h2>
        <p className="text-green-600">Account created successfully. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="text-muted-foreground">
          Get started with your free account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    autoComplete="name"
                    disabled={isLoading}
                    startIcon={<User />}
                    aria-describedby={
                      form.formState.errors.name ? `name-error` : undefined
                    }
                    {...field} 
                  />
                </FormControl>
                <FormMessage id="name-error" />
              </FormItem>
            )}
          />

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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput 
                    placeholder="Create a strong password" 
                    autoComplete="new-password"
                    disabled={isLoading}
                    showStrength={true}
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput 
                    placeholder="Confirm your password" 
                    autoComplete="new-password"
                    disabled={isLoading}
                    aria-describedby={
                      form.formState.errors.confirmPassword ? `confirm-password-error` : undefined
                    }
                    {...field} 
                  />
                </FormControl>
                <FormMessage id="confirm-password-error" />
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          {isLoading && (
            <div 
              id="loading-status" 
              className="sr-only" 
              aria-live="polite"
            >
              Creating your account, please wait...
            </div>
          )}
        </form>
      </Form>

      <div className="text-center">
        <span className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default RegisterForm;