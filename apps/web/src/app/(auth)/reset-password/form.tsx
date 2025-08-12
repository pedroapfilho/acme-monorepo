"use client";

import { resetPassword } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("PASSWORDS_DO_NOT_MATCH");
      }

      if (!email || !token) {
        router.replace("/login");

        return null;
      }

      const hasRequestedResetPasswordSuccessfully = await resetPassword({
        email,
        token,
        password: data.password,
      });

      if (!hasRequestedResetPasswordSuccessfully) {
        throw new Error("SOMETHING_WENT_WRONG");
      }

      console.log("Password changed, please login again.");

      await signOut({ callbackUrl: "/" });
    } catch (e) {
      console.error("Failed to reset the password. Please try again later.");

      console.error(e);
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="supersecret" type="password" {...field} />
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
                <Input placeholder="supersecret" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Reset Password
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
