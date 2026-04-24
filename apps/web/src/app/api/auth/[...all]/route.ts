import type { NextRequest } from "next/server";

import { getAuth } from "@/lib/auth";

const handler = (request: NextRequest) => getAuth().handler(request);

export const GET = handler;
export const POST = handler;
