-- =====================================================
-- BANCO DE DADOS DO PORTFÓLIO I.S.I.S.
-- =====================================================

-- Permite gerar identificadores UUID.
create extension if not exists pgcrypto;


-- =====================================================
-- FUNÇÃO PARA ATUALIZAR DATAS AUTOMATICAMENTE
-- =====================================================

create or replace function public.atualizar_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;


-- =====================================================
-- ADMINISTRADORES
-- =====================================================

create table if not exists public.administradores (
  usuario_id uuid primary key
    references auth.users(id)
    on delete cascade,

  nome text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);


-- =====================================================
-- PERFIL PRINCIPAL
-- =====================================================

create table if not exists public.perfil (
  id uuid primary key default gen_random_uuid(),

  nome_completo text not null,
  titulo_profissional text,
  apresentacao text,
  biografia text,
  curso text,
  faculdade text,
  cidade text,
  estado text,
  pais text,
  data_inicio date,
  data_conclusao date,
  linkedin text,
  email_profissional text,
  foto_url text,
  curriculo_url text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);


-- =====================================================
-- ÁREAS DE INTERESSE
-- =====================================================

create table if not exists public.areas_interesse (
  id uuid primary key default gen_random_uuid(),

  perfil_id uuid not null
    references public.perfil(id)
    on delete cascade,

  titulo text not null,
  descricao text,
  icone text,
  ordem integer not null default 0,
  ativo boolean not null default true,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);


-- =====================================================
-- COMPETÊNCIAS
-- =====================================================

create table if not exists public.competencias (
  id uuid primary key default gen_random_uuid(),

  perfil_id uuid not null
    references public.perfil(id)
    on delete cascade,

  nome text not null,
  descricao text,
  ordem integer not null default 0,
  ativo boolean not null default true,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);


-- =====================================================
-- RESUMOS ACADÊMICOS
-- =====================================================

create table if not exists public.resumos (
  id uuid primary key default gen_random_uuid(),

  titulo text not null,
  slug text not null unique,
  descricao text,
  disciplina text,
  categoria text,
  semestre text,
  palavras_chave text[] not null default array[]::text[],
  capa_url text,
  pdf_url text,

  status text not null default 'rascunho'
    check (
      status in (
        'rascunho',
        'publicado',
        'arquivado'
      )
    ),

  publicado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);


-- =====================================================
-- IMAGENS DOS RESUMOS
-- =====================================================

create table if not exists public.imagens_resumo (
  id uuid primary key default gen_random_uuid(),

  resumo_id uuid not null
    references public.resumos(id)
    on delete cascade,

  imagem_url text not null,
  ordem integer not null default 1,
  texto_alternativo text,

  criado_em timestamptz not null default now(),

  constraint imagens_resumo_ordem_positiva
    check (ordem > 0),

  constraint imagens_resumo_ordem_unica
    unique (resumo_id, ordem)
);


-- =====================================================
-- CERTIFICADOS
-- =====================================================

create table if not exists public.certificados (
  id uuid primary key default gen_random_uuid(),

  titulo text not null,
  instituicao text not null,
  descricao text,
  carga_horaria integer,
  data_conclusao date,
  arquivo_url text,
  link_validacao text,
  codigo_validacao text,

  status text not null default 'rascunho'
    check (
      status in (
        'rascunho',
        'publicado',
        'arquivado'
      )
    ),

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint certificados_carga_horaria_positiva
    check (
      carga_horaria is null
      or carga_horaria >= 0
    )
);


-- =====================================================
-- ÍNDICES PARA MELHORAR AS CONSULTAS
-- =====================================================

create index if not exists idx_resumos_status
  on public.resumos(status);

create index if not exists idx_resumos_publicado_em
  on public.resumos(publicado_em desc);

create index if not exists idx_resumos_disciplina
  on public.resumos(disciplina);

create index if not exists idx_resumos_categoria
  on public.resumos(categoria);

create index if not exists idx_imagens_resumo_resumo
  on public.imagens_resumo(resumo_id);

create index if not exists idx_certificados_status
  on public.certificados(status);

create index if not exists idx_certificados_data
  on public.certificados(data_conclusao desc);

create index if not exists idx_areas_interesse_perfil
  on public.areas_interesse(perfil_id);

create index if not exists idx_competencias_perfil
  on public.competencias(perfil_id);


-- =====================================================
-- GATILHOS DE ATUALIZAÇÃO
-- =====================================================

drop trigger if exists atualizar_perfil_em
  on public.perfil;

create trigger atualizar_perfil_em
before update on public.perfil
for each row
execute function public.atualizar_atualizado_em();


drop trigger if exists atualizar_areas_interesse_em
  on public.areas_interesse;

create trigger atualizar_areas_interesse_em
before update on public.areas_interesse
for each row
execute function public.atualizar_atualizado_em();


drop trigger if exists atualizar_competencias_em
  on public.competencias;

create trigger atualizar_competencias_em
before update on public.competencias
for each row
execute function public.atualizar_atualizado_em();


drop trigger if exists atualizar_resumos_em
  on public.resumos;

create trigger atualizar_resumos_em
before update on public.resumos
for each row
execute function public.atualizar_atualizado_em();


drop trigger if exists atualizar_certificados_em
  on public.certificados;

create trigger atualizar_certificados_em
before update on public.certificados
for each row
execute function public.atualizar_atualizado_em();


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.administradores
  enable row level security;

alter table public.perfil
  enable row level security;

alter table public.areas_interesse
  enable row level security;

alter table public.competencias
  enable row level security;

alter table public.resumos
  enable row level security;

alter table public.imagens_resumo
  enable row level security;

alter table public.certificados
  enable row level security;