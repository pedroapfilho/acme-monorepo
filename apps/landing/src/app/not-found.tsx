import { NotFoundPage } from "@repo/ui/compositions/not-found-page";
import type { Metadata } from "next";

/** @public Next.js app-router reads metadata via the module loader */
export const metadata: Metadata = {
  title: "Page not found",
};

const NotFound = () => <NotFoundPage className="py-24 md:py-32" />;

export default NotFound;
