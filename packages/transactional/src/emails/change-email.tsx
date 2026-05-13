import { Heading, Link, Text } from "react-email";

import { Button } from "../components/button";
import { Divider } from "../components/divider";

import { BaseLayout } from "./base-layout";

type ChangeEmailProps = {
  changeUrl: string;
  currentEmail: string;
  newEmail: string;
  username?: string;
};

const ChangeEmail = ({ changeUrl, currentEmail, newEmail, username }: ChangeEmailProps) => {
  return (
    <BaseLayout preview="Confirm your new Acme account email address.">
      <Heading className="mt-0 mb-4 text-2xl font-semibold tracking-tight text-balance break-words text-foreground">
        Confirm your new email
      </Heading>

      <Text className="m-0 mb-6 text-base text-pretty break-words text-muted-foreground">
        You requested to change the email on your Acme account
        {username ? ` (${username})` : ""} from <strong>{currentEmail}</strong> to{" "}
        <strong>{newEmail}</strong>. Confirm to complete the change.
      </Text>

      <div className="mb-6">
        <Button fullWidth href={changeUrl} variant="primary">
          Confirm new email
        </Button>
      </div>

      <Divider />

      <Text className="m-0 mb-4 text-sm text-muted-foreground">
        If you didn&apos;t request this change, ignore this email — the change won&apos;t happen and
        your account email stays as {currentEmail}. The confirmation link expires in 24 hours.
      </Text>

      <Divider spacing="sm" />

      <Text className="m-0 text-xs text-muted-foreground">
        If the button above doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <Link className="break-all text-foreground underline" href={changeUrl}>
          {changeUrl}
        </Link>
      </Text>
    </BaseLayout>
  );
};

export { ChangeEmail };
export default ChangeEmail;
