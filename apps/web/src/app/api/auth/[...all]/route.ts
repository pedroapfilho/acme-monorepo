import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const handler = async (request: NextRequest) => {
  const response = await auth.handler(request);
  return response;
};

export const GET = handler;
export const POST = handler;
