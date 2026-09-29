import type { NextRequest } from "next/server";

import { getAuth } from "@/lib/auth";

// public-route: Better Auth's own endpoints (sign-in, sign-up, session, callbacks), each authenticated by Better Auth itself
const handler = (request: NextRequest) => getAuth().handler(request);

export const GET = handler;
export const POST = handler;
