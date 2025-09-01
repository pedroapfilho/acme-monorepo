#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Better Auth Implementation...\n");

const checks = [
  {
    name: "✅ Auth Server Package",
    file: "packages/auth/src/server.ts",
    pattern: /betterAuth|prismaAdapter/,
  },
  {
    name: "✅ Auth Client Package",
    file: "packages/auth/src/client.ts",
    pattern: /createAuthClient|usernameClient/,
  },
  {
    name: "✅ API Hono Integration",
    file: "apps/api/src/index.ts",
    pattern: /auth\.handler.*Hono/s,
  },
  {
    name: "✅ Web Auth Route",
    file: "apps/web/src/app/api/auth/[...all]/route.ts",
    pattern: /toNextJsHandler/,
  },
  {
    name: "✅ Middleware Configuration",
    file: "apps/web/src/middleware.ts",
    pattern: /runtime.*nodejs|auth\.api\.getSession/,
  },
  {
    name: "✅ Database Schema",
    file: "packages/db/prisma/schema.prisma",
    pattern: /model\s+(User|Session|Account)/,
  },
  {
    name: "✅ Enhanced Security (12-char passwords)",
    file: "packages/auth/src/server.ts",
    pattern: /minPasswordLength:\s*12/,
  },
  {
    name: "✅ Cookie Cache Configuration",
    file: "packages/auth/src/server.ts",
    pattern: /cookieCache.*enabled.*true/s,
  },
];

let allPassed = true;

checks.forEach((check) => {
  const filePath = path.join(__dirname, check.file);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const passed = check.pattern.test(content);
    console.log(`${passed ? "✅" : "❌"} ${check.name}`);
    console.log(`   File: ${check.file}`);
    if (!passed) {
      allPassed = false;
      console.log("   ⚠️  Pattern not found");
    }
  } catch (error) {
    console.log(`❌ ${check.name}`);
    console.log(`   File: ${check.file}`);
    console.log(`   Error: ${error.message}`);
    allPassed = false;
  }
  console.log("");
});

console.log("─".repeat(50));
if (allPassed) {
  console.log("✅ All checks passed! Better Auth is properly configured.");
} else {
  console.log("⚠️  Some checks failed. Please review the configuration.");
}
console.log("─".repeat(50));

// Check environment variables
console.log("\n📋 Environment Variables Check:\n");
const envFiles = [
  { name: "Web App", file: "apps/web/.env.local" },
  { name: "API", file: "apps/api/.env" },
];

envFiles.forEach((env) => {
  const envPath = path.join(__dirname, env.file);
  try {
    const content = fs.readFileSync(envPath, "utf8");
    const hasSecret = content.includes("BETTER_AUTH_SECRET");
    const hasUrl = content.includes("BETTER_AUTH_URL");
    const hasDb = content.includes("DATABASE_URL");

    console.log(`${env.name}:`);
    console.log(`  ${hasSecret ? "✅" : "❌"} BETTER_AUTH_SECRET`);
    console.log(`  ${hasUrl ? "✅" : "❌"} BETTER_AUTH_URL`);
    console.log(`  ${hasDb ? "✅" : "❌"} DATABASE_URL`);
    console.log("");
  } catch (error) {
    console.log(`${env.name}: ⚠️  File not found (${env.file})`);
  }
});

console.log("🎉 Verification complete!");
