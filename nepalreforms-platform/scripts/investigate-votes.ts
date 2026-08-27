import { Client } from "pg"

async function investigateVotes() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  // Check if there are any votes at all
  console.log("\n=== VOTE COUNTS ===")
  const agendaVotes = await client.query(`SELECT COUNT(*) as count FROM agenda_votes`)
  const suggestionVotes = await client.query(`SELECT COUNT(*) as count FROM suggestion_votes`)
  console.log("agenda_votes:", agendaVotes.rows[0].count)
  console.log("suggestion_votes:", suggestionVotes.rows[0].count)

  // Check agenda creation dates
  console.log("\n=== AGENDA CREATION DATES ===")
  const agendaDates = await client.query(`
    SELECT id, title, created_at 
    FROM agendas 
    ORDER BY created_at ASC 
    LIMIT 5
  `)
  console.log("Earliest agendas:", agendaDates.rows)

  const latestAgendas = await client.query(`
    SELECT id, title, created_at 
    FROM agendas 
    ORDER BY created_at DESC 
    LIMIT 5
  `)
  console.log("\nLatest agendas:", latestAgendas.rows)

  // Check if there are foreign key constraints
  console.log("\n=== FOREIGN KEY CONSTRAINTS ===")
  const fkConstraints = await client.query(`
    SELECT
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('agenda_votes', 'suggestion_votes')
  `)
  console.log(fkConstraints.rows)

  // Check distinct agenda_id in agendas table
  console.log("\n=== TOTAL AGENDAS ===")
  const totalAgendas = await client.query(`SELECT COUNT(*) FROM agendas`)
  console.log("Total agendas:", totalAgendas.rows[0].count)

  await client.end()
}

investigateVotes().catch(console.error)
