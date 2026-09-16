import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const root = process.cwd();
const authored = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  {
    cwd: root,
    encoding: "utf8",
  },
)
  .split("\0")
  .filter(Boolean);
const manifests = authored.filter((file) => basename(file) === "shadcn.lock.json");
const failures = [];

if (manifests.length === 0) {
  failures.push("No shadcn.lock.json found.");
}

for (const manifest of manifests) {
  const directory = dirname(join(root, manifest));
  const lock = JSON.parse(readFileSync(join(root, manifest), "utf8"));
  if (lock.version !== 1 || !/^[a-f\d]{40}$/.test(lock.upstreamCommit)) {
    failures.push(`${manifest}: invalid version or upstream revision.`);
    continue;
  }
  const componentDirectory = relative(root, join(directory, lock.componentsDirectory));
  const lockedFiles = new Set(
    Object.keys(lock.files).map((file) => relative(root, join(directory, file))),
  );
  for (const file of authored) {
    if (
      file.startsWith(`${componentDirectory}/`) &&
      existsSync(join(root, file)) &&
      file.endsWith(".tsx") &&
      !/\.(?:test|spec)\.tsx$/.test(file) &&
      !lockedFiles.has(file)
    ) {
      failures.push(
        `${file}: unregistered primitive; keep product compositions outside the registry directory.`,
      );
    }
  }
  for (const [file, expected] of Object.entries(lock.files)) {
    const location = relative(root, join(directory, file));
    try {
      const actual = createHash("sha256")
        .update(readFileSync(join(directory, file)))
        .digest("hex");
      if (actual !== expected.sha256) {
        failures.push(
          `${location}: changed from the reviewed shadcn source. Review the upstream update and its normalization before refreshing the lock.`,
        );
      }
    } catch {
      failures.push(`${location}: locked file is missing.`);
    }
  }
  for (const contract of lock.stylesheets) {
    const css = readFileSync(join(directory, contract.file), "utf8").replaceAll(/\s+/g, "");
    for (const declaration of contract.required) {
      if (!css.includes(declaration.replaceAll(/\s+/g, ""))) {
        failures.push(
          `${manifest}: ${contract.file} is missing the upstream-equivalent CSS declaration ${declaration}.`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Verified ${manifests.length} shadcn component inventories.\n`);
}
