-- Sincroniza display_name con username para los usuarios que tienen username
-- pero cuyo display_name aún es el prefijo del email (creados antes del setup obligatorio).
UPDATE profiles
SET display_name = username
WHERE username IS NOT NULL
  AND username <> ''
  AND (display_name IS NULL OR display_name <> username);
