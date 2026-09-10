-- =====================================================
-- STORAGE DO PORTFÓLIO I.S.I.S.
-- =====================================================


-- =====================================================
-- BUCKET DE CONTEÚDOS PÚBLICOS
-- =====================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-publico',
  'portfolio-publico',
  true,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id)
do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- =====================================================
-- BUCKET DE CONTEÚDOS PRIVADOS E RASCUNHOS
-- =====================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-privado',
  'portfolio-privado',
  false,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id)
do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- =====================================================
-- REMOÇÃO DAS POLÍTICAS ANTIGAS
-- =====================================================

drop policy if exists
  "Administradores visualizam arquivos do portfolio"
on storage.objects;

drop policy if exists
  "Administradores enviam arquivos ao portfolio"
on storage.objects;

drop policy if exists
  "Administradores atualizam arquivos do portfolio"
on storage.objects;

drop policy if exists
  "Administradores excluem arquivos do portfolio"
on storage.objects;


-- =====================================================
-- VISUALIZAÇÃO ADMINISTRATIVA
-- =====================================================

create policy
  "Administradores visualizam arquivos do portfolio"
on storage.objects
for select
to authenticated
using (
  bucket_id in (
    'portfolio-publico',
    'portfolio-privado'
  )
  and public.eh_administrador()
);


-- =====================================================
-- UPLOAD
-- =====================================================

create policy
  "Administradores enviam arquivos ao portfolio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'portfolio-publico',
    'portfolio-privado'
  )
  and public.eh_administrador()
);


-- =====================================================
-- ATUALIZAÇÃO E SUBSTITUIÇÃO
-- =====================================================

create policy
  "Administradores atualizam arquivos do portfolio"
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'portfolio-publico',
    'portfolio-privado'
  )
  and public.eh_administrador()
)
with check (
  bucket_id in (
    'portfolio-publico',
    'portfolio-privado'
  )
  and public.eh_administrador()
);


-- =====================================================
-- EXCLUSÃO
-- =====================================================

create policy
  "Administradores excluem arquivos do portfolio"
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'portfolio-publico',
    'portfolio-privado'
  )
  and public.eh_administrador()
);