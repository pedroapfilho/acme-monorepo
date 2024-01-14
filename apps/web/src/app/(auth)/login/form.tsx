"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
} from "@repo/ui";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(8),
});

const LoginForm = () => {
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async ({ id, password }) => {
    try {
      const response = await signIn("credentials", {
        id,
        password,
        callbackUrl: searchParams?.get("from") || "/",
      });

      if (!response?.ok) {
        throw new Error("SOMETHING_WENT_WRONG");
      }
    } catch (e) {
      console.error(e);
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input
                  placeholder="00000000-0000-0000-0000-000000000000"
                  {...field}
                />
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
                <Input placeholder="supersecret" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Log In
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
