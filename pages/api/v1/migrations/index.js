import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function teste(request, response) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });
  response.status(200).json(migrations);
}
