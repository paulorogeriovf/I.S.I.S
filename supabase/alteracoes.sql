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

-- =====================================================
-- ARQUIVOS E PUBLICAÇÃO DOS CERTIFICADOS
-- =====================================================

-- Caminho interno utilizado para excluir ou substituir
-- o arquivo dentro do Storage.
alter table public.certificados
add column if not exists arquivo_path text;


-- Informa se o arquivo cadastrado é imagem ou PDF.
alter table public.certificados
add column if not exists arquivo_tipo text;


-- Registra quando o certificado foi publicado.
alter table public.certificados
add column if not exists publicado_em timestamptz;


-- Restringe os tipos aceitos pela tabela.
alter table public.certificados
drop constraint if exists certificados_arquivo_tipo_valido;

alter table public.certificados
add constraint certificados_arquivo_tipo_valido
check (
  arquivo_tipo is null
  or arquivo_tipo in (
    'imagem',
    'pdf'
  )
);