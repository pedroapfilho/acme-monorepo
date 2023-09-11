import { NextResponse } from "next/server";
import * as z from "zod";

const bodySchema = z.object({
  email: z.string().email(),
});

const POST = async (request: Request) => {
  const body = await request.json();

  const parsedBody = bodySchema.parse(body);

  const res = await fetch(`${process.env.API_URL}/users/recover`, {
    method: "POST",
    body: JSON.stringify(parsedBody),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return NextResponse.error();
  }
};

export { POST };
