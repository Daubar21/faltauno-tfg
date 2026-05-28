-- Migration 005: Seed participant counts for demo/testing
-- Covers ALL open/full events that still have 0 participants.
-- Safe to re-run: the WHERE current_participants = 0 filter ensures
-- already-updated events are never touched.
--
-- Pattern (modulo 5, evaluated in CASE order):
--   rn = 3           → total_places - 1  (demo: exactly 1 spot left)
--   rn % 5 = 1       → ~35 %
--   rn % 5 = 2       → ~60 %
--   rn % 5 = 3       → ~45 %
--   rn % 5 = 4       → ~75 %
--   rn % 5 = 0       → ~25 %

WITH ordered AS (
  SELECT id, total_places,
         ROW_NUMBER() OVER (ORDER BY event_date ASC, id ASC) AS rn
  FROM events
  WHERE status IN ('open', 'full')
    AND current_participants = 0
)
UPDATE events e
SET current_participants = CASE
    WHEN o.rn = 3     THEN o.total_places - 1
    WHEN o.rn % 5 = 1 THEN GREATEST(1, FLOOR(o.total_places * 0.35)::int)
    WHEN o.rn % 5 = 2 THEN GREATEST(1, FLOOR(o.total_places * 0.60)::int)
    WHEN o.rn % 5 = 3 THEN GREATEST(1, FLOOR(o.total_places * 0.45)::int)
    WHEN o.rn % 5 = 4 THEN GREATEST(1, FLOOR(o.total_places * 0.75)::int)
    WHEN o.rn % 5 = 0 THEN GREATEST(1, FLOOR(o.total_places * 0.25)::int)
    ELSE                   GREATEST(1, FLOOR(o.total_places * 0.50)::int)
  END
FROM ordered o
WHERE e.id = o.id;
