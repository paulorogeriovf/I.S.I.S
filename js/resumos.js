// ======================================================
// PÁGINA PÚBLICA DE RESUMOS
// ======================================================

const summarySearch = document.querySelector(
  "#summary-search"
);

const disciplineFilter = document.querySelector(
  "#discipline-filter"
);

const categoryFilter = document.querySelector(
  "#category-filter"
);

const semesterFilter = document.querySelector(
  "#semester-filter"
);

const orderFilter = document.querySelector(
  "#order-filter"
);

const clearFiltersButton = document.querySelector(
  "#clear-filters"
);

const resultsCounter = document.querySelector(
  "#results-counter"
);

const summaryGrid = document.querySelector(
  "#summary-grid"
);

const summaryEmptyState = document.querySelector(
  "#summary-empty"
);

const publishedSummaryCount = document.querySelector(
  "#published-summary-count"
);


let summaries = [];


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "Publicação acadêmica";
  }

  const date = new Date(dateValue);

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "short",
      year: "numeric"
    }
  ).format(date);
}


function updateResultsCounter(total) {
  if (total === 0) {
    resultsCounter.textContent =
      "Nenhum resumo encontrado";

    return;
  }

  if (total === 1) {
    resultsCounter.textContent =
      "1 resumo encontrado";

    return;
  }

  resultsCounter.textContent =
    `${total} resumos encontrados`;
}


// ======================================================
// OPÇÕES DOS FILTROS
// ======================================================

function createFilterOption(value) {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = value;

  return option;
}


function fillFilter(select, values) {
  const currentValue = select.value;

  while (select.options.length > 1) {
    select.remove(1);
  }

  const uniqueValues = [
    ...new Set(
      values
        .filter(Boolean)
        .map((value) => String(value).trim())
    )
  ].sort((first, second) =>
    first.localeCompare(
      second,
      "pt-BR"
    )
  );

  uniqueValues.forEach((value) => {
    select.append(
      createFilterOption(value)
    );
  });

  select.value = currentValue;
}


function fillSummaryFilters() {
  fillFilter(
    disciplineFilter,
    summaries.map(
      (summary) => summary.disciplina
    )
  );

  fillFilter(
    categoryFilter,
    summaries.map(
      (summary) => summary.categoria
    )
  );

  fillFilter(
    semesterFilter,
    summaries.map(
      (summary) => summary.semestre
    )
  );
}


// ======================================================
// CARD DO RESUMO
// ======================================================

function createSummaryCard(summary) {
  const article = document.createElement("article");
  article.className = "summary-card";

  const cover = document.createElement("div");
  cover.className = "summary-card-cover";

  if (summary.capa_url) {
    const image = document.createElement("img");

    image.src = summary.capa_url;
    image.alt = `Capa do resumo ${summary.titulo}`;
    image.loading = "lazy";

    cover.append(image);
  } else {
    const placeholder = document.createElement("div");

    placeholder.className =
      "summary-card-cover-placeholder";

    const brand = document.createElement("strong");
    brand.textContent = "I.";

    const label = document.createElement("small");
    label.textContent = "RESUMO ACADÊMICO";

    placeholder.append(brand, label);
    cover.append(placeholder);
  }

  if (summary.semestre) {
    const semester = document.createElement("span");

    semester.className =
      "summary-card-semester";

    semester.textContent = summary.semestre;

    cover.append(semester);
  }

  const content = document.createElement("div");
  content.className = "summary-card-content";

  const category = document.createElement("span");

  category.className =
    "summary-card-category";

  category.textContent =
    summary.categoria ||
    "Conteúdo acadêmico";

  const title = document.createElement("h3");
  title.textContent = summary.titulo;

  const description = document.createElement("p");

  description.textContent =
    summary.descricao ||
    "Material acadêmico disponível para consulta.";

  const footer = document.createElement("div");
  footer.className = "summary-card-footer";

  const discipline = document.createElement("span");

  discipline.textContent =
    summary.disciplina ||
    formatDate(summary.publicado_em);

  const link = document.createElement("a");

  link.href =
    `./resumo.html?id=${summary.id}`;

  link.textContent = "Abrir resumo →";

  footer.append(discipline, link);

  content.append(
    category,
    title,
    description,
    footer
  );

  article.append(cover, content);

  return article;
}


// ======================================================
// FILTROS E ORDENAÇÃO
// ======================================================

function getFilteredSummaries() {
  const search = normalizeText(
    summarySearch.value
  );

  const discipline =
    disciplineFilter.value;

  const category =
    categoryFilter.value;

  const semester =
    semesterFilter.value;

  const order =
    orderFilter.value;

  const filtered = summaries.filter(
    (summary) => {
      const searchableContent = normalizeText(
        [
          summary.titulo,
          summary.descricao,
          summary.disciplina,
          summary.categoria,
          summary.semestre,
          ...(summary.palavras_chave || [])
        ].join(" ")
      );

      const matchesSearch =
        !search ||
        searchableContent.includes(search);

      const matchesDiscipline =
        !discipline ||
        summary.disciplina === discipline;

      const matchesCategory =
        !category ||
        summary.categoria === category;

      const matchesSemester =
        !semester ||
        summary.semestre === semester;

      return (
        matchesSearch &&
        matchesDiscipline &&
        matchesCategory &&
        matchesSemester
      );
    }
  );

  filtered.sort((first, second) => {
    if (order === "alphabetical") {
      return first.titulo.localeCompare(
        second.titulo,
        "pt-BR"
      );
    }

    const firstDate = new Date(
      first.publicado_em ||
      first.criado_em
    ).getTime();

    const secondDate = new Date(
      second.publicado_em ||
      second.criado_em
    ).getTime();

    if (order === "oldest") {
      return firstDate - secondDate;
    }

    return secondDate - firstDate;
  });

  return filtered;
}


// ======================================================
// RENDERIZAÇÃO
// ======================================================

function renderSummaries() {
  const filteredSummaries =
    getFilteredSummaries();

  summaryGrid.replaceChildren();

  updateResultsCounter(
    filteredSummaries.length
  );

  if (!filteredSummaries.length) {
    summaryGrid.hidden = true;
    summaryEmptyState.hidden = false;

    return;
  }

  filteredSummaries.forEach((summary) => {
    summaryGrid.append(
      createSummaryCard(summary)
    );
  });

  summaryEmptyState.hidden = true;
  summaryGrid.hidden = false;
}


// ======================================================
// CONSULTA AO SUPABASE
// ======================================================

async function loadPublishedSummaries() {
  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    updateResultsCounter(0);
    summaryEmptyState.hidden = false;

    return;
  }

  resultsCounter.textContent =
    "Carregando resumos...";

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("resumos")
      .select(`
        id,
        titulo,
        slug,
        descricao,
        disciplina,
        categoria,
        semestre,
        palavras_chave,
        capa_url,
        pdf_url,
        status,
        publicado_em,
        criado_em
      `)
      .eq("status", "publicado")
      .order("publicado_em", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    summaries = data || [];

    publishedSummaryCount.textContent =
      String(summaries.length).padStart(
        2,
        "0"
      );

    fillSummaryFilters();
    renderSummaries();
  } catch (error) {
    console.error(
      "Não foi possível carregar os resumos:",
      error
    );

    summaries = [];

    publishedSummaryCount.textContent =
      "00";

    updateResultsCounter(0);

    summaryGrid.hidden = true;
    summaryEmptyState.hidden = false;
  }
}


// ======================================================
// EVENTOS
// ======================================================

summarySearch?.addEventListener(
  "input",
  renderSummaries
);

disciplineFilter?.addEventListener(
  "change",
  renderSummaries
);

categoryFilter?.addEventListener(
  "change",
  renderSummaries
);

semesterFilter?.addEventListener(
  "change",
  renderSummaries
);

orderFilter?.addEventListener(
  "change",
  renderSummaries
);

clearFiltersButton?.addEventListener(
  "click",
  () => {
    summarySearch.value = "";
    disciplineFilter.value = "";
    categoryFilter.value = "";
    semesterFilter.value = "";
    orderFilter.value = "recent";

    renderSummaries();
  }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadPublishedSummaries();