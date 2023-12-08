"use server";

const recover = async ({ email }: { email: string }) => {
  const res = await fetch(`${process.env.API_URL}/users/recover`, {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return null;
  }

  const user = await res.json();

  return user;
};

export { recover };
