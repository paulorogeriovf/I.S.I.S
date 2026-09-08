// ======================================================
// PÁGINA INDIVIDUAL DO RESUMO
// ======================================================

const loadingElement = document.querySelector(
  "#summary-loading"
);

const notFoundElement = document.querySelector(
  "#summary-not-found"
);

const contentElement = document.querySelector(
  "#summary-content"
);

const titleElement = document.querySelector(
  "#summary-title"
);

const descriptionElement = document.querySelector(
  "#summary-description"
);

const disciplineElement = document.querySelector(
  "#summary-discipline"
);

const categoryElement = document.querySelector(
  "#summary-category"
);

const semesterElement = document.querySelector(
  "#summary-semester"
);

const dateElement = document.querySelector(
  "#summary-date"
);

const publicationElement = document.querySelector(
  "#summary-publication"
);

const keywordsElement = document.querySelector(
  "#summary-keywords"
);

const pagesElement = document.querySelector(
  "#summary-pages"
);

const pagesEmptyElement = document.querySelector(
  "#pages-empty"
);

const pdfElement = document.querySelector(
  "#summary-pdf"
);


/**
 * A lista permanecerá vazia até a conexão com o Supabase.
 *
 * Futuramente, o resumo será procurado no banco usando
 * o identificador recebido pelo endereço da página.
 */
const summaries = [];


/**
 * Obtém o identificador informado no endereço.
 * Exemplo: resumo.html?id=1
 */
function getSummaryId() {
  const parameters = new URLSearchParams(
    window.location.search
  );

  return parameters.get("id");
}


/**
 * Formata uma data para o padrão brasileiro.
 */
function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${date}T12:00:00`)
  );
}


/**
 * Exibe a mensagem de conteúdo não encontrado.
 */
function showNotFound() {
  loadingElement.hidden = true;
  contentElement.hidden = true;
  notFoundElement.hidden = false;
}


/**
 * Cria as palavras-chave do resumo.
 */
function renderKeywords(keywords = []) {
  keywordsElement.innerHTML = "";

  keywords.forEach((keyword) => {
    const keywordElement = document.createElement("span");
    keywordElement.textContent = keyword;
    keywordsElement.appendChild(keywordElement);
  });
}


/**
 * Cria as imagens das páginas na ordem correta.
 */
function renderPages(pages = []) {
  pagesElement.innerHTML = "";

  if (pages.length === 0) {
    pagesEmptyElement.hidden = false;
    return;
  }

  pagesEmptyElement.hidden = true;

  const orderedPages = [...pages].sort(
    (firstPage, secondPage) =>
      firstPage.order - secondPage.order
  );

  orderedPages.forEach((page, index) => {
    const figure = document.createElement("figure");
    figure.className = "summary-page-image";

    const image = document.createElement("img");
    image.src = page.url;
    image.alt =
      page.alternativeText ||
      `Página ${index + 1} do resumo`;

    image.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent =
      `Página ${index + 1} de ${orderedPages.length}`;

    figure.appendChild(image);
    figure.appendChild(caption);
    pagesElement.appendChild(figure);
  });
}


/**
 * Preenche a página com as informações encontradas.
 */
function renderSummary(summary) {
  document.title = `${summary.title} | I.S.I.S.`;

  titleElement.textContent = summary.title;
  descriptionElement.textContent = summary.description;
  disciplineElement.textContent = summary.discipline;
  categoryElement.textContent = summary.category;
  semesterElement.textContent = summary.semester;

  const formattedDate = formatDate(summary.publishedAt);

  dateElement.textContent = formattedDate;
  publicationElement.textContent = formattedDate;

  renderKeywords(summary.keywords);
  renderPages(summary.pages);

  if (summary.pdfUrl) {
    pdfElement.href = summary.pdfUrl;
    pdfElement.hidden = false;
  } else {
    pdfElement.hidden = true;
  }

  loadingElement.hidden = true;
  notFoundElement.hidden = true;
  contentElement.hidden = false;
}


/**
 * Procura o resumo correspondente ao endereço atual.
 */
function loadSummary() {
  const summaryId = getSummaryId();

  if (!summaryId) {
    showNotFound();
    return;
  }

  const summary = summaries.find(
    (item) => String(item.id) === String(summaryId)
  );

  if (!summary) {
    showNotFound();
    return;
  }

  renderSummary(summary);
}


loadSummary();