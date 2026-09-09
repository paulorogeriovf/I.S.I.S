-- =====================================================
-- POLÍTICAS DE SEGURANÇA DO PORTFÓLIO I.S.I.S.
-- =====================================================


-- =====================================================
-- FUNÇÃO PARA IDENTIFICAR ADMINISTRADORES
-- =====================================================

create or replace function public.eh_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.administradores
    where usuario_id = auth.uid()
      and ativo = true
  );
$$;

revoke all
on function public.eh_administrador()
from public;

grant execute
on function public.eh_administrador()
to authenticated;


-- =====================================================
-- PERMISSÕES BÁSICAS DA DATA API
-- =====================================================

grant usage
on schema public
to anon, authenticated;

grant select
on table
  public.perfil,
  public.areas_interesse,
  public.competencias,
  public.resumos,
  public.imagens_resumo,
  public.certificados
to anon, authenticated;

grant select
on table public.administradores
to authenticated;

grant insert, update, delete
on table
  public.perfil,
  public.areas_interesse,
  public.competencias,
  public.resumos,
  public.imagens_resumo,
  public.certificados
to authenticated;


-- =====================================================
-- ADMINISTRADORES
-- =====================================================

drop policy if exists
  "Usuario consulta seu acesso administrativo"
on public.administradores;

create policy
  "Usuario consulta seu acesso administrativo"
on public.administradores
for select
to authenticated
using (
  usuario_id = auth.uid()
);


-- =====================================================
-- PERFIL
-- =====================================================

drop policy if exists
  "Perfil pode ser visualizado publicamente"
on public.perfil;

create policy
  "Perfil pode ser visualizado publicamente"
on public.perfil
for select
to anon, authenticated
using (true);


drop policy if exists
  "Administradores gerenciam o perfil"
on public.perfil;

create policy
  "Administradores gerenciam o perfil"
on public.perfil
for all
to authenticated
using (
  public.eh_administrador()
)
with check (
  public.eh_administrador()
);


-- =====================================================
-- ÁREAS DE INTERESSE
-- =====================================================

drop policy if exists
  "Areas ativas podem ser visualizadas publicamente"
on public.areas_interesse;

create policy
  "Areas ativas podem ser visualizadas publicamente"
on public.areas_interesse
for select
to anon, authenticated
using (
  ativo = true
);


drop policy if exists
  "Administradores gerenciam areas de interesse"
on public.areas_interesse;

create policy
  "Administradores gerenciam areas de interesse"
on public.areas_interesse
for all
to authenticated
using (
  public.eh_administrador()
)
with check (
  public.eh_administrador()
);


-- =====================================================
-- COMPETÊNCIAS
-- =====================================================

drop policy if exists
  "Competencias ativas podem ser visualizadas publicamente"
on public.competencias;

create policy
  "Competencias ativas podem ser visualizadas publicamente"
on public.competencias
for select
to anon, authenticated
using (
  ativo = true
);


drop policy if exists
  "Administradores gerenciam competencias"
on public.competencias;

create policy
  "Administradores gerenciam competencias"
on public.competencias
for all
to authenticated
using (
  public.eh_administrador()
)
with check (
  public.eh_administrador()
);


-- =====================================================
-- RESUMOS
-- =====================================================

drop policy if exists
  "Resumos publicados podem ser visualizados publicamente"
on public.resumos;

create policy
  "Resumos publicados podem ser visualizados publicamente"
on public.resumos
for select
to anon, authenticated
using (
  status = 'publicado'
);


drop policy if exists
  "Administradores gerenciam resumos"
on public.resumos;

create policy
  "Administradores gerenciam resumos"
on public.resumos
for all
to authenticated
using (
  public.eh_administrador()
)
with check (
  public.eh_administrador()
);


-- =====================================================
-- IMAGENS DOS RESUMOS
-- =====================================================

drop policy if exists
  "Imagens de resumos publicados podem ser visualizadas"
on public.imagens_resumo;

create policy
  "Imagens de resumos publicados podem ser visualizadas"
on public.imagens_resumo
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.resumos
    where resumos.id = imagens_resumo.resumo_id
      and resumos.status = 'publicado'
  )
);


drop policy if exists
  "Administradores gerenciam imagens dos resumos"
on public.imagens_resumo;

create policy
  "Administradores gerenciam imagens dos resumos"
on public.imagens_resumo
for all
to authenticated
using (
  public.eh_administrador()
)
with check (
  public.eh_administrador()
);


-- =====================================================
-- CERTIFICADOS
-- =====================================================

drop policy if exists
  "Certificados publicados podem ser visualizados"
on public.certificados;

create policy
  "Certificados publicados podem ser visualizados"
on public.certificados
for select
to anon, authenticated
using (
  status = 'publicado'
);


drop policy if exists
  "Administradores gerenciam certificados"
on public.certificados;

create policy
  "Administradores gerenciam certificados"
on public.certificados
for all
to authenticated
using (
  public.eh_administrador()
)
with check (
  public.eh_administrador()
);