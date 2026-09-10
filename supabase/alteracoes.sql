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

-- =====================================================
-- CAMINHOS DOS ARQUIVOS DOS RESUMOS
-- =====================================================

-- Caminho interno da capa no Storage.
alter table public.resumos
add column if not exists capa_path text;


-- Caminho interno do PDF no Storage.
alter table public.resumos
add column if not exists pdf_path text;


-- Caminho interno de cada imagem/página no Storage.
alter table public.imagens_resumo
add column if not exists imagem_path text;