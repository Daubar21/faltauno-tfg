-- Función para obtener el email de un usuario a partir de su username.
-- Se usa para permitir iniciar sesión con nombre de usuario en lugar de email.
-- SECURITY DEFINER permite acceder a auth.users desde el cliente anon.
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT au.email
  FROM auth.users au
  JOIN profiles p ON p.id = au.id
  WHERE lower(p.username) = lower(p_username)
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
