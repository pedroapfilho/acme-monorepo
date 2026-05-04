import { Heading, Link, Text } from "react-email";

import { Button, Card, Divider } from "../components";

import { BaseLayout } from "./base-layout";

type SignUpAttemptEmailProps = {
  resetPasswordUrl: string;
  signInUrl: string;
  userEmail: string;
  username?: string;
};

const SignUpAttemptEmail = ({
  resetPasswordUrl,
  signInUrl,
  userEmail,
  username,
}: SignUpAttemptEmailProps) => {
  return (
    <BaseLayout preview="A sign-up attempt was made with your Acme account email">
      <Heading className="mt-0 mb-4 text-2xl font-semibold tracking-tight text-balance break-words text-foreground">
        Did you try to sign up?
      </Heading>

      <Text className="m-0 mb-2 text-base text-pretty break-words text-muted-foreground">
        Hi{username ? ` ${username}` : ""},
      </Text>

      <Text className="m-0 mb-2 text-base text-pretty break-words text-muted-foreground">
        Someone just tried to create a new Acme account using your email (
        <strong>{userEmail}</strong>). You already have an account with us, so we didn&apos;t create
        a new one.
      </Text>

      <Text className="m-0 mb-6 text-base text-pretty break-words text-muted-foreground">
        If this was you, sign in to your existing account below. If you forgot your password, you
        can reset it.
      </Text>

      <div className="mb-6">
        <Button fullWidth href={signInUrl} variant="primary">
          Sign in
        </Button>
      </div>

      <Text className="m-0 mb-6 text-base text-muted-foreground">
        Or{" "}
        <Link className="text-foreground underline" href={resetPasswordUrl}>
          reset your password
        </Link>{" "}
        if you don&apos;t remember it.
      </Text>

      <Divider />

      <Card accent title="Didn't try to sign up?">
        <Text className="m-0 mb-2 text-base text-muted-foreground">
          You can safely ignore this email — no account changes were made. If you keep getting these
          notifications, someone may be probing for accounts using your email. We recommend:
        </Text>
        <ul className="m-0 list-inside list-disc text-base text-muted-foreground">
          <li className="py-1">Confirm your email account is secure</li>
          <li className="py-1">Enable two-factor authentication on Acme</li>
          <li className="py-1">
            <Link className="text-foreground underline" href="mailto:security@acme.com">
              Let our security team know
            </Link>
          </li>
        </ul>
      </Card>

      <Divider spacing="sm" />

      <Text className="m-0 text-xs text-muted-foreground">
        If the button above doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <Link className="break-all text-foreground underline" href={signInUrl}>
          {signInUrl}
        </Link>
      </Text>
    </BaseLayout>
  );
};

export { SignUpAttemptEmail };
// fallow-ignore-next-line unused-export
export default SignUpAttemptEmail;
