// ======================================================
// PÁGINA PÚBLICA DE RESUMOS
// ======================================================

// Campo utilizado para pesquisar resumos.
const summarySearch = document.querySelector("#summary-search");

// Filtro de disciplina.
const disciplineFilter = document.querySelector(
  "#discipline-filter"
);

// Filtro de categoria.
const categoryFilter = document.querySelector(
  "#category-filter"
);

// Filtro de semestre.
const semesterFilter = document.querySelector(
  "#semester-filter"
);

// Ordenação dos resultados.
const orderFilter = document.querySelector("#order-filter");

// Botão responsável por limpar todos os filtros.
const clearFiltersButton = document.querySelector(
  "#clear-filters"
);

// Elemento que mostrará a quantidade de resultados.
const resultsCounter = document.querySelector(
  "#results-counter"
);

// Grade onde os cards serão inseridos futuramente.
const summaryGrid = document.querySelector("#summary-grid");

// Mensagem exibida quando não existem resumos.
const summaryEmptyState = document.querySelector(
  "#summary-empty"
);


/**
 * Nesta primeira versão, a lista permanece vazia.
 * Futuramente os dados serão carregados do Supabase.
 */
const summaries = [];


/**
 * Atualiza a mensagem com a quantidade de resumos.
 */
function updateResultsCounter(total) {
  if (!resultsCounter) {
    return;
  }

  if (total === 0) {
    resultsCounter.textContent = "Nenhum resumo publicado";
    return;
  }

  if (total === 1) {
    resultsCounter.textContent = "1 resumo encontrado";
    return;
  }

  resultsCounter.textContent = `${total} resumos encontrados`;
}


/**
 * Exibe ou oculta o estado vazio da página.
 */
function updateEmptyState(total) {
  if (!summaryEmptyState) {
    return;
  }

  summaryEmptyState.hidden = total > 0;
}


/**
 * Prepara um texto para ser utilizado na pesquisa.
 */
function normalizeText(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/**
 * Filtra e ordena os resumos.
 */
function filterSummaries() {
  const searchValue = normalizeText(
    summarySearch?.value || ""
  );

  const disciplineValue = disciplineFilter?.value || "";
  const categoryValue = categoryFilter?.value || "";
  const semesterValue = semesterFilter?.value || "";
  const orderValue = orderFilter?.value || "recent";

  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch =
      !searchValue ||
      normalizeText(summary.title).includes(searchValue);

    const matchesDiscipline =
      !disciplineValue ||
      summary.discipline === disciplineValue;

    const matchesCategory =
      !categoryValue ||
      summary.category === categoryValue;

    const matchesSemester =
      !semesterValue ||
      summary.semester === semesterValue;

    return (
      matchesSearch &&
      matchesDiscipline &&
      matchesCategory &&
      matchesSemester
    );
  });

  filteredSummaries.sort((firstSummary, secondSummary) => {
    if (orderValue === "alphabetical") {
      return firstSummary.title.localeCompare(
        secondSummary.title,
        "pt-BR"
      );
    }

    const firstDate = new Date(firstSummary.publishedAt);
    const secondDate = new Date(secondSummary.publishedAt);

    if (orderValue === "oldest") {
      return firstDate - secondDate;
    }

    return secondDate - firstDate;
  });

  updateResultsCounter(filteredSummaries.length);
  updateEmptyState(filteredSummaries.length);
}


/**
 * Limpa todos os filtros da página.
 */
function clearFilters() {
  if (summarySearch) {
    summarySearch.value = "";
  }

  if (disciplineFilter) {
    disciplineFilter.value = "";
  }

  if (categoryFilter) {
    categoryFilter.value = "";
  }

  if (semesterFilter) {
    semesterFilter.value = "";
  }

  if (orderFilter) {
    orderFilter.value = "recent";
  }

  filterSummaries();
}


// Atualiza a pesquisa enquanto o visitante digita.
summarySearch?.addEventListener("input", filterSummaries);

// Atualiza os resultados quando um filtro é alterado.
disciplineFilter?.addEventListener(
  "change",
  filterSummaries
);

categoryFilter?.addEventListener(
  "change",
  filterSummaries
);

semesterFilter?.addEventListener(
  "change",
  filterSummaries
);

orderFilter?.addEventListener(
  "change",
  filterSummaries
);

// Limpa todos os filtros.
clearFiltersButton?.addEventListener(
  "click",
  clearFilters
);

// Prepara a página assim que o JavaScript é carregado.
filterSummaries();