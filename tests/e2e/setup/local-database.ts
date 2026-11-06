const assertLocalDatabaseUrl = (value: string): void => {
  const url = URL.parse(value);

  if (
    url === null ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.searchParams.has("host")
  ) {
    throw new Error(
      `Refusing to run the e2e suite against DATABASE_URL host ${url === null || url.hostname === "" ? "<invalid>" : url.hostname}.`,
    );
  }
};

const globalSetup = () => {
  assertLocalDatabaseUrl(process.env.DATABASE_URL ?? "");
};

export { assertLocalDatabaseUrl };

export default globalSetup;
