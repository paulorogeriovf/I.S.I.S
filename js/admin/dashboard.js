// ======================================================
// DASHBOARD ADMINISTRATIVO
// ======================================================

const publishedSummariesElement = document.querySelector(
  "#published-summaries"
);

const draftSummariesElement = document.querySelector(
  "#draft-summaries"
);

const publishedCertificatesElement = document.querySelector(
  "#published-certificates"
);

const totalContentElement = document.querySelector(
  "#total-content"
);

const dashboardError = document.querySelector(
  "#dashboard-error"
);

const recentLoading = document.querySelector(
  "#recent-loading"
);

const recentPublications = document.querySelector(
  "#recent-publications"
);

const recentEmpty = document.querySelector(
  "#recent-empty"
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


/**
 * Conta os registros de uma tabela.
 */
async function countRecords(table, filters = {}) {
  let query = window.supabaseClient
    .from(table)
    .select("*", {
      count: "exact",
      head: true
    });

  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}


/**
 * Formata uma data para o padrão brasileiro.
 */
function formatDashboardDate(date) {
  if (!date) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(date)
  );
}


/**
 * Cria a lista de publicações recentes.
 */
function renderRecentPublications(items) {
  recentPublications.innerHTML = "";

  if (items.length === 0) {
    recentLoading.hidden = true;
    recentPublications.hidden = true;
    recentEmpty.hidden = false;
    return;
  }

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "recent-item";

    const icon = document.createElement("span");
    icon.className = "recent-item-icon";
    icon.textContent = item.type === "Resumo" ? "□" : "◇";

    const content = document.createElement("div");
    content.className = "recent-item-content";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const information = document.createElement("span");
    information.textContent =
      `${item.type} · ${item.status}`;

    const date = document.createElement("span");
    date.className = "recent-item-date";
    date.textContent = formatDashboardDate(item.date);

    content.appendChild(title);
    content.appendChild(information);

    article.appendChild(icon);
    article.appendChild(content);
    article.appendChild(date);

    recentPublications.appendChild(article);
  });

  recentLoading.hidden = true;
  recentEmpty.hidden = true;
  recentPublications.hidden = false;
}


/**
 * Carrega os cards e conteúdos recentes.
 */
async function loadDashboard() {
  try {
    const [
      publishedSummaries,
      draftSummaries,
      totalSummaries,
      publishedCertificates,
      totalCertificates,
      summariesResult,
      certificatesResult
    ] = await Promise.all([
      countRecords("resumos", {
        status: "publicado"
      }),

      countRecords("resumos", {
        status: "rascunho"
      }),

      countRecords("resumos"),

      countRecords("certificados", {
        status: "publicado"
      }),

      countRecords("certificados"),

      window.supabaseClient
        .from("resumos")
        .select("id, titulo, status, criado_em")
        .order("criado_em", {
          ascending: false
        })
        .limit(5),

      window.supabaseClient
        .from("certificados")
        .select("id, titulo, status, criado_em")
        .order("criado_em", {
          ascending: false
        })
        .limit(5)
    ]);

    if (summariesResult.error) {
      throw summariesResult.error;
    }

    if (certificatesResult.error) {
      throw certificatesResult.error;
    }

    publishedSummariesElement.textContent =
      publishedSummaries;

    draftSummariesElement.textContent =
      draftSummaries;

    publishedCertificatesElement.textContent =
      publishedCertificates;

    totalContentElement.textContent =
      totalSummaries + totalCertificates;

    const recentItems = [
      ...summariesResult.data.map((summary) => ({
        id: summary.id,
        title: summary.titulo,
        status: summary.status,
        date: summary.criado_em,
        type: "Resumo"
      })),

      ...certificatesResult.data.map((certificate) => ({
        id: certificate.id,
        title: certificate.titulo,
        status: certificate.status,
        date: certificate.criado_em,
        type: "Certificado"
      }))
    ]
      .sort(
        (firstItem, secondItem) =>
          new Date(secondItem.date) -
          new Date(firstItem.date)
      )
      .slice(0, 5);

    renderRecentPublications(recentItems);
  } catch (error) {
    console.error(
      "Erro ao carregar o dashboard:",
      error
    );

    dashboardError.hidden = false;
    recentLoading.hidden = true;
    recentEmpty.hidden = false;

    publishedSummariesElement.textContent = "—";
    draftSummariesElement.textContent = "—";
    publishedCertificatesElement.textContent = "—";
    totalContentElement.textContent = "—";
  }
}


/**
 * Abre ou fecha o menu no celular.
 */
function toggleAdminMenu() {
  const isOpen = adminSidebar.classList.toggle("open");

  adminSidebarOverlay.classList.toggle("open", isOpen);

  adminMenuButton.setAttribute(
    "aria-expanded",
    String(isOpen)
  );
}


/**
 * Fecha o menu no celular.
 */
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


loadDashboard();