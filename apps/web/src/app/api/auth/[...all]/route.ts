import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const handler = (request: NextRequest) => auth.handler(request);

export const GET = handler;
export const POST = handler;
