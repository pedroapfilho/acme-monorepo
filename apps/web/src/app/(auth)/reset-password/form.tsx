"use client";

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
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

type FormData = z.infer<typeof formSchema>;

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get("token");

  const form = useForm<FormData>({
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      if (data.password !== data.confirmPassword) {
        form.setError("confirmPassword", {
          message: "Passwords do not match",
          type: "manual",
        });
        return;
      }

      if (!token) {
        form.setError("root", {
          message: "Invalid reset token. Please request a new password reset.",
          type: "manual",
        });
        return;
      }

      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        form.setError("root", {
          message: result.error.message || "Failed to reset password",
          type: "manual",
        });
        return;
      }

      router.push("/login?message=password-reset-success");
    } catch {
      form.setError("root", {
        message: "An error occurred. Please try again.",
        type: "manual",
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
                  disabled={isLoading}
                  placeholder="Enter your new password"
                  type="password"
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
                  disabled={isLoading}
                  placeholder="Confirm your new password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-red-500">{form.formState.errors.root.message}</div>
        )}

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
