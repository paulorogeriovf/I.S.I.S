// ======================================================
// RESUMO EM DESTAQUE NA PÁGINA INICIAL
// ======================================================

const homeSummaryCategory = document.querySelector(
  "#home-summary-category"
);

const homeSummaryTitle = document.querySelector(
  "#home-summary-title"
);

const homeSummaryDescription = document.querySelector(
  "#home-summary-description"
);

const homeSummaryDiscipline = document.querySelector(
  "#home-summary-discipline"
);

const homeSummaryLink = document.querySelector(
  "#home-summary-link"
);

const homeSummaryCover = document.querySelector(
  "#home-summary-cover"
);

const homeSummaryCoverImage = document.querySelector(
  "#home-summary-cover-image"
);


// ======================================================
// TEXTO
// ======================================================

function limitSummaryDescription(
  value,
  maximumLength = 145
) {
  const text = String(value || "").trim();

  if (text.length <= maximumLength) {
    return text;
  }

  return (
    text.slice(0, maximumLength)
      .trimEnd() +
    "..."
  );
}


// ======================================================
// EXIBIÇÃO
// ======================================================

function renderHomeSummary(summary) {
  homeSummaryCategory.textContent =
    summary.categoria ||
    summary.semestre ||
    "RESUMO";

  homeSummaryTitle.textContent =
    summary.titulo;

  homeSummaryDescription.textContent =
    limitSummaryDescription(
      summary.descricao ||
      "Material acadêmico disponível para consulta."
    );

  homeSummaryDiscipline.textContent =
    summary.disciplina ||
    "Biomedicina";

  homeSummaryLink.href =
    `pages/resumo.html?id=${summary.id}`;

  homeSummaryLink.textContent =
    "Ler resumo →";

  homeSummaryLink.setAttribute(
    "aria-label",
    `Abrir o resumo ${summary.titulo}`
  );

  if (summary.capa_url) {
    homeSummaryCoverImage.src =
      summary.capa_url;

    homeSummaryCoverImage.alt =
      `Capa do resumo ${summary.titulo}`;

    homeSummaryCover.hidden = false;
  } else {
    homeSummaryCover.hidden = true;
    homeSummaryCoverImage.removeAttribute("src");
    homeSummaryCoverImage.alt = "";
  }
}


// ======================================================
// CONSULTA
// ======================================================

async function loadHomeSummary() {
  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    return;
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("resumos")
      .select(`
        id,
        titulo,
        descricao,
        disciplina,
        categoria,
        semestre,
        capa_url,
        publicado_em,
        criado_em
      `)
      .eq("status", "publicado")
      .order("publicado_em", {
        ascending: false,
        nullsFirst: false
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return;
    }

    renderHomeSummary(data);
  } catch (error) {
    console.error(
      "Não foi possível carregar o resumo em destaque:",
      error
    );
  }
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadHomeSummary();