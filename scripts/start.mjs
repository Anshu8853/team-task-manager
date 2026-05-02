import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

function run(command, args, env) {
  const bin = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(bin, args, {
    stdio: "inherit",
    env,
    shell: false
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const env = { ...process.env };
const onRailway = Boolean(env.RAILWAY_PROJECT_ID || env.RAILWAY_ENVIRONMENT_ID || env.RAILWAY_SERVICE_ID);

// On Railway, force SQLite into the mounted persistent volume.
if (onRailway && (!env.DATABASE_URL || env.DATABASE_URL.startsWith("file:./"))) {
  env.DATABASE_URL = "file:/app/data/app.db";
}

if (env.DATABASE_URL?.startsWith("file:/app/data/")) {
  mkdirSync("/app/data", { recursive: true });
}

run("npm", ["run", "db:push"], env);
run("npm", ["run", "db:seed"], env);
run("npm", ["run", "start:server"], env);
