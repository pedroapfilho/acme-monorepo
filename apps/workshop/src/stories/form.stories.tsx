import { Field, FieldDescription, FieldError, FieldLabel, Button, Input, Checkbox } from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@tanstack/react-form";
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

type LoginFormValues = z.infer<typeof loginSchema>;

const loginDefaultValues: LoginFormValues = {
  email: "",
  password: "",
  remember: false,
};

const LoginFormRender = () => {
  const form = useForm({
    defaultValues: loginDefaultValues,
    onSubmit: async ({ value }) => {
      console.log(value);
      alert("Form submitted! Check the console for values.");
    },
    validators: {
      onBlur: loginSchema,
      onChange: loginSchema,
    },
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="john@example.com"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="password"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="********"
                  type="password"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="remember">
          {(field) => (
            <Field className="flex flex-row items-start gap-3">
              <Checkbox
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <div className="space-y-1 leading-none">
                <FieldLabel>Remember me</FieldLabel>
                <FieldDescription>Keep me signed in for 30 days</FieldDescription>
              </div>
            </Field>
          )}
        </form.Field>

        <Button className="w-full" type="submit">
          Sign In
        </Button>
      </form>
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

type ProfileFormValues = z.infer<typeof profileSchema>;

const profileDefaultValues: ProfileFormValues = {
  bio: "",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  marketing: false,
  notifications: true,
  website: "",
};

const ProfileFormRender = () => {
  const form = useForm({
    defaultValues: profileDefaultValues,
    onSubmit: async ({ value }) => {
      console.log(value);
      alert("Profile updated! Check the console for values.");
    },
    validators: {
      onBlur: profileSchema,
      onChange: profileSchema,
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <form
        className="space-y-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.Field name="firstName">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id="firstName"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="John"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="lastName">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id="lastName"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Doe"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="profile-email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="john@example.com"
                  value={field.state.value}
                />
                <FieldDescription>
                  This email will be used for account notifications
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="website">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="website"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://example.com"
                  value={field.state.value}
                />
                <FieldDescription>Optional: Your personal or professional website</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="bio">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <textarea
                  aria-invalid={isInvalid}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  id="bio"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Tell us about yourself..."
                  value={field.state.value}
                />
                <FieldDescription>
                  A brief description about yourself (max 500 characters)
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferences</h3>

          <form.Field name="notifications">
            {(field) => (
              <Field className="flex flex-row items-start gap-3">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                />
                <div className="space-y-1 leading-none">
                  <FieldLabel>Email Notifications</FieldLabel>
                  <FieldDescription>
                    Receive email notifications about your account activity
                  </FieldDescription>
                </div>
              </Field>
            )}
          </form.Field>

          <form.Field name="marketing">
            {(field) => (
              <Field className="flex flex-row items-start gap-3">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                />
                <div className="space-y-1 leading-none">
                  <FieldLabel>Marketing Emails</FieldLabel>
                  <FieldDescription>
                    Receive emails about new features and promotions
                  </FieldDescription>
                </div>
              </Field>
            )}
          </form.Field>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button onClick={() => form.reset()} type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
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

type ContactFormValues = z.infer<typeof contactSchema>;

const contactDefaultValues: ContactFormValues = {
  email: "",
  message: "",
  name: "",
  priority: "medium",
  subject: "",
  subscribe: false,
};

const ContactFormRender = () => {
  const form = useForm({
    defaultValues: contactDefaultValues,
    onSubmit: async ({ value }) => {
      console.log(value);
      alert("Message sent! Check the console for values.");
    },
    validators: {
      onBlur: contactSchema,
      onChange: contactSchema,
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <p className="text-muted-foreground">We&apos;d love to hear from you. Send us a message!</p>
      </div>

      <form
        className="space-y-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.Field name="name">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id="contact-name"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your name"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id="contact-email"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="your@email.com"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <form.Field name="subject">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor="subject">Subject</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      id="subject"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="What is this about?"
                      value={field.state.value}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="priority">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="priority">Priority</FieldLabel>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                  id="priority"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as "low" | "medium" | "high")}
                  value={field.state.value}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field name="message">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <textarea
                  aria-invalid={isInvalid}
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                  id="message"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  value={field.state.value}
                />
                <FieldDescription>Please provide as much detail as possible</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="subscribe">
          {(field) => (
            <Field className="flex flex-row items-start gap-3">
              <Checkbox
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <div className="space-y-1 leading-none">
                <FieldLabel>Subscribe to Newsletter</FieldLabel>
                <FieldDescription>Get notified about updates and new features</FieldDescription>
              </div>
            </Field>
          )}
        </form.Field>

        <Button className="w-full" type="submit">
          Send Message
        </Button>
      </form>
    </div>
  );
};

export const ContactForm: Story = {
  render: () => <ContactFormRender />,
};

const validationSchema = z.object({
  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Age must be less than 120"),
  email: z.string().email("Invalid email address"),
  terms: z.boolean(),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type ValidationFormValues = z.infer<typeof validationSchema>;

const validationDefaultValues: ValidationFormValues = {
  age: 0,
  email: "",
  terms: false,
  username: "",
};

const FormValidationRender = () => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: validationDefaultValues,
    onSubmit: async ({ value }) => {
      setSubmitted(true);
      console.log(value);
      setTimeout(() => setSubmitted(false), 2000);
    },
    validators: {
      onBlur: validationSchema,
      onChange: validationSchema,
    },
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Validation Examples</h2>
        <p className="text-muted-foreground">Try submitting with invalid data to see validation</p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="username"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter username"
                  value={field.state.value}
                />
                <FieldDescription>Must be at least 3 characters long</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="validation-email">Email</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="validation-email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter email"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="age">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="age">Age</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id="age"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  placeholder="Enter age"
                  type="number"
                  value={field.state.value}
                />
                <FieldDescription>Must be between 18 and 120</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="terms">
          {(field) => (
            <Field className="flex flex-row items-start gap-3">
              <Checkbox
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <div className="space-y-1 leading-none">
                <FieldLabel>Accept Terms</FieldLabel>
                <FieldDescription>I agree to the terms and conditions</FieldDescription>
              </div>
            </Field>
          )}
        </form.Field>

        <Button className="w-full" disabled={submitted} type="submit">
          {submitted ? "Submitted!" : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export const FormValidation: Story = {
  render: () => <FormValidationRender />,
};

type FormStatesValues = {
  disabled: string;
  error: string;
  normal: string;
  readonly: string;
};

const formStatesDefaultValues: FormStatesValues = {
  disabled: "Disabled field",
  error: "",
  normal: "",
  readonly: "Read-only field",
};

const FormStatesRender = () => {
  const form = useForm({
    defaultValues: formStatesDefaultValues,
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Form Field States</h2>
        <p className="text-muted-foreground">Different states of form fields</p>
      </div>

      <form className="space-y-4">
        <form.Field name="normal">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="normal">Normal Field</FieldLabel>
              <Input
                id="normal"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter text"
                value={field.state.value}
              />
              <FieldDescription>This is a normal input field</FieldDescription>
            </Field>
          )}
        </form.Field>

        <form.Field name="error">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="error">Field with Error</FieldLabel>
              <Input
                id="error"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter email"
                value={field.state.value}
              />
              <FieldDescription>This field has validation errors</FieldDescription>
            </Field>
          )}
        </form.Field>

        <form.Field name="disabled">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="disabled">Disabled Field</FieldLabel>
              <Input disabled id="disabled" name={field.name} value={field.state.value} />
              <FieldDescription>This field is disabled</FieldDescription>
            </Field>
          )}
        </form.Field>

        <form.Field name="readonly">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="readonly">Read-only Field</FieldLabel>
              <Input id="readonly" name={field.name} readOnly value={field.state.value} />
              <FieldDescription>This field is read-only</FieldDescription>
            </Field>
          )}
        </form.Field>
      </form>
    </div>
  );
};

export const FormStates: Story = {
  render: () => <FormStatesRender />,
};
