-- ============================================================
-- FaltaUno — Crear usuario administrador
--
-- CÓMO EJECUTAR:
--   1. Abre Supabase > SQL Editor
--   2. Pega este script completo y pulsa "Run"
--   3. Credenciales del admin creado:
--        Email:      admin@faltauno.com
--        Contraseña: Admin1234!
--
-- NOTAS:
--   · Este script es idempotente: se puede ejecutar varias veces.
--   · El usuario se crea con email_confirmed_at ya establecido,
--     por lo que NO necesita verificar el correo.
--   · Incluye todas las migraciones de admin_setup.sql por si
--     no se han ejecutado aún.
-- ============================================================


-- ============================================================
-- 1. MIGRACIONES (admin_setup.sql — idempotentes)
-- ============================================================

-- Columna role en profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Columna max_days en user_preferences
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS max_days INTEGER NOT NULL DEFAULT 30
  CHECK (max_days >= 0);

-- Política RLS: admin gestiona cualquier evento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'events'
      AND policyname = 'Admin gestiona cualquier evento'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin gestiona cualquier evento"
        ON events FOR ALL
        USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
        WITH CHECK (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    $policy$;
  END IF;
END $$;

-- Política RLS: admin edita cualquier perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Admin edita cualquier perfil'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin edita cualquier perfil"
        ON profiles FOR UPDATE
        USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    $policy$;
  END IF;
END $$;

-- Política RLS: admin lee todos los participantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'event_participants'
      AND policyname = 'Admin lee todos los participantes'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin lee todos los participantes"
        ON event_participants FOR SELECT
        USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    $policy$;
  END IF;
END $$;


-- ============================================================
-- 2. CREAR USUARIO ADMIN EN auth.users
--    email_confirmed_at = NOW() → sin verificación de correo
-- ============================================================

DO $$
DECLARE
  v_admin_email    TEXT    := 'admin@faltauno.com';
  v_admin_password TEXT    := 'Admin1234!';
  v_admin_name     TEXT    := 'Administrador FaltaUno';
  v_user_id        UUID;
BEGIN

  -- ── 2a. Comprobar si el usuario ya existe ─────────────────
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_admin_email;

  -- ── 2b. Si no existe, crearlo ─────────────────────────────
  IF v_user_id IS NULL THEN

    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,       -- ← confirmado de inmediato (sin verificación)
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      is_sso_user
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_admin_email,
      crypt(v_admin_password, gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object('name', v_admin_name),
      FALSE,
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      FALSE
    );

    RAISE NOTICE 'Usuario admin creado con id: %', v_user_id;

  ELSE
    -- Si ya existe, actualizamos la contraseña y confirmamos el email
    UPDATE auth.users
    SET
      encrypted_password  = crypt(v_admin_password, gen_salt('bf')),
      email_confirmed_at  = COALESCE(email_confirmed_at, NOW()),
      updated_at          = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE 'Usuario admin ya existía (id: %), contraseña actualizada.', v_user_id;
  END IF;


  -- ── 2c. Crear identidad email en auth.identities ──────────
  --    Necesario para que signInWithPassword funcione correctamente
  IF NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = v_user_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      jsonb_build_object(
        'sub',   v_user_id::TEXT,
        'email', v_admin_email
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  ELSE
    UPDATE auth.identities
    SET
      identity_data = jsonb_build_object(
        'sub',   v_user_id::TEXT,
        'email', v_admin_email
      ),
      updated_at = NOW()
    WHERE user_id = v_user_id AND provider = 'email';
  END IF;


  -- ── 2d. Asegurar que el perfil existe y tiene role = admin ─
  --    El trigger on_auth_user_created debería haberlo creado,
  --    pero usamos UPSERT por seguridad.
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (v_user_id, v_admin_name, 'admin')
  ON CONFLICT (id) DO UPDATE
    SET role         = 'admin',
        display_name = EXCLUDED.display_name;

  -- ── 2e. Asegurar que las preferencias existen ─────────────
  INSERT INTO public.user_preferences (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;


  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Admin listo.';
  RAISE NOTICE '  Email:      %', v_admin_email;
  RAISE NOTICE '  Contraseña: %', v_admin_password;
  RAISE NOTICE '  User ID:    %', v_user_id;
  RAISE NOTICE '==============================================';

END $$;


-- ============================================================
-- 3. VERIFICACIÓN
--    Tras ejecutar el script, esta consulta debe devolver
--    una fila con role = 'admin' y email_confirmed_at NOT NULL
-- ============================================================

SELECT
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL  AS email_confirmed,
  p.display_name,
  p.role
FROM auth.users  u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@faltauno.com';
