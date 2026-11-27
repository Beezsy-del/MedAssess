import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";
const env = parseEnv(
  readFileSync(
    process.env.LOCAL_SUPABASE_ENV ?? "/tmp/medcipher-local-supabase.env",
    "utf8",
  ),
);
const database = new URL(env.DB_URL);
if (!["localhost", "127.0.0.1"].includes(database.hostname))
  throw new Error("SQL fixtures are local-only");
const sql =
  "BEGIN;\n" +
  ["tests/sql/patient-portal.sql", "tests/sql/staff-workflows.sql"]
    .map((path) => readFileSync(path, "utf8"))
    .join("\n") +
  "\nROLLBACK;";
const result = spawnSync(
  process.env.PSQL_BIN ?? "psql",
  ["-X", "-v", "ON_ERROR_STOP=1"],
  {
    input: sql,
    encoding: "utf8",
    env: {
      ...process.env,
      PGHOST: database.hostname,
      PGPORT: database.port,
      PGUSER: decodeURIComponent(database.username),
      PGPASSWORD: decodeURIComponent(database.password),
      PGDATABASE: database.pathname.slice(1),
    },
  },
);
if (result.error || result.status !== 0) {
  console.error("Local rollback-only SQL fixture verification failed.");
  console.error(result.error?.message ?? result.stderr);
  process.exit(1);
}
console.log(
  "PASS: rollback-only SQL fixtures verified patient access, role/tenant isolation, OPD/referral lifecycle, emergency acknowledgement, scheduled review and resource retry safety.",
);
