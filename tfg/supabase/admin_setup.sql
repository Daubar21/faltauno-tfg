-- ============================================================
-- FaltaUno — Admin setup
-- Ejecutar una vez en Supabase SQL Editor
-- ============================================================

-- 1. Añadir columna role a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 2. Añadir columna max_days a user_preferences
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS max_days INTEGER NOT NULL DEFAULT 30
  CHECK (max_days >= 0);

-- 3. Dar permisos de admin a un usuario concreto:
--    Sustituye <UUID> por el id del usuario en auth.users
--    (se puede consultar en Supabase > Authentication > Users)
-- UPDATE profiles SET role = 'admin' WHERE id = '<UUID>';

--    O bien, dar admin por email (más cómodo):
-- UPDATE profiles
--   SET role = 'admin'
--   WHERE id = (
--     SELECT id FROM auth.users WHERE email = 'admin@ejemplo.com'
--   );


-- ============================================================
-- POLÍTICAS RLS ADICIONALES PARA ADMIN
-- ============================================================

-- Events: el admin puede crear, editar y eliminar cualquier evento
CREATE POLICY IF NOT EXISTS "Admin gestiona cualquier evento"
  ON events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles: el admin puede ver y editar cualquier perfil
CREATE POLICY IF NOT EXISTS "Admin edita cualquier perfil"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Event_participants: el admin puede leer todos los participantes
CREATE POLICY IF NOT EXISTS "Admin lee todos los participantes"
  ON event_participants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
