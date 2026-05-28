import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Your email has been verified.",
  robots: { follow: false, index: false },
  title: "Email verified",
};

const VerifyEmailSuccessPage = () => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Email verified</CardTitle>
      <CardDescription>
        You can close this page and return to the tab where you signed up — it will sign you in
        automatically.
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center text-sm text-muted-foreground">
      If that tab is already closed, sign in from the login page.
    </CardContent>
  </Card>
);

export default VerifyEmailSuccessPage;
