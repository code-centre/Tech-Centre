-- Perfil automático al crear usuario en auth y política RLS para insert propio.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  full_name text := COALESCE(meta->>'full_name', meta->>'name', '');
  name_parts text[];
  first_name text;
  last_name text;
BEGIN
  IF full_name <> '' THEN
    name_parts := regexp_split_to_array(trim(full_name), '\s+');
    first_name := COALESCE(meta->>'first_name', meta->>'given_name', name_parts[1], 'Usuario');
    last_name := COALESCE(
      meta->>'last_name',
      meta->>'family_name',
      NULLIF(array_to_string(name_parts[2:array_length(name_parts, 1)], ' '), ''),
      ''
    );
  ELSE
    first_name := COALESCE(meta->>'first_name', meta->>'given_name', 'Usuario');
    last_name := COALESCE(meta->>'last_name', meta->>'family_name', '');
  END IF;

  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    phone,
    id_type,
    id_number,
    birthdate,
    address,
    role,
    profile_image,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    first_name,
    last_name,
    '',
    'CC',
    '',
    '1990-01-01',
    NULL,
    'lead',
    COALESCE(meta->>'picture', meta->>'avatar_url'),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
