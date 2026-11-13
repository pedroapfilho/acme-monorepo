import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "../components/button";

type BusyButtonProps = ComponentProps<typeof Button> & { isPending: boolean; pendingLabel: string };

const BusyButton = ({ children, isPending, pendingLabel, ...props }: BusyButtonProps) => (
  <Button aria-busy={isPending} disabled={isPending} {...props}>
    {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
    {isPending ? pendingLabel : children}
  </Button>
);

export { BusyButton };

export type { BusyButtonProps };
