"use client";

import { recover } from "@/actions/auth";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email(),
});

const RecoverForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const hasRequestedRecoverySuccessfully = await recover(data);

      if (!hasRequestedRecoverySuccessfully) {
        throw new Error("SOMETHING_WENT_WRONG");
      }

      console.log("Successfully submitted the recovery.");

      router.push("/login");
    } catch (e) {
      console.error(
        "Failed to submit the recovery. Please get in touch with support.",
      );

      console.error(e);
    }
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="email@address.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          Submit Request
        </Button>
      </form>
    </Form>
  );
};

export default RecoverForm;
