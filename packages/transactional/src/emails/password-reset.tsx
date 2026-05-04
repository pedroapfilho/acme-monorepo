import { Heading, Link, Text } from "react-email";

import { Button, Card, Divider } from "../components";

import { BaseLayout } from "./base-layout";

type PasswordResetEmailProps = {
  browserInfo?: string;
  ipAddress?: string;
  resetUrl: string;
  userEmail: string;
  username?: string;
};

const PasswordResetEmail = ({
  browserInfo,
  ipAddress,
  resetUrl,
  userEmail,
  username,
}: PasswordResetEmailProps) => {
  return (
    <BaseLayout preview="Reset your Acme password">
      <Heading className="mt-0 mb-4 text-2xl font-semibold tracking-tight text-balance break-words text-foreground">
        Reset your password
      </Heading>

      <Text className="m-0 mb-2 text-base text-pretty break-words text-muted-foreground">
        Hi{username ? ` ${username}` : ""},
      </Text>

      <Text className="m-0 mb-6 text-base text-pretty break-words text-muted-foreground">
        We received a request to reset the password on your Acme account. If you made this request,
        use the button below to set a new password.
      </Text>

      <div className="mb-6">
        <Button fullWidth href={resetUrl} variant="primary">
          Reset password
        </Button>
      </div>

      <Divider />

      <Card accent title="Request details">
        <ul className="m-0 list-none p-0 text-base text-muted-foreground">
          <li className="py-1">Email: {userEmail}</li>
          {ipAddress && <li className="py-1">IP address: {ipAddress}</li>}
          {browserInfo && <li className="py-1">Browser: {browserInfo}</li>}
        </ul>
        <Text className="m-0 mt-3 mb-2 text-base font-semibold text-foreground">Important</Text>
        <ul className="m-0 list-inside list-disc text-base text-muted-foreground">
          <li className="py-1">This link expires in 1 hour</li>
          <li className="py-1">It can only be used once</li>
          <li className="py-1">If you didn&apos;t request this, secure your account</li>
        </ul>
      </Card>

      <Divider spacing="sm" />

      <Text className="m-0 text-xs text-muted-foreground">
        If the button above doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <Link className="break-all text-foreground underline" href={resetUrl}>
          {resetUrl}
        </Link>
      </Text>
    </BaseLayout>
  );
};

export { PasswordResetEmail };
// fallow-ignore-next-line unused-export
export default PasswordResetEmail;
