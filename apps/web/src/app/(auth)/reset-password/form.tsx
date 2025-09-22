"use client";

import { authClient } from "@/lib/auth-client";
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
} from "@repo/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  password: z.string().min(12, "Password must be at least 12 characters"),
  confirmPassword: z
    .string()
    .min(12, "Password must be at least 12 characters"),
});

type FormData = z.infer<typeof formSchema>;

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get("token");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      if (data.password !== data.confirmPassword) {
        form.setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        return;
      }

      if (!token) {
        form.setError("root", {
          type: "manual",
          message: "Invalid reset token. Please request a new password reset.",
        });
        return;
      }

      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        form.setError("root", {
          type: "manual",
          message: result.error.message || "Failed to reset password",
        });
        return;
      }

      router.push("/login?message=password-reset-success");
    } catch (error) {
      console.error("Password reset error:", error);
      form.setError("root", {
        type: "manual",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your new password"
                  type="password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Confirm your new password"
                  type="password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
