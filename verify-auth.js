#!/usr/bin/env node
/* eslint-disable no-console -- ad-hoc CLI verification script; console output IS the UI */

import fs from "node:fs";
import path from "node:path";

const rootDir = import.meta.dirname;

console.log("Verifying Better Auth Implementation...\n");

const checks = [
  {
    file: "packages/auth/src/server.ts",
    name: "Auth Server Package",
    pattern: /betterAuth|prismaAdapter/v,
  },
  {
    file: "packages/auth/src/client.ts",
    name: "Auth Client Package",
    pattern: /createAuthClient|usernameClient/v,
  },
  {
    file: "apps/api/src/lib/auth.ts",
    name: "API Shared Auth Instance",
    pattern: /createAuth/v,
  },
  {
    file: "apps/api/src/index.ts",
    name: "API Hono Integration",
    pattern: /auth\.handler/v,
  },
  {
    file: "apps/web/next.config.ts",
    name: "Web Proxy Rewrite",
    pattern: /rewrites|\/api\/auth/v,
  },
  {
    file: "apps/web/src/middleware.ts",
    name: "Middleware Configuration",
    pattern: /runtime.*nodejs|auth\.api\.getSession/v,
  },
  {
    file: "packages/db/prisma/schema.prisma",
    name: "Database Schema (PostgreSQL)",
    pattern: /provider\s*=\s*"postgresql"/v,
  },
  {
    file: "packages/auth/src/server.ts",
    name: "Enhanced Security (12-char passwords)",
    pattern: /minPasswordLength:\s*12/v,
  },
  {
    file: "packages/auth/src/server.ts",
    name: "Cookie Cache Configuration",
    pattern: /cookieCache.*enabled.*true/sv,
  },
];

let allPassed = true;

checks.forEach((check) => {
  const filePath = path.join(rootDir, check.file);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const passed = check.pattern.test(content);
    console.log(`${passed ? "PASS" : "FAIL"} ${check.name}`);
    console.log(`   File: ${check.file}`);
    if (!passed) {
      allPassed = false;
      console.log("   Pattern not found");
    }
  } catch (error) {
    console.log(`FAIL ${check.name}`);
    console.log(`   File: ${check.file}`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    allPassed = false;
  }
  console.log("");
});

console.log("-".repeat(50));
if (allPassed) {
  console.log("All checks passed! Better Auth is properly configured.");
} else {
  console.log("Some checks failed. Please review the configuration.");
}
console.log("-".repeat(50));

console.log("\nEnvironment Variables Check:\n");
const envFiles = [
  { file: "apps/web/.env.local", name: "Web App" },
  { file: "apps/api/.env", name: "API" },
];

envFiles.forEach((env) => {
  const envPath = path.join(rootDir, env.file);
  try {
    const content = fs.readFileSync(envPath, "utf8");
    const hasSecret = content.includes("BETTER_AUTH_SECRET");
    const hasDb = content.includes("DATABASE_URL");

    console.log(`${env.name}:`);
    console.log(`  ${hasSecret ? "PASS" : "FAIL"} BETTER_AUTH_SECRET`);
    console.log(`  ${hasDb ? "PASS" : "FAIL"} DATABASE_URL`);
    console.log("");
  } catch {
    console.log(`${env.name}: File not found (${env.file})`);
  }
});

console.log("Verification complete!");

if (!allPassed) {
  process.exitCode = 1;
}
