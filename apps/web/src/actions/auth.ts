"use server";

import { auth, signIn } from "@/auth";
import { userSchema } from "@/schemas/users";

const login = async (formData: FormData) => {
  return await signIn("credentials", formData);
};

const recover = async ({ email }: { email: string }) => {
  const res = await fetch(`${process.env.API_URL}/auth/recover`, {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_RECOVER");
  }

  return true;
};

const register = async ({
  name,
  phone,
  email,
  password,
}: {
  name: string;
  phone: string;
  email: string;
  password: string;
}) => {
  const res = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      name,
      phone,
      email,
      password,
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_REGISTER");
  }

  const user = await res.json();

  return user;
};

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
    throw new Error("FAILED_TO_RESET_PASSWORD");
  }

  return true;
};

const updateUser = async ({ name, phone }: { name: string; phone: string }) => {
  const session = await auth();

  if (!session) {
    throw new Error("NO_SESSION");
  }

  const res = await fetch(`${process.env.API_URL}/users/update`, {
    method: "PUT",
    body: JSON.stringify({ name, phone }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("USER_NOT_FOUND");
  }

  const data = await res.json();

  const user = userSchema.parse(data);

  return user;
};

const sendResetLink = async ({ email }: { email: string }) => {
  const session = await auth();

  if (!session) {
    throw new Error("NO_SESSION");
  }

  const res = await fetch(`${process.env.API_URL}/auth/reset-link`, {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("REQUEST_FAILED");
  }

  return true;
};

export { login, recover, register, resetPassword, updateUser, sendResetLink };
