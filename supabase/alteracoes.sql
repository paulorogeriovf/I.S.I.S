-- =====================================================
-- ALTERAÇÕES EVOLUTIVAS DO BANCO I.S.I.S.
-- =====================================================


-- Guarda o caminho interno da fotografia no Storage.
alter table public.perfil
add column if not exists foto_path text;


-- Guarda o caminho interno do currículo no Storage.
alter table public.perfil
add column if not exists curriculo_path text;


-- Impede que o portfólio tenha mais de um perfil principal.
create unique index if not exists
  perfil_apenas_um_registro
on public.perfil ((true));