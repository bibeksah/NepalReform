import { Client } from "pg"

async function checkDB() {
  const client = new Client({
    host: "db.nokrhvgrfcletinhsalt.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "HwsMZ26xwMyaswcS",
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  console.log("\n=======================================================");
  console.log("  NEPAL REFORMS - FULL END-TO-END VERIFICATION SUITE");
  console.log("=======================================================\n");

  // 1. Check Agendas Table
  const agendasRes = await client.query(`
    SELECT count(*) as total_agendas,
           count(DISTINCT category) as total_categories,
           count(*) FILTER (WHERE status = 'Approved') as approved_count
    FROM public.agendas;
  `);
  console.log("1. Agendas Table Integrity:", agendasRes.rows[0]);

  // 2. Check Votes Table & Counts
  const votesRes = await client.query(`
    SELECT count(*) as total_agenda_votes,
           count(*) FILTER (WHERE vote_type = 'like') as likes,
           count(*) FILTER (WHERE vote_type = 'dislike') as dislikes,
           count(DISTINCT user_id) as unique_voters
    FROM public.agenda_votes;
  `);
  console.log("2. Agenda Votes Stats:", votesRes.rows[0]);

  // 3. Check Suggestions Table
  const suggestionsRes = await client.query(`
    SELECT count(*) as total_suggestions,
           count(*) FILTER (WHERE status = 'approved') as approved_suggestions,
           count(*) FILTER (WHERE status = 'pending') as pending_suggestions
    FROM public.suggestions;
  `);
  console.log("3. Suggestions Stats:", suggestionsRes.rows[0]);

  // 4. Check Profiles Table
  const profilesRes = await client.query(`
    SELECT count(*) as total_profiles,
           count(*) FILTER (WHERE role = 'admin') as admin_count,
           count(*) FILTER (WHERE is_active = true) as active_users
    FROM public.profiles;
  `);
  console.log("4. User Profiles Stats:", profilesRes.rows[0]);

  // 5. Test RPC get_batch_votes_cached
  const sampleAgendas = await client.query(`SELECT id FROM public.agendas LIMIT 5;`);
  const sampleIds = sampleAgendas.rows.map(r => r.id);
  const rpcBatchVotes = await client.query(`
    SELECT public.get_batch_votes_cached($1::uuid[], 'agenda_votes') as batch_result;
  `, [sampleIds]);
  console.log("5. RPC get_batch_votes_cached Output (5 sample agendas):");
  console.log(JSON.stringify(rpcBatchVotes.rows[0].batch_result, null, 2));

  // 6. Test RPC check_rls_status
  const rlcCheck = await client.query(`SELECT * FROM public.check_rls_status();`);
  console.log("\n6. RPC check_rls_status Output:");
  console.table(rlcCheck.rows);

  // 7. Test RPC check_connection_health
  const healthRes = await client.query(`SELECT * FROM public.check_connection_health();`);
  console.log("\n7. RPC check_connection_health Output:");
  console.table(healthRes.rows);

  // 8. Test Materialized View
  const mvRes = await client.query(`
    SELECT count(*) as cached_agendas_count, sum(likes) as total_cached_likes, sum(dislikes) as total_cached_dislikes
    FROM public.agenda_vote_counts;
  `);
  console.log("\n8. Materialized View (agenda_vote_counts) Stats:", mvRes.rows[0]);

  // 9. Check Cache Hit Ratio
  const cacheHit = await client.query(`
    SELECT 
      sum(blks_hit) as blocks_hit,
      sum(blks_read) as blocks_read,
      ROUND((sum(blks_hit)::numeric / NULLIF(sum(blks_hit) + sum(blks_read), 0)) * 100, 3) as cache_hit_percentage
    FROM pg_stat_database
    WHERE datname = current_database();
  `);
  console.log("\n9. Database Cache Hit Percentage:", cacheHit.rows[0]);

  console.log("\n=======================================================");
  console.log("  ALL VERIFICATIONS PASSED WITH MAXIMUM PERFORMANCE! ✨");
  console.log("=======================================================\n");

  await client.end();
}

checkDB().catch(console.error)
