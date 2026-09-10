// ======================================================
// GERENCIAMENTO DE RESUMOS
// ======================================================

const summariesMessage = document.querySelector(
  "#summaries-message"
);

const summariesMessageIcon = document.querySelector(
  "#summaries-message-icon"
);

const summariesMessageText = document.querySelector(
  "#summaries-message-text"
);

const summariesLoading = document.querySelector(
  "#admin-summaries-loading"
);

const summariesList = document.querySelector(
  "#admin-summaries-list"
);

const summariesEmpty = document.querySelector(
  "#admin-summaries-empty"
);

const summariesNoResults = document.querySelector(
  "#admin-summaries-no-results"
);

const summariesCounter = document.querySelector(
  "#admin-summary-counter"
);

const summarySearch = document.querySelector(
  "#admin-summary-search"
);

const summaryStatus = document.querySelector(
  "#admin-summary-status"
);

const clearSummaryFilters = document.querySelector(
  "#clear-admin-summary-filters"
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


let summaries = [];


// ======================================================
// MENSAGENS
// ======================================================

function showSummariesMessage(
  message,
  type = "error"
) {
  summariesMessage.hidden = false;
  summariesMessage.dataset.type = type;
  summariesMessageText.textContent = message;

  summariesMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


function hideSummariesMessage() {
  summariesMessage.hidden = true;
  summariesMessageText.textContent = "";

  delete summariesMessage.dataset.type;
}


// ======================================================
// FORMATAÇÃO
// ======================================================

function formatDate(dateValue) {
  if (!dateValue) {
    return "Ainda não publicado";
  }

  const date = new Date(dateValue);

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ).format(date);
}


function getStatusLabel(status) {
  const labels = {
    publicado: "Publicado",
    rascunho: "Rascunho",
    arquivado: "Arquivado"
  };

  return labels[status] || status;
}


function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


// ======================================================
// ELEMENTOS
// ======================================================

function createButton(
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


function createSummaryCard(summary) {
  const article = document.createElement("article");
  article.className = "admin-summary-card";

  const cover = document.createElement("div");
  cover.className = "admin-summary-cover";

  if (summary.capa_url) {
    const image = document.createElement("img");

    image.src = summary.capa_url;
    image.alt = `Capa do resumo ${summary.titulo}`;

    cover.append(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = "I.";

    cover.append(placeholder);
  }

  const content = document.createElement("div");
  content.className = "admin-summary-content";

  const heading = document.createElement("div");
  heading.className = "admin-summary-heading";

  const status = document.createElement("span");

  status.className =
    `admin-summary-status ${summary.status}`;

  status.textContent =
    getStatusLabel(summary.status);

  const date = document.createElement("small");

  date.textContent =
    summary.status === "publicado"
      ? `Publicado em ${formatDate(summary.publicado_em)}`
      : `Atualizado em ${formatDate(summary.atualizado_em)}`;

  heading.append(status, date);

  const title = document.createElement("h2");
  title.textContent = summary.titulo;

  const metadata = document.createElement("p");
  metadata.className = "admin-summary-metadata";

  metadata.textContent = [
    summary.disciplina,
    summary.categoria,
    summary.semestre
  ]
    .filter(Boolean)
    .join(" · ") || "Informações não preenchidas";

  const description = document.createElement("p");
  description.className = "admin-summary-description";

  description.textContent =
    summary.descricao ||
    "Este resumo ainda não possui uma descrição.";

  const actions = document.createElement("div");
  actions.className = "admin-summary-actions";

  const editLink = document.createElement("a");

  editLink.href =
    `./resumo-formulario.html?id=${summary.id}`;

  editLink.textContent = "Editar";

  actions.append(editLink);

  if (summary.status !== "publicado") {
    actions.append(
      createButton(
        "Publicar",
        "publish",
        summary.id
      )
    );
  }

  if (summary.status === "publicado") {
    actions.append(
      createButton(
        "Arquivar",
        "archive",
        summary.id
      )
    );
  }

  if (summary.status === "arquivado") {
    actions.append(
      createButton(
        "Transformar em rascunho",
        "draft",
        summary.id
      )
    );
  }

  actions.append(
    createButton(
      "Excluir",
      "delete",
      summary.id,
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
// FILTROS E RENDERIZAÇÃO
// ======================================================

function getFilteredSummaries() {
  const search = normalizeSearch(
    summarySearch.value
  );

  const status = summaryStatus.value;

  return summaries.filter((summary) => {
    const searchableText = normalizeSearch(
      [
        summary.titulo,
        summary.disciplina,
        summary.categoria,
        summary.semestre
      ].join(" ")
    );

    const matchesSearch =
      !search ||
      searchableText.includes(search);

    const matchesStatus =
      !status ||
      summary.status === status;

    return matchesSearch && matchesStatus;
  });
}


function renderSummaries() {
  const filteredSummaries =
    getFilteredSummaries();

  summariesList.replaceChildren();

  summariesCounter.textContent =
    filteredSummaries.length === 1
      ? "1 resumo encontrado"
      : `${filteredSummaries.length} resumos encontrados`;

  const hasSummaries = summaries.length > 0;
  const hasResults = filteredSummaries.length > 0;

  summariesEmpty.hidden = hasSummaries;
  summariesNoResults.hidden =
    !hasSummaries || hasResults;

  summariesList.hidden = !hasResults;

  filteredSummaries.forEach((summary) => {
    summariesList.append(
      createSummaryCard(summary)
    );
  });
}


// ======================================================
// CARREGAMENTO
// ======================================================

async function loadSummaries() {
  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("resumos")
      .select("*")
      .order("atualizado_em", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    summaries = data || [];

    summariesLoading.hidden = true;

    renderSummaries();
  } catch (error) {
    console.error(
      "Erro ao carregar resumos:",
      error
    );

    summariesLoading.textContent =
      "Não foi possível carregar os resumos.";

    showSummariesMessage(
      error.message ||
      "Ocorreu um erro ao carregar os resumos."
    );
  }
}


// ======================================================
// ALTERAÇÃO DE STATUS
// ======================================================

async function updateSummaryStatus(
  summary,
  newStatus
) {
  const payload = {
    status: newStatus
  };

  if (
    newStatus === "publicado" &&
    !summary.publicado_em
  ) {
    payload.publicado_em =
      new Date().toISOString();
  }

  const {
    error
  } = await window.supabaseClient
    .from("resumos")
    .update(payload)
    .eq("id", summary.id);

  if (error) {
    throw error;
  }
}


// ======================================================
// EXCLUSÃO
// ======================================================

async function getSummaryFiles(summary) {
  const {
    data,
    error
  } = await window.supabaseClient
    .from("imagens_resumo")
    .select("imagem_path")
    .eq("resumo_id", summary.id);

  if (error) {
    throw error;
  }

  return [
    summary.capa_path,
    summary.pdf_path,
    ...(data || []).map(
      (image) => image.imagem_path
    )
  ].filter(Boolean);
}


async function removeStorageFiles(paths) {
  if (!paths.length) {
    return true;
  }

  const {
    error
  } = await window.supabaseClient.storage
    .from("portfolio-publico")
    .remove(paths);

  if (error) {
    console.error(
      "Não foi possível remover alguns arquivos:",
      error
    );

    return false;
  }

  return true;
}


async function deleteSummary(summary) {
  const files = await getSummaryFiles(summary);

  const {
    error
  } = await window.supabaseClient
    .from("resumos")
    .delete()
    .eq("id", summary.id);

  if (error) {
    throw error;
  }

  return removeStorageFiles(files);
}


// ======================================================
// EVENTOS
// ======================================================

summarySearch?.addEventListener(
  "input",
  renderSummaries
);

summaryStatus?.addEventListener(
  "change",
  renderSummaries
);

clearSummaryFilters?.addEventListener(
  "click",
  () => {
    summarySearch.value = "";
    summaryStatus.value = "";

    renderSummaries();
  }
);


summariesList?.addEventListener(
  "click",
  async (event) => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) {
      return;
    }

    const summary = summaries.find(
      (item) => item.id === button.dataset.id
    );

    if (!summary) {
      return;
    }

    hideSummariesMessage();

    const action = button.dataset.action;
    button.disabled = true;

    try {
      if (action === "publish") {
        await updateSummaryStatus(
          summary,
          "publicado"
        );

        await loadSummaries();

        showSummariesMessage(
          "Resumo publicado com sucesso.",
          "success"
        );
      }

      if (action === "archive") {
        await updateSummaryStatus(
          summary,
          "arquivado"
        );

        await loadSummaries();

        showSummariesMessage(
          "Resumo arquivado. Ele não aparecerá no site público.",
          "success"
        );
      }

      if (action === "draft") {
        await updateSummaryStatus(
          summary,
          "rascunho"
        );

        await loadSummaries();

        showSummariesMessage(
          "Resumo transformado em rascunho.",
          "success"
        );
      }

      if (action === "delete") {
        const confirmed = window.confirm(
          `Deseja excluir definitivamente o resumo “${summary.titulo}”?`
        );

        if (!confirmed) {
          return;
        }

        const filesRemoved =
          await deleteSummary(summary);

        await loadSummaries();

        if (filesRemoved) {
          showSummariesMessage(
            "Resumo e arquivos excluídos com sucesso.",
            "success"
          );
        } else {
          showSummariesMessage(
            "O resumo foi excluído, mas alguns arquivos podem ter permanecido no armazenamento."
          );
        }
      }
    } catch (error) {
      console.error(
        "Erro ao alterar resumo:",
        error
      );

      showSummariesMessage(
        error.message ||
        "Não foi possível realizar esta operação."
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

loadSummaries();