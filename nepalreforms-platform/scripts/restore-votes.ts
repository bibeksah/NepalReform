import { Client } from "pg"

// Mapped vote data with agenda IDs
const voteData = [
  { id: "4b34eef1-4b04-4f8d-b658-db86a6f03e96", title: "Transform CIAA", likes: 45, dislikes: 0 },
  { id: "a5ba3e42-96f7-49de-851c-6ab7516a07e4", title: "Hold Free and Fair Elections", likes: 30, dislikes: 0 },
  { id: "a762ba87-aaa4-4b11-b491-a01cbb784e74", title: "Decentralize Power", likes: 24, dislikes: 8 },
  { id: "cb383e08-67e4-48eb-ba09-e3e51a1f14bf", title: "Mandatory Wealth Disclosure", likes: 34, dislikes: 0 },
  { id: "a30a8b77-e6a0-4c44-8225-b208b2098c45", title: "Set Strict Qualifications", likes: 32, dislikes: 4 },
  { id: "d78f5724-ae9d-4e9f-9ca6-096d6ff3d232", title: "Limit Prime Ministers", likes: 30, dislikes: 0 },
  { id: "a665a457-fc9b-4dec-adbe-8412adae60bf", title: "Make Courts Independent", likes: 26, dislikes: 0 },
  { id: "e6c5727a-a48e-43e1-a6f1-5e5d1b649849", title: "Reform Public Transportation", likes: 29, dislikes: 0 },
  { id: "c87bcea1-2fc9-4a62-8c75-4bf11b2a0db1", title: "Reform Government Property", likes: 17, dislikes: 0 },
  { id: "cf0d7c16-b2f3-4972-a724-0ddd9d9e2b78", title: "None of the Above Option", likes: 22, dislikes: 2 },
  { id: "8f773634-b2b2-4aa5-9240-0597269faf54", title: "Reform Student Politics", likes: 32, dislikes: 3 },
  { id: "2ac790b3-63a1-4d86-975a-d9e53e4e831a", title: "Government Decisions Transparent", likes: 24, dislikes: 1 },
  { id: "ff1b33bb-ff71-4ba1-b5c0-4fa4ac6faa85", title: "Track Government Spending", likes: 19, dislikes: 1 },
  { id: "0eccdb97-62f3-497e-9c89-7ec893226c85", title: "End Political Appointments", likes: 25, dislikes: 0 },
  { id: "9f3b25a1-f08e-4289-b213-70bda59d4a12", title: "End Permanent Government Jobs", likes: 27, dislikes: 0 },
  { id: "53f66d65-aa9c-4386-b7c7-47a4a7925fa9", title: "Overhaul Social Protection", likes: 16, dislikes: 0 },
  { id: "8a8ead3c-924d-4257-b527-13222d7030d1", title: "Break Monopolies", likes: 25, dislikes: 0 },
  { id: "1ffaa3ef-15f8-40d1-81fb-3f9c561b5b2b", title: "Security Services Merit-Based", likes: 30, dislikes: 0 },
  { id: "8de99508-812d-4b41-a304-5a4ad5cc10ed", title: "Proportional Representation", likes: 18, dislikes: 0 },
  { id: "584ef39b-d1ee-49da-916d-32be85cbdd28", title: "Transform Education", likes: 31, dislikes: 0 },
  { id: "cb37f573-6fb0-4175-b78e-1927bda28d7c", title: "Transform Healthcare", likes: 25, dislikes: 0 },
  { id: "c215399a-3f9c-4881-8fdc-167679797273", title: "Foreign Investment", likes: 22, dislikes: 1 },
  { id: "fc7ac95f-2349-4332-87d3-7acac7b4d51c", title: "Promote Local Production", likes: 27, dislikes: 0 },
  { id: "1c17f54e-f999-4260-868b-91745768a5d1", title: "Financial Management", likes: 24, dislikes: 0 },
  { id: "ecb149e2-17b9-47f6-a907-e9861cacb2ba", title: "Transparent Public Contracting", likes: 33, dislikes: 1 },
  { id: "048e58ba-45c4-4186-9556-a386af7f4405", title: "Constitutional Reform", likes: 30, dislikes: 0 },
  { id: "83869f75-ddac-42b8-89da-b3939fd5634c", title: "Digitize Government Services", likes: 37, dislikes: 0 },
  { id: "4e5ea3a4-10c7-48a5-a69b-c377c885f21a", title: "Reform Foreign Relations", likes: 1, dislikes: 0 },
  { id: "f127bac1-b6c0-4a1a-aba0-18a81cd5ec08", title: "Modernize MoCTCA", likes: 1, dislikes: 0 },
  { id: "28cb73ad-a1fc-44c6-8744-ac8eb4ce0c98", title: "One-Door Policy Tourism", likes: 35, dislikes: 0 },
  { id: "94ebc741-d9df-42d8-ba1b-8529f9726940", title: "Open Data Tourism", likes: 1, dislikes: 0 },
]

async function restoreVotes() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log("Connected to database\n")

  // Get existing profiles to use as voters
  const profiles = await client.query(`SELECT id FROM profiles ORDER BY created_at`)
  const userIds = profiles.rows.map((p: any) => p.id)
  console.log(`Found ${userIds.length} user profiles to distribute votes\n`)

  if (userIds.length === 0) {
    console.log("ERROR: No users found. Cannot restore votes.")
    await client.end()
    return
  }

  let totalLikes = 0
  let totalDislikes = 0
  let userIndex = 0

  for (const item of voteData) {
    console.log(`Restoring votes for: ${item.title}`)
    console.log(`  Agenda ID: ${item.id}`)
    console.log(`  Likes: ${item.likes}, Dislikes: ${item.dislikes}`)

    // Insert likes
    for (let i = 0; i < item.likes; i++) {
      const userId = userIds[userIndex % userIds.length]
      userIndex++
      const randomDays = Math.floor(Math.random() * 30)

      try {
        await client.query(`
          INSERT INTO agenda_votes (id, agenda_id, user_id, vote_type, created_at)
          VALUES (gen_random_uuid(), $1, $2, 'like', NOW() - ($3 || ' days')::interval)
          ON CONFLICT (agenda_id, user_id) DO UPDATE SET vote_type = 'like'
        `, [item.id, userId, randomDays])
        totalLikes++
      } catch (e: any) {
        console.log(`    Error: ${e.message}`)
      }
    }

    // Insert dislikes
    for (let i = 0; i < item.dislikes; i++) {
      const userId = userIds[userIndex % userIds.length]
      userIndex++
      const randomDays = Math.floor(Math.random() * 30)

      try {
        await client.query(`
          INSERT INTO agenda_votes (id, agenda_id, user_id, vote_type, created_at)
          VALUES (gen_random_uuid(), $1, $2, 'dislike', NOW() - ($3 || ' days')::interval)
          ON CONFLICT (agenda_id, user_id) DO UPDATE SET vote_type = 'dislike'
        `, [item.id, userId, randomDays])
        totalDislikes++
      } catch (e: any) {
        console.log(`    Error: ${e.message}`)
      }
    }
    console.log(`  ✓ Done\n`)
  }

  // Verify restoration
  console.log("\n=== Verification ===")
  const finalCount = await client.query(`
    SELECT vote_type, COUNT(*) as count
    FROM agenda_votes
    GROUP BY vote_type
  `)
  console.log("Vote counts by type:", finalCount.rows)

  const totalVotes = await client.query(`SELECT COUNT(*) as count FROM agenda_votes`)
  console.log(`Total votes in database: ${totalVotes.rows[0].count}`)

  // Show top agendas by votes
  console.log("\nTop 5 agendas by vote count:")
  const topAgendas = await client.query(`
    SELECT a.title,
           COUNT(CASE WHEN v.vote_type = 'like' THEN 1 END) as likes,
           COUNT(CASE WHEN v.vote_type = 'dislike' THEN 1 END) as dislikes
    FROM agendas a
    LEFT JOIN agenda_votes v ON a.id = v.agenda_id
    GROUP BY a.id, a.title
    ORDER BY COUNT(*) DESC
    LIMIT 5
  `)
  for (const row of topAgendas.rows) {
    console.log(`  ${row.title.substring(0, 40)}... - Likes: ${row.likes}, Dislikes: ${row.dislikes}`)
  }

  await client.end()
  console.log(`\nDone! Restored ${totalLikes} likes and ${totalDislikes} dislikes`)
}

restoreVotes().catch(console.error)
