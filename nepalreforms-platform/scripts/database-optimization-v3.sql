-- Database Optimization V3 for Nepal Reforms Platform
-- Fixes ILIKE sequential scans using pg_trgm trigram indexes and adds foreign key indexes

-- 1. Enable pg_trgm extension for fast ILIKE and substring search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create trigram GIN indexes on agendas for fast substring search
CREATE INDEX IF NOT EXISTS idx_agendas_title_trgm 
ON public.agendas USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_agendas_description_trgm 
ON public.agendas USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_agendas_problem_statement_trgm 
ON public.agendas USING gin (problem_statement gin_trgm_ops);

-- 3. Composite indexes for user-specific vote lookups
CREATE INDEX IF NOT EXISTS idx_agenda_votes_user_agenda 
ON public.agenda_votes (user_id, agenda_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_votes_user_suggestion 
ON public.suggestion_votes (user_id, suggestion_id);

-- 4. Ensure foreign key index for cascades
CREATE INDEX IF NOT EXISTS idx_suggestions_agenda_id 
ON public.suggestions (agenda_id);

CREATE INDEX IF NOT EXISTS idx_suggestions_user_id 
ON public.suggestions (user_id);

-- 5. Analyze tables to refresh planner statistics
ANALYZE public.agendas;
ANALYZE public.agenda_votes;
ANALYZE public.suggestions;
ANALYZE public.suggestion_votes;
ANALYZE public.profiles;
