// ======================================================
// PÁGINA PÚBLICA DE CERTIFICADOS
// ======================================================

const certificateSearch = document.querySelector(
  "#certificate-search"
);

const institutionFilter = document.querySelector(
  "#institution-filter"
);

const yearFilter = document.querySelector(
  "#year-filter"
);

const certificateOrder = document.querySelector(
  "#certificate-order"
);

const clearCertificateFilters = document.querySelector(
  "#clear-certificate-filters"
);

const certificateCounter = document.querySelector(
  "#certificate-counter"
);

const certificatesGrid = document.querySelector(
  "#certificates-grid"
);

const certificatesEmpty = document.querySelector(
  "#certificates-empty"
);


let certificates = [];


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function normalizeCertificateText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


function getCertificateYear(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue).slice(0, 4);
}


function formatCertificateDate(dateValue) {
  if (!dateValue) {
    return "Data não informada";
  }

  const parts = String(dateValue).split("-");

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2] || 1)
  );

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


function updateCertificateCounter(total) {
  if (total === 0) {
    certificateCounter.textContent =
      "Nenhum certificado encontrado";

    return;
  }

  if (total === 1) {
    certificateCounter.textContent =
      "1 certificado encontrado";

    return;
  }

  certificateCounter.textContent =
    `${total} certificados encontrados`;
}


// ======================================================
// FILTROS
// ======================================================

function createCertificateOption(value) {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = value;

  return option;
}


function fillCertificateFilter(
  select,
  values,
  numeric = false
) {
  const currentValue = select.value;

  while (select.options.length > 1) {
    select.remove(1);
  }

  const uniqueValues = [
    ...new Set(
      values
        .filter(Boolean)
        .map((value) =>
          String(value).trim()
        )
    )
  ];

  uniqueValues.sort((first, second) => {
    if (numeric) {
      return Number(second) - Number(first);
    }

    return first.localeCompare(
      second,
      "pt-BR"
    );
  });

  uniqueValues.forEach((value) => {
    select.append(
      createCertificateOption(value)
    );
  });

  select.value = currentValue;
}


function fillCertificateFilters() {
  fillCertificateFilter(
    institutionFilter,
    certificates.map(
      (certificate) =>
        certificate.instituicao
    )
  );

  fillCertificateFilter(
    yearFilter,
    certificates.map(
      (certificate) =>
        getCertificateYear(
          certificate.data_conclusao
        )
    ),
    true
  );
}


// ======================================================
// CARD
// ======================================================

function createCertificateCard(certificate) {
  const article = document.createElement("article");

  article.className = "certificate-card";

  const preview = document.createElement("div");

  preview.className =
    "certificate-card-preview";

  // Usa a capa cadastrada. Se não houver capa,
  // utiliza o arquivo principal quando ele for imagem.
  const previewUrl =
    certificate.capa_url ||
    (
      certificate.arquivo_tipo === "imagem"
        ? certificate.arquivo_url
        : null
    );

  if (previewUrl) {
    const image = document.createElement("img");

    image.src = previewUrl;
    image.alt =
      `Certificado ${certificate.titulo}`;
    image.loading = "lazy";

    preview.append(image);
  } else {
    const symbol = document.createElement("strong");

    symbol.textContent =
      certificate.arquivo_tipo === "pdf"
        ? "PDF"
        : "I.";

    const label = document.createElement("small");

    label.textContent =
      "CERTIFICADO ACADÊMICO";

    preview.append(symbol, label);
  }

  const content = document.createElement("div");

  content.className =
    "certificate-card-content";

  const institution = document.createElement("span");

  institution.className =
    "certificate-card-institution";

  institution.textContent =
    certificate.instituicao;

  const title = document.createElement("h3");

  title.textContent = certificate.titulo;

  const description = document.createElement("p");

  description.textContent =
    certificate.descricao ||
    "Formação complementar registrada no portfólio.";

  const information = document.createElement("div");

  information.className =
    "certificate-card-information";

  const date = document.createElement("span");

  date.textContent = formatCertificateDate(
    certificate.data_conclusao
  );

  information.append(date);

  if (certificate.carga_horaria !== null) {
    const workload = document.createElement("span");

    workload.textContent =
      `${certificate.carga_horaria} horas`;

    information.append(workload);
  }

  if (certificate.codigo_validacao) {
    const validationCode =
      document.createElement("small");

    validationCode.className =
      "certificate-validation-code";

    validationCode.textContent =
      `Código: ${certificate.codigo_validacao}`;

    information.append(validationCode);
  }

  const actions = document.createElement("div");

  actions.className =
    "certificate-card-actions";

  if (certificate.arquivo_url) {
    const fileLink = document.createElement("a");

    fileLink.className =
      "button button-primary";

    fileLink.href = certificate.arquivo_url;
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";

    fileLink.textContent =
      certificate.arquivo_tipo === "pdf"
        ? "Abrir certificado ↗"
        : "Visualizar certificado ↗";

    actions.append(fileLink);
  }

  if (certificate.link_validacao) {
    const validationLink =
      document.createElement("a");

    validationLink.className =
      "certificate-validation-link";

    validationLink.href =
      certificate.link_validacao;

    validationLink.target = "_blank";
    validationLink.rel =
      "noopener noreferrer";

    validationLink.textContent =
      "Validar certificado ↗";

    actions.append(validationLink);
  }

  content.append(
    institution,
    title,
    description,
    information
  );

  if (actions.children.length) {
    content.append(actions);
  }

  article.append(preview, content);

  return article;
}


// ======================================================
// PESQUISA E ORDENAÇÃO
// ======================================================

function getFilteredCertificates() {
  const search = normalizeCertificateText(
    certificateSearch.value
  );

  const institution =
    institutionFilter.value;

  const year =
    yearFilter.value;

  const order =
    certificateOrder.value;

  const filtered = certificates.filter(
    (certificate) => {
      const searchableContent =
        normalizeCertificateText(
          [
            certificate.titulo,
            certificate.instituicao,
            certificate.descricao,
            certificate.codigo_validacao
          ].join(" ")
        );

      const matchesSearch =
        !search ||
        searchableContent.includes(search);

      const matchesInstitution =
        !institution ||
        certificate.instituicao === institution;

      const matchesYear =
        !year ||
        getCertificateYear(
          certificate.data_conclusao
        ) === year;

      return (
        matchesSearch &&
        matchesInstitution &&
        matchesYear
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
      first.data_conclusao ||
      first.publicado_em ||
      first.criado_em
    ).getTime();

    const secondDate = new Date(
      second.data_conclusao ||
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

function renderCertificates() {
  const filteredCertificates =
    getFilteredCertificates();

  certificatesGrid.replaceChildren();

  updateCertificateCounter(
    filteredCertificates.length
  );

  if (!filteredCertificates.length) {
    certificatesGrid.hidden = true;
    certificatesEmpty.hidden = false;

    return;
  }

  filteredCertificates.forEach(
    (certificate) => {
      certificatesGrid.append(
        createCertificateCard(certificate)
      );
    }
  );

  certificatesEmpty.hidden = true;
  certificatesGrid.hidden = false;
}


// ======================================================
// CONSULTA AO SUPABASE
// ======================================================

async function loadPublishedCertificates() {
  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    updateCertificateCounter(0);
    certificatesEmpty.hidden = false;

    return;
  }

  certificateCounter.textContent =
    "Carregando certificados...";

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("certificados")
      .select(`
        id,
        titulo,
        instituicao,
        descricao,
        carga_horaria,
        data_conclusao,
        arquivo_url,
        arquivo_tipo,
        capa_url,
        link_validacao,
        codigo_validacao,
        status,
        publicado_em,
        criado_em
      `)
      .eq("status", "publicado")
      .order("data_conclusao", {
        ascending: false,
        nullsFirst: false
      });

    if (error) {
      throw error;
    }

    certificates = data || [];

    fillCertificateFilters();
    renderCertificates();
  } catch (error) {
    console.error(
      "Não foi possível carregar os certificados:",
      error
    );

    certificates = [];

    updateCertificateCounter(0);

    certificatesGrid.hidden = true;
    certificatesEmpty.hidden = false;
  }
}


// ======================================================
// EVENTOS
// ======================================================

certificateSearch?.addEventListener(
  "input",
  renderCertificates
);

institutionFilter?.addEventListener(
  "change",
  renderCertificates
);

yearFilter?.addEventListener(
  "change",
  renderCertificates
);

certificateOrder?.addEventListener(
  "change",
  renderCertificates
);

clearCertificateFilters?.addEventListener(
  "click",
  () => {
    certificateSearch.value = "";
    institutionFilter.value = "";
    yearFilter.value = "";
    certificateOrder.value = "recent";

    renderCertificates();
  }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadPublishedCertificates();