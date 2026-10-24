-- À exécuter dans le SQL Editor Supabase (une fois)
ALTER TABLE public.member_profiles ADD COLUMN IF NOT EXISTS username text;
CREATE UNIQUE INDEX IF NOT EXISTS member_profiles_username_unique ON public.member_profiles(username);
UPDATE public.member_profiles SET username='lucas.lubrun' WHERE user_id='4a0f07d1-8c3c-4882-a8dd-2bef9e85e6e9';
-- Un compte Supabase Auth ne peut pas se connecter par un e-mail différent.
-- Pour utiliser lucas.lubrun, changer l'e-mail du compte admin dans Authentication > Users
-- en lucas.lubrun@members.dustdevils.invalid et confirmer cet e-mail.
-- Ne jamais exposer la clé service_role dans le site HTML ou GitHub.
