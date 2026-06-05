-- El trigger en auth.users necesita search_path explícito para encontrar
-- la tabla public.profiles. Sin esto, falla con "relation does not exist".
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := NEW.raw_user_meta_data->>'username';

  IF v_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE username = v_username
  ) THEN
    v_username := NULL;
  END IF;

  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    v_username
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
