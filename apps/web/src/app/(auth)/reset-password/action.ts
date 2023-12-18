"use server";

import { signOut } from "next-auth/react";

const resetPassword = async ({
  email,
  token,
  password,
}: {
  email: string;
  token: string;
  password: string;
}) => {
  const res = await fetch(`${process.env.API_URL}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify({ email, token, password }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return false;
  }

  return true;
};

export { resetPassword };
