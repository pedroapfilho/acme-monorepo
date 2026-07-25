import { Heading, Link, Text } from "react-email";

import { Button } from "../components/button";
import { Divider } from "../components/divider";

import { BaseLayout } from "./base-layout";

type WelcomeEmailProps = {
  userEmail: string;
  username?: string;
  verificationUrl: string;
};

const WelcomeEmail = ({ userEmail, username, verificationUrl }: WelcomeEmailProps) => {
  return (
    <BaseLayout preview="Welcome to Acme. Verify your email to get started.">
      <Heading className="mt-0 mb-4 text-2xl font-semibold tracking-tight text-balance break-words text-foreground">
        Welcome to Acme.
      </Heading>

      <Text className="m-0 mb-6 text-base text-pretty break-words text-muted-foreground">
        Glad to have you here. Verify your email to finish setting up your account.
      </Text>

      <div className="mb-6">
        <Button fullWidth href={verificationUrl} variant="primary">
          Verify email address
        </Button>
      </div>

      <Divider />

      <Text className="m-0 mb-4 text-sm text-muted-foreground">
        If you didn&apos;t create an account with Acme, you can safely ignore this email. The
        verification link expires in 24 hours.
      </Text>

      <Text className="m-0 mb-4 text-sm text-muted-foreground">
        <strong>Account details</strong>
        <br />
        {username !== undefined && username !== "" ? (
          <>
            Username: {username}
            <br />
          </>
        ) : null}
        Email: {userEmail}
      </Text>

      <Divider spacing="sm" />

      <Text className="m-0 text-xs text-muted-foreground">
        If the button above doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <Link className="break-all text-foreground underline" href={verificationUrl}>
          {verificationUrl}
        </Link>
      </Text>
    </BaseLayout>
  );
};

export { WelcomeEmail };
export default WelcomeEmail;
