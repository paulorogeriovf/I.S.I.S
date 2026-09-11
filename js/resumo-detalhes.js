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

const pagesEmptyText = document.querySelector(
  "#pages-empty-text"
);

const materialTitle = document.querySelector(
  "#summary-material-title"
);

const pdfElement = document.querySelector(
  "#summary-pdf"
);


// ======================================================
// IDENTIFICADOR E DATA
// ======================================================

function getSummaryId() {
  const parameters = new URLSearchParams(
    window.location.search
  );

  return parameters.get("id");
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "Data não informada";
  }

  const date = new Date(dateValue);

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


// ======================================================
// ESTADOS DA PÁGINA
// ======================================================

function showLoading() {
  loadingElement.hidden = false;
  notFoundElement.hidden = true;
  contentElement.hidden = true;
}


function showNotFound() {
  loadingElement.hidden = true;
  contentElement.hidden = true;
  notFoundElement.hidden = false;
}


function showContent() {
  loadingElement.hidden = true;
  notFoundElement.hidden = true;
  contentElement.hidden = false;
}


// ======================================================
// METADADOS
// ======================================================

function setOptionalMetadata(element, value) {
  if (!value) {
    element.hidden = true;
    element.textContent = "";

    return;
  }

  element.textContent = value;
  element.hidden = false;
}


function updatePageMetadata(summary) {
  document.title =
    `${summary.titulo} | I.S.I.S.`;

  const descriptionMeta = document.querySelector(
    'meta[name="description"]'
  );

  if (
    descriptionMeta &&
    summary.descricao
  ) {
    descriptionMeta.content =
      summary.descricao.slice(0, 155);
  }
}


// ======================================================
// PALAVRAS-CHAVE
// ======================================================

function renderKeywords(keywords = []) {
  keywordsElement.replaceChildren();

  const validKeywords = keywords.filter(Boolean);

  if (!validKeywords.length) {
    keywordsElement.hidden = true;

    return;
  }

  validKeywords.forEach((keyword) => {
    const element = document.createElement("span");

    element.textContent = keyword;

    keywordsElement.append(element);
  });

  keywordsElement.hidden = false;
}


// ======================================================
// PÁGINAS
// ======================================================

function renderPages(pages = [], hasPdf = false) {
  pagesElement.replaceChildren();

  if (!pages.length) {
    pagesElement.hidden = true;

    if (hasPdf) {
      materialTitle.textContent =
        "Resumo em PDF.";

      pagesEmptyElement.hidden = true;
    } else {
      materialTitle.textContent =
        "Material completo.";

      pagesEmptyText.textContent =
        "O material completo ainda não está disponível.";

      pagesEmptyElement.hidden = false;
    }

    return;
  }

  materialTitle.textContent =
    "Páginas do resumo.";

  pages.forEach((page, index) => {
    const figure = document.createElement("figure");

    figure.className =
      "summary-page-image";

    const image = document.createElement("img");

    image.src = page.imagem_url;

    image.alt =
      page.texto_alternativo ||
      `Página ${index + 1} do resumo`;

    image.loading = "lazy";

    const caption =
      document.createElement("figcaption");

    caption.textContent =
      `Página ${index + 1} de ${pages.length}`;

    figure.append(image, caption);
    pagesElement.append(figure);
  });

  pagesEmptyElement.hidden = true;
  pagesElement.hidden = false;
}


// ======================================================
// EXIBIÇÃO DO RESUMO
// ======================================================

function renderSummary(summary, pages) {
  updatePageMetadata(summary);

  titleElement.textContent =
    summary.titulo;

  descriptionElement.textContent =
    summary.descricao ||
    "Material acadêmico disponível para consulta.";

  disciplineElement.textContent =
    summary.disciplina ||
    "Não informada";

  const formattedDate = formatDate(
    summary.publicado_em
  );

  publicationElement.textContent =
    formattedDate;

  setOptionalMetadata(
    categoryElement,
    summary.categoria
  );

  setOptionalMetadata(
    semesterElement,
    summary.semestre
  );

  setOptionalMetadata(
    dateElement,
    formattedDate
  );

  renderKeywords(
    summary.palavras_chave || []
  );

  const hasPdf = Boolean(summary.pdf_url);

  if (hasPdf) {
    pdfElement.href = summary.pdf_url;
    pdfElement.hidden = false;
  } else {
    pdfElement.hidden = true;
    pdfElement.removeAttribute("href");
  }

  renderPages(pages, hasPdf);
  showContent();
}


// ======================================================
// CONSULTA AO SUPABASE
// ======================================================

async function loadSummary() {
  showLoading();

  const summaryId = getSummaryId();

  if (!summaryId) {
    showNotFound();

    return;
  }

  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    showNotFound();

    return;
  }

  try {
    const {
      data: summary,
      error: summaryError
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
        pdf_url,
        status,
        publicado_em
      `)
      .eq("id", summaryId)
      .eq("status", "publicado")
      .maybeSingle();

    if (summaryError) {
      throw summaryError;
    }

    if (!summary) {
      showNotFound();

      return;
    }

    const {
      data: pages,
      error: pagesError
    } = await window.supabaseClient
      .from("imagens_resumo")
      .select(`
        id,
        imagem_url,
        ordem,
        texto_alternativo
      `)
      .eq("resumo_id", summary.id)
      .order("ordem", {
        ascending: true
      });

    if (pagesError) {
      throw pagesError;
    }

    renderSummary(
      summary,
      pages || []
    );
  } catch (error) {
    console.error(
      "Não foi possível carregar o resumo:",
      error
    );

    showNotFound();
  }
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadSummary();