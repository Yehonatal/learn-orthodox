import { Client } from "pg";
import fs from "fs";
import path from "path";

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  
  let connectionString = dbUrl;
  const isLocal = supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
  
  if (!connectionString && isLocal) {
    connectionString = "postgres://postgres:postgres@localhost:54322/postgres";
    console.log(`No DATABASE_URL found, but detected local Supabase. Attempting local connection via: ${connectionString}`);
  }
  
  if (!connectionString) {
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
    const ref = match ? match[1] : "<your-project-ref>";
    
    console.error("\n======================================================================");
    console.error("❌ MIGRATION ERROR: DATABASE_URL is not defined in your .env file.");
    console.error("======================================================================");
    console.error("To run programmatic migrations against your remote Supabase instance,");
    console.error("please define DATABASE_URL in your .env file.");
    console.error(`Example: DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.${ref}.supabase.co:6543/postgres`);
    console.error("\nAlternatively, you can manually paste the migration files into the");
    console.error(`Supabase SQL Editor at: https://supabase.com/dashboard/project/${ref}/sql/new`);
    console.error("======================================================================\n");
    process.exit(1);
  }
  
  console.log("Connecting to database for migrations...");
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected. Checking pre-existing tables...");
    
    // Check if the liturgies table already exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'liturgies'
      );
    `);
    const liturgiesExist = checkTable.rows[0].exists;

    // Initialize migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // If liturgies table already existed, mark the first two initial migrations as applied
    if (liturgiesExist) {
      await client.query(`
        INSERT INTO schema_migrations (version) 
        VALUES ('001_liturgy_schema.sql'), ('002_enable_vector.sql') 
        ON CONFLICT (version) DO NOTHING;
      `);
      console.log("Pre-existing tables detected. Initial migrations marked as applied.");
    }
    
    const migrationsDir = path.join(process.cwd(), "supabase/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.error("Migrations directory not found.");
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const res = await client.query("SELECT 1 FROM schema_migrations WHERE version = $1", [file]);
      if (res.rowCount && res.rowCount > 0) {
        console.log(`Migration ${file} is already applied. Skipping.`);
        continue;
      }

      console.log(`Applying migration ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

      // Run each migration in a single transaction
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Migration ${file} applied successfully.`);
      } catch (runErr) {
        await client.query("ROLLBACK");
        throw runErr;
      }
    }
    
    console.log("\nDatabase migrations completed successfully!");
  } catch (err) {
    const error = err as Error;
    console.error("\nMigration failed:", error.message || error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
