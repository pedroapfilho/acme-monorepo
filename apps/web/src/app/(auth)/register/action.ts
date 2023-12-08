"use server";

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
  const res = await fetch(`${process.env.API_URL}/users/register`, {
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
    return null;
  }

  const user = await res.json();

  return user;
};

export { register };
