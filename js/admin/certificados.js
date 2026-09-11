// ======================================================
// GERENCIAMENTO DE CERTIFICADOS
// ======================================================

const certificatesMessage = document.querySelector(
  "#certificates-message"
);

const certificatesMessageIcon = document.querySelector(
  "#certificates-message-icon"
);

const certificatesMessageText = document.querySelector(
  "#certificates-message-text"
);

const certificatesLoading = document.querySelector(
  "#admin-certificates-loading"
);

const certificatesList = document.querySelector(
  "#admin-certificates-list"
);

const certificatesEmpty = document.querySelector(
  "#admin-certificates-empty"
);

const certificatesNoResults = document.querySelector(
  "#admin-certificates-no-results"
);

const certificatesCounter = document.querySelector(
  "#admin-certificate-counter"
);

const certificateSearch = document.querySelector(
  "#admin-certificate-search"
);

const certificateStatus = document.querySelector(
  "#admin-certificate-status"
);

const clearCertificateFilters = document.querySelector(
  "#clear-admin-certificate-filters"
);

const adminMenuButton = document.querySelector(
  "#admin-menu-button"
);

const adminSidebar = document.querySelector(
  ".admin-sidebar"
);

const adminSidebarOverlay = document.querySelector(
  "#admin-sidebar-overlay"
);


let certificates = [];


// ======================================================
// MENSAGENS
// ======================================================

function showCertificatesMessage(
  message,
  type = "error"
) {
  certificatesMessage.hidden = false;
  certificatesMessage.dataset.type = type;
  certificatesMessageText.textContent = message;

  certificatesMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


function hideCertificatesMessage() {
  certificatesMessage.hidden = true;
  certificatesMessageText.textContent = "";

  delete certificatesMessage.dataset.type;
}


// ======================================================
// FORMATAÇÃO
// ======================================================

function normalizeCertificateText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
      month: "2-digit",
      year: "numeric"
    }
  ).format(date);
}


function getCertificateStatus(status) {
  const labels = {
    publicado: "Publicado",
    rascunho: "Rascunho",
    arquivado: "Arquivado"
  };

  return labels[status] || status;
}


// ======================================================
// CARDS
// ======================================================

function createCertificateButton(
  label,
  action,
  id,
  className = ""
) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;

  if (className) {
    button.className = className;
  }

  return button;
}


function createCertificateCard(certificate) {
  const article = document.createElement("article");

  article.className =
    "admin-summary-card admin-certificate-card";

  const cover = document.createElement("div");

  cover.className =
    "admin-summary-cover admin-certificate-cover";

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

    cover.append(image);
  } else {
    const symbol = document.createElement("span");

    symbol.textContent =
      certificate.arquivo_tipo === "pdf"
        ? "PDF"
        : "I.";

    cover.append(symbol);
  }

  const content = document.createElement("div");

  content.className =
    "admin-summary-content";

  const heading = document.createElement("div");

  heading.className =
    "admin-summary-heading";

  const status = document.createElement("span");

  status.className =
    `admin-summary-status ${certificate.status}`;

  status.textContent =
    getCertificateStatus(certificate.status);

  const date = document.createElement("small");

  date.textContent = formatCertificateDate(
    certificate.data_conclusao
  );

  heading.append(status, date);

  const title = document.createElement("h2");

  title.textContent = certificate.titulo;

  const metadata = document.createElement("p");

  metadata.className =
    "admin-summary-metadata";

  metadata.textContent = [
    certificate.instituicao,
    certificate.carga_horaria !== null
      ? `${certificate.carga_horaria} horas`
      : null
  ]
    .filter(Boolean)
    .join(" · ");

  const description = document.createElement("p");

  description.className =
    "admin-summary-description";

  description.textContent =
    certificate.descricao ||
    "Certificado sem descrição cadastrada.";

  const actions = document.createElement("div");

  actions.className =
    "admin-summary-actions";

  const editLink = document.createElement("a");

  editLink.href =
    `./certificado-formulario.html?id=${certificate.id}`;

  editLink.textContent = "Editar";

  actions.append(editLink);

  if (certificate.arquivo_url) {
    const fileLink = document.createElement("a");

    fileLink.href = certificate.arquivo_url;
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";

    fileLink.textContent =
      certificate.arquivo_tipo === "pdf"
        ? "Abrir PDF"
        : "Ver imagem";

    actions.append(fileLink);
  }

  if (certificate.status !== "publicado") {
    actions.append(
      createCertificateButton(
        "Publicar",
        "publish",
        certificate.id
      )
    );
  }

  if (certificate.status === "publicado") {
    actions.append(
      createCertificateButton(
        "Arquivar",
        "archive",
        certificate.id
      )
    );
  }

  if (certificate.status === "arquivado") {
    actions.append(
      createCertificateButton(
        "Transformar em rascunho",
        "draft",
        certificate.id
      )
    );
  }

  actions.append(
    createCertificateButton(
      "Excluir",
      "delete",
      certificate.id,
      "danger"
    )
  );

  content.append(
    heading,
    title,
    metadata,
    description,
    actions
  );

  article.append(cover, content);

  return article;
}


// ======================================================
// FILTROS
// ======================================================

function getFilteredCertificates() {
  const search = normalizeCertificateText(
    certificateSearch.value
  );

  const status = certificateStatus.value;

  return certificates.filter((certificate) => {
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

    const matchesStatus =
      !status ||
      certificate.status === status;

    return matchesSearch && matchesStatus;
  });
}


function renderCertificates() {
  const filteredCertificates =
    getFilteredCertificates();

  certificatesList.replaceChildren();

  certificatesCounter.textContent =
    filteredCertificates.length === 1
      ? "1 certificado encontrado"
      : `${filteredCertificates.length} certificados encontrados`;

  const hasCertificates =
    certificates.length > 0;

  const hasResults =
    filteredCertificates.length > 0;

  certificatesEmpty.hidden =
    hasCertificates;

  certificatesNoResults.hidden =
    !hasCertificates || hasResults;

  certificatesList.hidden =
    !hasResults;

  filteredCertificates.forEach(
    (certificate) => {
      certificatesList.append(
        createCertificateCard(certificate)
      );
    }
  );
}


// ======================================================
// CARREGAMENTO
// ======================================================

async function loadCertificates() {
  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("certificados")
      .select("*")
      .order("atualizado_em", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    certificates = data || [];

    certificatesLoading.hidden = true;

    renderCertificates();
  } catch (error) {
    console.error(
      "Erro ao carregar certificados:",
      error
    );

    certificatesLoading.textContent =
      "Não foi possível carregar os certificados.";

    showCertificatesMessage(
      error.message ||
      "Ocorreu um erro ao carregar os certificados."
    );
  }
}


// ======================================================
// STATUS
// ======================================================

async function updateCertificateStatus(
  certificate,
  newStatus
) {
  const payload = {
    status: newStatus
  };

  if (
    newStatus === "publicado" &&
    !certificate.publicado_em
  ) {
    payload.publicado_em =
      new Date().toISOString();
  }

  const {
    error
  } = await window.supabaseClient
    .from("certificados")
    .update(payload)
    .eq("id", certificate.id);

  if (error) {
    throw error;
  }
}


// ======================================================
// EXCLUSÃO
// ======================================================

async function deleteCertificate(certificate) {
  const paths = [
    certificate.arquivo_path,
    certificate.capa_path
  ].filter(Boolean);

  const {
    error
  } = await window.supabaseClient
    .from("certificados")
    .delete()
    .eq("id", certificate.id);

  if (error) {
    throw error;
  }

  if (!paths.length) {
    return true;
  }

  const {
    error: storageError
  } = await window.supabaseClient.storage
    .from("portfolio-publico")
    .remove(paths);

  if (storageError) {
    console.error(
      "Erro ao excluir arquivos do certificado:",
      storageError
    );

    return false;
  }

  return true;
}


// ======================================================
// EVENTOS
// ======================================================

certificateSearch?.addEventListener(
  "input",
  renderCertificates
);

certificateStatus?.addEventListener(
  "change",
  renderCertificates
);

clearCertificateFilters?.addEventListener(
  "click",
  () => {
    certificateSearch.value = "";
    certificateStatus.value = "";

    renderCertificates();
  }
);


certificatesList?.addEventListener(
  "click",
  async (event) => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) {
      return;
    }

    const certificate = certificates.find(
      (item) =>
        item.id === button.dataset.id
    );

    if (!certificate) {
      return;
    }

    const action = button.dataset.action;

    hideCertificatesMessage();
    button.disabled = true;

    try {
      if (action === "publish") {
        await updateCertificateStatus(
          certificate,
          "publicado"
        );

        await loadCertificates();

        showCertificatesMessage(
          "Certificado publicado com sucesso.",
          "success"
        );
      }

      if (action === "archive") {
        await updateCertificateStatus(
          certificate,
          "arquivado"
        );

        await loadCertificates();

        showCertificatesMessage(
          "Certificado arquivado.",
          "success"
        );
      }

      if (action === "draft") {
        await updateCertificateStatus(
          certificate,
          "rascunho"
        );

        await loadCertificates();

        showCertificatesMessage(
          "Certificado transformado em rascunho.",
          "success"
        );
      }

      if (action === "delete") {
        const confirmed = window.confirm(
          `Deseja excluir definitivamente “${certificate.titulo}”?`
        );

        if (!confirmed) {
          return;
        }

        const filesRemoved =
          await deleteCertificate(
            certificate
          );

        await loadCertificates();

        showCertificatesMessage(
          filesRemoved
            ? "Certificado e arquivos excluídos com sucesso."
            : "O certificado foi excluído, mas algum arquivo pode ter permanecido no armazenamento.",
          filesRemoved
            ? "success"
            : "error"
        );
      }
    } catch (error) {
      console.error(
        "Erro ao alterar certificado:",
        error
      );

      showCertificatesMessage(
        error.message ||
        "Não foi possível realizar a operação."
      );
    } finally {
      button.disabled = false;
    }
  }
);


// ======================================================
// MENU DO CELULAR
// ======================================================

function toggleAdminMenu() {
  const isOpen =
    adminSidebar.classList.toggle("open");

  adminSidebarOverlay.classList.toggle(
    "open",
    isOpen
  );

  adminMenuButton.setAttribute(
    "aria-expanded",
    String(isOpen)
  );
}


function closeAdminMenu() {
  adminSidebar.classList.remove("open");
  adminSidebarOverlay.classList.remove("open");

  adminMenuButton.setAttribute(
    "aria-expanded",
    "false"
  );
}


adminMenuButton?.addEventListener(
  "click",
  toggleAdminMenu
);

adminSidebarOverlay?.addEventListener(
  "click",
  closeAdminMenu
);

window.addEventListener("resize", () => {
  if (window.innerWidth > 850) {
    closeAdminMenu();
  }
});


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadCertificates();