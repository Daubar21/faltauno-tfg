-- El display_name ya no se inicializa desde el email en el registro.
-- Se establece en el paso obligatorio de configuración de perfil (ProfileSetupPage),
-- donde se iguala al username elegido por el usuario.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (NEW.id, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
