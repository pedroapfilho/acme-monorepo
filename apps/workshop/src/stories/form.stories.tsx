import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Checkbox,
} from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { useState } from "storybook/internal/preview-api";
import { z } from "zod";

const meta: Meta = {
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  title: "ui/Form",
};

export default meta;
type Story = StoryObj;

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  remember: z.boolean().optional(),
});

const handleLoginSubmit = (values: z.infer<typeof loginSchema>) => {
  console.log(values);
  alert("Form submitted! Check the console for values.");
};

const LoginFormRender = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleLoginSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
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
                  <Input placeholder="********" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Remember me</FormLabel>
                  <FormDescription>Keep me signed in for 30 days</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const LoginForm: Story = {
  render: () => <LoginFormRender />,
};

const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  marketing: z.boolean(),
  notifications: z.boolean(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

const handleProfileSubmit = (values: z.infer<typeof profileSchema>) => {
  console.log(values);
  alert("Profile updated! Check the console for values.");
};

const ProfileFormRender = () => {
  const form = useForm<z.infer<typeof profileSchema>>({
    defaultValues: {
      bio: "",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      marketing: false,
      notifications: true,
      website: "",
    },
    resolver: zodResolver(profileSchema),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleProfileSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormDescription>This email will be used for account notifications</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormDescription>Optional: Your personal or professional website</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <textarea
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description about yourself (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferences</h3>

            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email notifications about your account activity
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Marketing Emails</FormLabel>
                    <FormDescription>
                      Receive emails about new features and promotions
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit">Save Changes</Button>
            <Button onClick={() => form.reset()} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const ProfileForm: Story = {
  render: () => <ProfileFormRender />,
};

const contactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  priority: z.enum(["low", "medium", "high"]),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  subscribe: z.boolean().optional(),
});

const handleContactSubmit = (values: z.infer<typeof contactSchema>) => {
  console.log(values);
  alert("Message sent! Check the console for values.");
};

const ContactFormRender = () => {
  const form = useForm<z.infer<typeof contactSchema>>({
    defaultValues: {
      email: "",
      message: "",
      name: "",
      priority: "medium",
      subject: "",
      subscribe: false,
    },
    resolver: zodResolver(contactSchema),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <p className="text-muted-foreground">We&apos;d love to hear from you. Send us a message!</p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleContactSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="What is this about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                      {...field}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <textarea
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    placeholder="Tell us more about your inquiry..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>Please provide as much detail as possible</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subscribe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Subscribe to Newsletter</FormLabel>
                  <FormDescription>Get notified about updates and new features</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit">
            Send Message
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const ContactForm: Story = {
  render: () => <ContactFormRender />,
};

const FormValidationRender = () => {
  const form = useForm({
    defaultValues: {
      age: "",
      email: "",
      terms: false,
      username: "",
    },
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (values: unknown) => {
    setSubmitted(true);
    console.log(values);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Validation Examples</h2>
        <p className="text-muted-foreground">Try submitting with invalid data to see validation</p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormDescription>Must be at least 3 characters long</FormDescription>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              minLength: {
                message: "Username must be at least 3 characters",
                value: 3,
              },
              required: "Username is required",
            }}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              pattern: {
                message: "Invalid email address",
                value: /^\S+@\S+$/i,
              },
              required: "Email is required",
            }}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter age"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Must be between 18 and 120</FormDescription>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              max: {
                message: "Age must be less than 120",
                value: 120,
              },
              min: {
                message: "You must be at least 18 years old",
                value: 18,
              },
              required: "Age is required",
            }}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Accept Terms</FormLabel>
                  <FormDescription>I agree to the terms and conditions</FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
            rules={{
              required: "You must accept the terms",
            }}
          />

          <Button className="w-full" disabled={submitted} type="submit">
            {submitted ? "Submitted!" : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const FormValidation: Story = {
  render: () => <FormValidationRender />,
};

const FormStatesRender = () => {
  const form = useForm({
    defaultValues: {
      disabled: "Disabled field",
      error: "invalid-email",
      normal: "",
      readonly: "Read-only field",
    },
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Form Field States</h2>
        <p className="text-muted-foreground">Different states of form fields</p>
      </div>

      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="normal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Normal Field</FormLabel>
                <FormControl>
                  <Input placeholder="Enter text" {...field} />
                </FormControl>
                <FormDescription>This is a normal input field</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="error"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field with Error</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
                <FormDescription>This field has validation errors</FormDescription>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              pattern: {
                message: "Please enter a valid email address",
                value: /^\S+@\S+$/i,
              },
            }}
          />

          <FormField
            control={form.control}
            name="disabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disabled Field</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>This field is disabled</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="readonly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read-only Field</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormDescription>This field is read-only</FormDescription>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export const FormStates: Story = {
  render: () => <FormStatesRender />,
};
