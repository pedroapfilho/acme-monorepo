"use client";

import { login } from "@/actions/auth";
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
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(8),
});

const LoginForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const handleSubmit = async (formData: FormData) => {
    try {
      await login(formData);
    } catch (e) {
      console.error(e);

      form.setError("id", {
        type: "manual",
        message: "Invalid credentials",
      });

      form.setError("password", {
        type: "manual",
        message: "Invalid credentials",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" action={handleSubmit}>
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
