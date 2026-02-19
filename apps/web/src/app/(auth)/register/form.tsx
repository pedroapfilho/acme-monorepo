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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(3, "Name must be at least 3 characters").max(32),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

type FormData = z.infer<typeof formSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
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

      const result = await authClient.signUp.email({
        email: data.email,
        name: data.name,
        password: data.password,
      });

      if (result.error) {
        form.setError("root", {
          message: result.error.message || "Failed to register",
          type: "manual",
        });
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh(); // Refresh to ensure middleware runs
    } catch {
      form.setError("root", {
        message: "An error occurred during registration. Please try again.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input
                  disabled={isLoading}
                  placeholder="Enter your password"
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Confirm your password"
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
          {isLoading ? "Creating account..." : "Register"}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
