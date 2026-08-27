import { Client } from "pg"

async function checkProfiles() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  // Check profiles with display names
  console.log("\n=== PROFILES WITH DISPLAY NAMES ===")
  const profiles = await client.query(`
    SELECT id, display_name, role, created_at 
    FROM profiles 
    ORDER BY created_at DESC 
    LIMIT 20
  `)
  console.log(profiles.rows)

  // Check profiles without display names
  console.log("\n=== PROFILES WITHOUT DISPLAY NAMES ===")
  const noDisplayName = await client.query(`
    SELECT COUNT(*) as count FROM profiles WHERE display_name IS NULL OR display_name = ''
  `)
  console.log("Profiles without display_name:", noDisplayName.rows[0].count)

  // Check total profiles
  const totalProfiles = await client.query(`SELECT COUNT(*) as count FROM profiles`)
  console.log("Total profiles:", totalProfiles.rows[0].count)

  // Check agendas with vote counts
  console.log("\n=== AGENDAS ===")
  const agendas = await client.query(`
    SELECT id, title, created_at 
    FROM agendas 
    ORDER BY created_at DESC 
    LIMIT 5
  `)
  console.log(agendas.rows)

  // Check if there are any votes at all
  console.log("\n=== VOTE TABLES CHECK ===")
  const agendaVotes = await client.query(`SELECT COUNT(*) as count FROM agenda_votes`)
  const suggestionVotes = await client.query(`SELECT COUNT(*) as count FROM suggestion_votes`)
  console.log("agenda_votes count:", agendaVotes.rows[0].count)
  console.log("suggestion_votes count:", suggestionVotes.rows[0].count)

  await client.end()
}

checkProfiles().catch(console.error)
