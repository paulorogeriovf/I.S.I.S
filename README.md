# I.S.I.S. — Portfólio Acadêmico

Portfólio acadêmico desenvolvido sob medida para uma cliente graduanda em Biomedicina, com o objetivo de apresentar sua formação, trajetória, áreas de interesse, competências, resumos acadêmicos e certificados.

O projeto também possui uma área administrativa protegida, permitindo que a própria cliente gerencie as informações do portfólio sem precisar alterar diretamente os arquivos do site.

## Site publicado

https://isis-portfolio.netlify.app

## Sobre o projeto

O nome **I.S.I.S.** representa:

* **Identidade**
* **Saúde**
* **Investigação**
* **Saber**

A página pública apresenta a identidade acadêmica e profissional da cliente, enquanto o painel administrativo permite manter o conteúdo atualizado por meio de uma interface própria.

## Funcionalidades públicas

* Apresentação pessoal e acadêmica;
* Foto de perfil dinâmica;
* Informações sobre curso, instituição e período da graduação;
* Biografia e apresentação profissional;
* Áreas de interesse;
* Competências em desenvolvimento;
* Link para LinkedIn;
* Visualização de currículo em PDF;
* Biblioteca de resumos acadêmicos;
* Pesquisa e filtros de resumos;
* Página individual para cada resumo;
* Capas, PDFs e imagens complementares dos resumos;
* Acervo de certificados;
* Pesquisa e filtros de certificados;
* Visualização de capas e arquivos;
* Destaque automático do resumo mais recente;
* Destaque automático do certificado mais recente;
* Layout responsivo para computadores, tablets e celulares.

## Painel administrativo

A área administrativa permite:

* Autenticação de usuários;
* Verificação de permissão administrativa;
* Visualização geral dos conteúdos cadastrados;
* Edição das informações do perfil;
* Atualização da foto;
* Cadastro e remoção do currículo;
* Gerenciamento das áreas de interesse;
* Gerenciamento das competências;
* Cadastro, edição e exclusão de resumos;
* Alteração do status entre rascunho, publicado e arquivado;
* Upload de capa, PDF e imagens;
* Cadastro, edição e exclusão de certificados;
* Upload do arquivo e da capa do certificado;
* Encerramento seguro da sessão.

## Tecnologias utilizadas

* HTML5;
* CSS3;
* JavaScript;
* Supabase Database;
* Supabase Authentication;
* Supabase Storage;
* PostgreSQL;
* Row Level Security — RLS;
* Git e GitHub;
* Netlify;
* Google Search Console.

## Segurança

O projeto utiliza diferentes camadas de proteção:

* Autenticação pelo Supabase;
* Tabela específica de administradores;
* Row Level Security nas tabelas;
* Políticas separadas para leitura e gerenciamento;
* Visitantes acessam somente conteúdos publicados;
* Apenas administradores ativos podem cadastrar, editar ou excluir;
* Proteção das páginas administrativas;
* Políticas de acesso aos arquivos do Storage;
* Separação entre bucket público e privado;
* Uso exclusivo da chave pública do Supabase no navegador;
* Páginas administrativas configuradas com `noindex`.

Nenhuma senha, chave secreta ou chave `service_role` deve ser armazenada no repositório.

## Organização do projeto

```text
I.S.I.S/
│
├── index.html
├── README.md
├── robots.txt
├── sitemap.xml
│
├── admin/
│   ├── index.html
│   └── páginas de gerenciamento
│
├── assets/
│   ├── favicon.svg
│   └── imagens locais
│
├── css/
│   ├── styles.css
│   ├── admin.css
│   ├── resumos.css
│   ├── resumo-detalhes.css
│   └── certificados.css
│
├── js/
│   ├── main.js
│   ├── perfil-publico.js
│   ├── trajetoria-publica.js
│   ├── resumos.js
│   ├── resumo-detalhes.js
│   ├── certificados.js
│   ├── destaque-resumo.js
│   ├── destaque-certificado.js
│   │
│   ├── admin/
│   │   └── scripts do painel administrativo
│   │
│   └── config/
│       └── supabase.js
│
├── pages/
│   ├── login.html
│   ├── resumos.html
│   ├── resumo.html
│   └── certificados.html
│
└── supabase/
    ├── database.sql
    └── policies.sql
```

## Execução local

Por utilizar módulos carregados pelo navegador e comunicação com o Supabase, recomenda-se executar o projeto por um servidor local.

Exemplo com Python:

```bash
python -m http.server 5500
```

Depois, acesse:

```text
http://localhost:5500
```

Também é possível utilizar extensões como Live Server ou outras ferramentas de servidor HTTP local.

## Configuração do Supabase

Para utilizar o projeto em outro ambiente:

1. Criar um projeto no Supabase;
2. Executar o arquivo `supabase/database.sql`;
3. Executar o arquivo `supabase/policies.sql`;
4. Criar os buckets público e privado;
5. Configurar as políticas do Storage;
6. Informar a Project URL e a Publishable Key em `js/config/supabase.js`;
7. Criar os usuários administrativos;
8. Relacionar os usuários à tabela `administradores`.

Somente a chave pública pode ser utilizada no JavaScript do navegador.

## Publicação

O site está hospedado no Netlify e conectado ao GitHub.

Cada atualização enviada para a branch principal gera automaticamente uma nova publicação:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

## Status

Projeto funcional, publicado e preparado para receber os conteúdos acadêmicos reais da cliente.

## Desenvolvimento

Desenvolvido por **Paulo Rogério Vigário Filho** como projeto web personalizado para uma cliente.

GitHub: [paulorogeriovf](https://github.com/paulorogeriovf)

## Direitos de uso

Este projeto foi desenvolvido para uso pessoal e acadêmico da cliente. Fotografias, documentos, certificados e informações pessoais pertencem aos seus respectivos titulares.

A reutilização integral do projeto ou do conteúdo da cliente não é autorizada sem permissão.
