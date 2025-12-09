import { Migration } from "./migration.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrations = new Migration();

// Auto-discover and register all migration files
async function autoRegisterMigrations() {
  try {
    const files = await fs.readdir(__dirname);

    for (const file of files) {
      // Skip non-js files, migration.js itself, and index.js
      if (
        !file.endsWith(".js") ||
        file === "migration.js" ||
        file === "index.js"
      ) {
        continue;
      }

      try {
        const migrationModule = await import(`./${file}`);
        const defaultExport = migrationModule.default;

        if (typeof defaultExport === "function") {
          // Create migration name from filename (e.g., userMigration.js → user-migration)
          const name = file
            .replace(".js", "")
            .replace(/([A-Z])/g, "-$1")
            .toLowerCase()
            .replace(/^-/, "");

          migrations.addMigration(name, defaultExport);
          console.log(`✅ Registered migration: ${name}`);
        }
      } catch (error) {
        console.warn(
          `⚠️ Could not load migration from ${file}:`,
          error.message
        );
      }
    }

    // Get migration name from command-line arguments
    const migrationName = process.argv[2];

    if (!migrationName) {
      console.error("\n❌ Migration name not provided");
      console.error("Usage: node index.js <migration-name>");
      const availableMigrations = Object.keys(migrations.workerMap);
      console.error(`Available migrations: ${availableMigrations.join(", ")}`);
      process.exit(1);
    }

    console.log(`\n🔄 Running migration: ${migrationName}\n`);
    migrations.run(migrationName);
    console.log(`\n✅ Migration '${migrationName}' completed successfully\n`);
  } catch (error) {
    console.error("❌ Error during migration setup:", error.message);
    process.exit(1);
  }
}

// Run the auto-discovery and migration
autoRegisterMigrations().catch((error) => {
  console.error("❌ Fatal error:", error.message);
  process.exit(1);
});
