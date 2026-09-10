// ======================================================
// CADASTRO E EDIÇÃO DE RESUMOS
// ======================================================

const urlParameters = new URLSearchParams(
  window.location.search
);

const summaryIdFromUrl = urlParameters.get("id");

const summaryForm = document.querySelector(
  "#summary-form"
);

const summaryFormLoading = document.querySelector(
  "#summary-form-loading"
);

const summaryFormMessage = document.querySelector(
  "#summary-form-message"
);

const summaryFormMessageIcon = document.querySelector(
  "#summary-form-message-icon"
);

const summaryFormMessageText = document.querySelector(
  "#summary-form-message-text"
);

const summaryFormHeading = document.querySelector(
  "#summary-form-heading"
);

const summaryTopbarTitle = document.querySelector(
  "#summary-topbar-title"
);

const saveSummaryButton = document.querySelector(
  "#save-summary"
);

const saveSummaryText = document.querySelector(
  "#save-summary-text"
);

const coverInput = document.querySelector(
  "#summary-cover"
);

const pdfInput = document.querySelector(
  "#summary-pdf-file"
);

const coverImage = document.querySelector(
  "#summary-cover-image"
);

const coverPlaceholder = document.querySelector(
  "#summary-cover-placeholder"
);

const currentPdfLink = document.querySelector(
  "#current-summary-pdf"
);

const removeCoverButton = document.querySelector(
  "#remove-summary-cover"
);

const removePdfButton = document.querySelector(
  "#remove-summary-pdf"
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


const fields = {
  title: document.querySelector("#summary-title"),
  discipline: document.querySelector(
    "#summary-discipline"
  ),
  category: document.querySelector(
    "#summary-category"
  ),
  semester: document.querySelector(
    "#summary-semester"
  ),
  status: document.querySelector(
    "#summary-status"
  ),
  description: document.querySelector(
    "#summary-description"
  ),
  keywords: document.querySelector(
    "#summary-keywords"
  )
};


let currentSummary = null;
let temporaryCoverUrl = null;


// ======================================================
// MENSAGENS
// ======================================================

function showFormMessage(
  message,
  type = "error"
) {
  summaryFormMessage.hidden = false;
  summaryFormMessage.dataset.type = type;
  summaryFormMessageText.textContent = message;

  summaryFormMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


function hideFormMessage() {
  summaryFormMessage.hidden = true;
  summaryFormMessageText.textContent = "";

  delete summaryFormMessage.dataset.type;
}


// ======================================================
// ARQUIVOS
// ======================================================

function showCoverPreview(url) {
  if (!url) {
    coverImage.hidden = true;
    coverImage.removeAttribute("src");
    coverPlaceholder.hidden = false;

    return;
  }

  coverImage.src = url;
  coverImage.hidden = false;
  coverPlaceholder.hidden = true;
}


function showCurrentPdf(url) {
  if (!url) {
    currentPdfLink.hidden = true;
    currentPdfLink.removeAttribute("href");

    return;
  }

  currentPdfLink.href = url;
  currentPdfLink.hidden = false;
}


function updateFileButtons() {
  removeCoverButton.hidden =
    !currentSummary?.capa_path;

  removePdfButton.hidden =
    !currentSummary?.pdf_path;
}


function clearTemporaryCoverUrl() {
  if (!temporaryCoverUrl) {
    return;
  }

  URL.revokeObjectURL(temporaryCoverUrl);
  temporaryCoverUrl = null;
}


function validateFile(
  file,
  allowedTypes,
  maximumSize
) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Tipo de arquivo não permitido."
    );
  }

  if (file.size > maximumSize) {
    throw new Error(
      "O arquivo excede o tamanho permitido."
    );
  }
}


function getFileExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf"
  };

  return extensions[file.type];
}


async function uploadSummaryFile(
  file,
  summaryId,
  folder
) {
  const extension = getFileExtension(file);

  const path =
    `resumos/${summaryId}/${folder}/` +
    `${crypto.randomUUID()}.${extension}`;

  const {
    error
  } = await window.supabaseClient.storage
    .from("portfolio-publico")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const {
    data
  } = window.supabaseClient.storage
    .from("portfolio-publico")
    .getPublicUrl(path);

  return {
    path,
    url: data.publicUrl
  };
}


async function removeStorageFile(path) {
  if (!path) {
    return true;
  }

  const {
    error
  } = await window.supabaseClient.storage
    .from("portfolio-publico")
    .remove([path]);

  if (error) {
    console.error(
      "Erro ao excluir arquivo:",
      error
    );

    return false;
  }

  return true;
}


// ======================================================
// SLUG
// ======================================================

function createSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}


async function createUniqueSlug(title, summaryId) {
  const baseSlug =
    createSlug(title) || `resumo-${Date.now()}`;

  let slug = baseSlug;
  let counter = 2;
  let available = false;

  while (!available) {
    let query = window.supabaseClient
      .from("resumos")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (summaryId) {
      query = query.neq("id", summaryId);
    }

    const {
      data,
      error
    } = await query;

    if (error) {
      throw error;
    }

    if (!data.length) {
      available = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  return slug;
}


// ======================================================
// DADOS DO FORMULÁRIO
// ======================================================

function parseKeywords(value) {
  return [
    ...new Set(
      value
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    )
  ];
}


function fillSummary(summary) {
  fields.title.value =
    summary.titulo || "";

  fields.discipline.value =
    summary.disciplina || "";

  fields.category.value =
    summary.categoria || "";

  fields.semester.value =
    summary.semestre || "";

  fields.status.value =
    summary.status || "rascunho";

  fields.description.value =
    summary.descricao || "";

  fields.keywords.value =
    (summary.palavras_chave || []).join(", ");

  showCoverPreview(summary.capa_url);
  showCurrentPdf(summary.pdf_url);
  updateFileButtons();
}


// ======================================================
// CARREGAMENTO DA EDIÇÃO
// ======================================================

async function loadSummary() {
  if (!summaryIdFromUrl) {
    showCoverPreview(null);
    showCurrentPdf(null);
    updateFileButtons();

    return;
  }

  summaryForm.hidden = true;
  summaryFormLoading.hidden = false;

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("resumos")
      .select("*")
      .eq("id", summaryIdFromUrl)
      .single();

    if (error) {
      throw error;
    }

    currentSummary = data;

    fillSummary(currentSummary);

    summaryFormHeading.textContent =
      "Editar resumo.";

    summaryTopbarTitle.textContent =
      "Edição de resumo";

    document.title =
      `Editar ${currentSummary.titulo} | I.S.I.S.`;

    summaryFormLoading.hidden = true;
    summaryForm.hidden = false;
  } catch (error) {
    console.error(
      "Erro ao carregar resumo:",
      error
    );

    summaryFormLoading.textContent =
      "Não foi possível carregar o resumo.";

    showFormMessage(
      "O resumo solicitado não foi encontrado."
    );
  }
}


// ======================================================
// PRÉVIA DOS ARQUIVOS
// ======================================================

coverInput?.addEventListener("change", () => {
  const file = coverInput.files[0];

  clearTemporaryCoverUrl();

  if (!file) {
    showCoverPreview(
      currentSummary?.capa_url
    );

    return;
  }

  try {
    validateFile(
      file,
      [
        "image/jpeg",
        "image/png",
        "image/webp"
      ],
      5 * 1024 * 1024
    );

    temporaryCoverUrl =
      URL.createObjectURL(file);

    showCoverPreview(temporaryCoverUrl);
    hideFormMessage();
  } catch (error) {
    coverInput.value = "";

    showCoverPreview(
      currentSummary?.capa_url
    );

    showFormMessage(error.message);
  }
});


pdfInput?.addEventListener("change", () => {
  const file = pdfInput.files[0];

  if (!file) {
    return;
  }

  try {
    validateFile(
      file,
      ["application/pdf"],
      15 * 1024 * 1024
    );

    hideFormMessage();
  } catch (error) {
    pdfInput.value = "";
    showFormMessage(error.message);
  }
});


// ======================================================
// SALVAMENTO
// ======================================================

summaryForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();
    hideFormMessage();

    saveSummaryButton.disabled = true;
    saveSummaryText.textContent =
      "Salvando...";

    const summaryId =
      currentSummary?.id ||
      crypto.randomUUID();

    const coverFile = coverInput.files[0];
    const pdfFile = pdfInput.files[0];

    let newCover = null;
    let newPdf = null;

    try {
      if (coverFile) {
        validateFile(
          coverFile,
          [
            "image/jpeg",
            "image/png",
            "image/webp"
          ],
          5 * 1024 * 1024
        );

        newCover = await uploadSummaryFile(
          coverFile,
          summaryId,
          "capa"
        );
      }

      if (pdfFile) {
        validateFile(
          pdfFile,
          ["application/pdf"],
          15 * 1024 * 1024
        );

        newPdf = await uploadSummaryFile(
          pdfFile,
          summaryId,
          "pdf"
        );
      }

      const slug = await createUniqueSlug(
        fields.title.value.trim(),
        currentSummary?.id
      );

      const selectedStatus =
        fields.status.value;

      const payload = {
        id: summaryId,
        titulo: fields.title.value.trim(),
        slug,
        descricao:
          fields.description.value.trim() ||
          null,
        disciplina:
          fields.discipline.value.trim() ||
          null,
        categoria:
          fields.category.value.trim() ||
          null,
        semestre:
          fields.semester.value.trim() ||
          null,
        palavras_chave: parseKeywords(
          fields.keywords.value
        ),
        status: selectedStatus,
        publicado_em:
          selectedStatus === "publicado"
            ? (
              currentSummary?.publicado_em ||
              new Date().toISOString()
            )
            : currentSummary?.publicado_em || null,
        capa_url:
          newCover?.url ||
          currentSummary?.capa_url ||
          null,
        capa_path:
          newCover?.path ||
          currentSummary?.capa_path ||
          null,
        pdf_url:
          newPdf?.url ||
          currentSummary?.pdf_url ||
          null,
        pdf_path:
          newPdf?.path ||
          currentSummary?.pdf_path ||
          null
      };

      let result;

      if (currentSummary) {
        delete payload.id;

        result = await window.supabaseClient
          .from("resumos")
          .update(payload)
          .eq("id", currentSummary.id)
          .select()
          .single();
      } else {
        result = await window.supabaseClient
          .from("resumos")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      const oldCoverPath =
        currentSummary?.capa_path;

      const oldPdfPath =
        currentSummary?.pdf_path;

      currentSummary = result.data;

      if (
        newCover &&
        oldCoverPath &&
        oldCoverPath !== newCover.path
      ) {
        await removeStorageFile(
          oldCoverPath
        );
      }

      if (
        newPdf &&
        oldPdfPath &&
        oldPdfPath !== newPdf.path
      ) {
        await removeStorageFile(
          oldPdfPath
        );
      }

      clearTemporaryCoverUrl();

      coverInput.value = "";
      pdfInput.value = "";

      fillSummary(currentSummary);

      summaryFormHeading.textContent =
        "Editar resumo.";

      summaryTopbarTitle.textContent =
        "Edição de resumo";

      const newAddress =
        `./resumo-formulario.html?id=${currentSummary.id}`;

      window.history.replaceState(
        {},
        "",
        newAddress
      );

      showFormMessage(
        "Resumo salvo com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao salvar resumo:",
        error
      );

      if (newCover?.path) {
        await removeStorageFile(
          newCover.path
        );
      }

      if (newPdf?.path) {
        await removeStorageFile(
          newPdf.path
        );
      }

      showFormMessage(
        error.message ||
        "Não foi possível salvar o resumo."
      );
    } finally {
      saveSummaryButton.disabled = false;
      saveSummaryText.textContent =
        "Salvar resumo";
    }
  }
);


// ======================================================
// REMOÇÃO DA CAPA
// ======================================================

removeCoverButton?.addEventListener(
  "click",
  async () => {
    if (!currentSummary?.capa_path) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja remover a capa atual?"
    );

    if (!confirmed) {
      return;
    }

    removeCoverButton.disabled = true;
    hideFormMessage();

    const oldPath = currentSummary.capa_path;

    try {
      const {
        data,
        error
      } = await window.supabaseClient
        .from("resumos")
        .update({
          capa_url: null,
          capa_path: null
        })
        .eq("id", currentSummary.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const removed =
        await removeStorageFile(oldPath);

      currentSummary = data;

      coverInput.value = "";
      clearTemporaryCoverUrl();

      showCoverPreview(null);
      updateFileButtons();

      showFormMessage(
        removed
          ? "Capa removida com sucesso."
          : "A capa foi retirada do resumo, mas o arquivo não pôde ser apagado.",
        removed ? "success" : "error"
      );
    } catch (error) {
      console.error(
        "Erro ao remover capa:",
        error
      );

      showFormMessage(
        "Não foi possível remover a capa."
      );
    } finally {
      removeCoverButton.disabled = false;
    }
  }
);


// ======================================================
// REMOÇÃO DO PDF
// ======================================================

removePdfButton?.addEventListener(
  "click",
  async () => {
    if (!currentSummary?.pdf_path) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja remover o PDF atual?"
    );

    if (!confirmed) {
      return;
    }

    removePdfButton.disabled = true;
    hideFormMessage();

    const oldPath = currentSummary.pdf_path;

    try {
      const {
        data,
        error
      } = await window.supabaseClient
        .from("resumos")
        .update({
          pdf_url: null,
          pdf_path: null
        })
        .eq("id", currentSummary.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const removed =
        await removeStorageFile(oldPath);

      currentSummary = data;

      pdfInput.value = "";

      showCurrentPdf(null);
      updateFileButtons();

      showFormMessage(
        removed
          ? "PDF removido com sucesso."
          : "O PDF foi retirado do resumo, mas o arquivo não pôde ser apagado.",
        removed ? "success" : "error"
      );
    } catch (error) {
      console.error(
        "Erro ao remover PDF:",
        error
      );

      showFormMessage(
        "Não foi possível remover o PDF."
      );
    } finally {
      removePdfButton.disabled = false;
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

loadSummary();