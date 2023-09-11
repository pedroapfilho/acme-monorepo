import { NextResponse } from "next/server";
import * as z from "zod";

const bodySchema = z.object({
  name: z.string().min(3).max(32),
  phone: z.string().min(5).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

const POST = async (request: Request) => {
  const body = await request.json();

  const parsedBody = bodySchema.parse(body);

  const res = await fetch(`${process.env.API_URL}/users/register`, {
    method: "POST",
    body: JSON.stringify(parsedBody),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return NextResponse.error();
  }
};

export { POST };
