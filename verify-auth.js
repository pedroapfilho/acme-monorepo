#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

console.log("Verifying Better Auth Implementation...\n");

const checks = [
  {
    file: "packages/auth/src/server.ts",
    name: "Auth Server Package",
    pattern: /betterAuth|prismaAdapter/,
  },
  {
    file: "packages/auth/src/client.ts",
    name: "Auth Client Package",
    pattern: /createAuthClient|usernameClient/,
  },
  {
    file: "apps/api/src/lib/auth.ts",
    name: "API Shared Auth Instance",
    pattern: /createAuth/,
  },
  {
    file: "apps/api/src/index.ts",
    name: "API Hono Integration",
    pattern: /auth\.handler/,
  },
  {
    file: "apps/web/next.config.ts",
    name: "Web Proxy Rewrite",
    pattern: /rewrites|\/api\/auth/,
  },
  {
    file: "apps/web/src/middleware.ts",
    name: "Middleware Configuration",
    pattern: /runtime.*nodejs|auth\.api\.getSession/,
  },
  {
    file: "packages/db/prisma/schema.prisma",
    name: "Database Schema (PostgreSQL)",
    pattern: /provider\s*=\s*"postgresql"/,
  },
  {
    file: "packages/auth/src/server.ts",
    name: "Enhanced Security (12-char passwords)",
    pattern: /minPasswordLength:\s*12/,
  },
  {
    file: "packages/auth/src/server.ts",
    name: "Cookie Cache Configuration",
    pattern: /cookieCache.*enabled.*true/s,
  },
];

let allPassed = true;

checks.forEach((check) => {
  const filePath = path.join(__dirname, check.file);
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
    console.log(`   Error: ${error.message}`);
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

// Check environment variables
console.log("\nEnvironment Variables Check:\n");
const envFiles = [
  { file: "apps/web/.env.local", name: "Web App" },
  { file: "apps/api/.env", name: "API" },
];

envFiles.forEach((env) => {
  const envPath = path.join(__dirname, env.file);
  try {
    const content = fs.readFileSync(envPath, "utf8");
    const hasSecret = content.includes("BETTER_AUTH_SECRET");
    const hasUrl = content.includes("BETTER_AUTH_URL");
    const hasDb = content.includes("DATABASE_URL");

    console.log(`${env.name}:`);
    console.log(`  ${hasSecret ? "PASS" : "FAIL"} BETTER_AUTH_SECRET`);
    console.log(`  ${hasUrl ? "PASS" : "FAIL"} BETTER_AUTH_URL`);
    console.log(`  ${hasDb ? "PASS" : "FAIL"} DATABASE_URL`);
    console.log("");
  } catch {
    console.log(`${env.name}: File not found (${env.file})`);
  }
});

console.log("Verification complete!");
