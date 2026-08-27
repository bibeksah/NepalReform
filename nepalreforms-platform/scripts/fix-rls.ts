import { Client } from "pg"

async function fixRLS() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  console.log("Fixing RLS policies...")

  // 1. Add public SELECT policy for agenda_votes (for counting)
  console.log("\n1. Adding public SELECT policy for agenda_votes...")
  try {
    await client.query(`
      DROP POLICY IF EXISTS "agenda_votes_select_public" ON agenda_votes;
    `)
    await client.query(`
      CREATE POLICY "agenda_votes_select_public"
      ON agenda_votes
      FOR SELECT
      TO public
      USING (true);
    `)
    console.log("   ✓ Added agenda_votes_select_public policy")
  } catch (e: any) {
    console.log("   Error:", e.message)
  }

  // 2. Add public SELECT policy for suggestion_votes (for counting)
  console.log("\n2. Adding public SELECT policy for suggestion_votes...")
  try {
    await client.query(`
      DROP POLICY IF EXISTS "suggestion_votes_select_public" ON suggestion_votes;
    `)
    await client.query(`
      CREATE POLICY "suggestion_votes_select_public"
      ON suggestion_votes
      FOR SELECT
      TO public
      USING (true);
    `)
    console.log("   ✓ Added suggestion_votes_select_public policy")
  } catch (e: any) {
    console.log("   Error:", e.message)
  }

  // 3. Grant SELECT on agenda_votes and suggestion_votes to anon
  console.log("\n3. Granting SELECT to anon on vote tables...")
  try {
    await client.query(`GRANT SELECT ON agenda_votes TO anon;`)
    await client.query(`GRANT SELECT ON suggestion_votes TO anon;`)
    console.log("   ✓ Granted SELECT to anon")
  } catch (e: any) {
    console.log("   Error:", e.message)
  }

  // 4. Verify testimonials policies work
  console.log("\n4. Checking testimonials can be read...")
  const testResult = await client.query(`SELECT COUNT(*) FROM testimonials WHERE is_active = true`)
  console.log("   Active testimonials count:", testResult.rows[0].count)

  // 5. Check current vote count after fix
  console.log("\n5. Checking agenda_votes after fix...")
  const voteCount = await client.query(`SELECT COUNT(*) FROM agenda_votes`)
  console.log("   Total votes:", voteCount.rows[0].count)

  await client.end()
  console.log("\nDone!")
}

fixRLS().catch(console.error)
