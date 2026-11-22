import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
const local = parseEnv(readFileSync(".env.local-test", "utf8"));
if (
  !local.NEXT_PUBLIC_SUPABASE_URL ||
  !["localhost", "127.0.0.1"].includes(
    new URL(local.NEXT_PUBLIC_SUPABASE_URL).hostname,
  )
)
  throw new Error("Local runner requires loopback Supabase");
const [program, ...args] = process.argv.slice(2);
if (!program) throw new Error("Pass a Node script and its arguments");
const child = spawn(process.execPath, [program, ...args], {
  stdio: "inherit",
  env: { ...process.env, ...local },
});
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
