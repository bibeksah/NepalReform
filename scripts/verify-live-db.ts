import { Client } from "pg"
import fs from "fs"
import path from "path"

async function verifyAndMigrateLiveDB() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log("Connected to live Supabase Postgres database.")

  // 1. Check if device_identities table exists
  const deviceTableRes = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'device_identities'
    );
  `)
  const hasDeviceIdentities = deviceTableRes.rows[0].exists
  console.log(`device_identities table exists: ${hasDeviceIdentities}`)

  // 2. Check if device_id column exists on agenda_votes
  const agendaVotesColsRes = await client.query(`
    SELECT column_name, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'agenda_votes' AND column_name = 'device_id';
  `)
  const hasDeviceIdInVotes = agendaVotesColsRes.rows.length > 0
  console.log(`device_id column on agenda_votes exists: ${hasDeviceIdInVotes}`)

  if (!hasDeviceIdentities || !hasDeviceIdInVotes) {
    console.log("Applying 005_device_signature_verification.sql migration to live DB...")
    const migrationSql = fs.readFileSync(
      path.join(__dirname, "005_device_signature_verification.sql"),
      "utf-8"
    )
    await client.query(migrationSql)
    console.log("Migration 005 applied successfully!")
  } else {
    console.log("Database schema is already up to date with 005 migration.")
  }

  // Verify status of tables after migration
  const verifyRes = await client.query(`
    SELECT table_name, column_name, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name IN ('device_identities', 'agenda_votes', 'suggestion_votes', 'suggestions', 'agendas')
      AND column_name IN ('device_id', 'user_id', 'fingerprint_hash')
    ORDER BY table_name, column_name;
  `)
  console.log("\nVerified columns across civic tables:")
  console.table(verifyRes.rows)

  await client.end()
}

verifyAndMigrateLiveDB().catch(console.error)
