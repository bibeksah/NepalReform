import { Client } from "pg"

async function getAgendaIds() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  const agendas = await client.query(`
    SELECT id, title 
    FROM agendas 
    ORDER BY title
  `)

  console.log("=== All Agendas with IDs ===\n")
  for (const agenda of agendas.rows) {
    console.log(`ID: ${agenda.id}`)
    console.log(`Title: ${agenda.title}`)
    console.log("---")
  }

  await client.end()
}

getAgendaIds().catch(console.error)
