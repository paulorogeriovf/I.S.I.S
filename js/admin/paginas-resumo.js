// ======================================================
// PÁGINAS DOS RESUMOS
// ======================================================

const pagesLocked = document.querySelector(
  "#summary-pages-locked"
);

const pagesContent = document.querySelector(
  "#summary-pages-content"
);

const pagesInput = document.querySelector(
  "#summary-pages-files"
);

const uploadPagesButton = document.querySelector(
  "#upload-summary-pages"
);

const pagesGrid = document.querySelector(
  "#summary-pages-admin-grid"
);

const pagesEmpty = document.querySelector(
  "#summary-pages-admin-empty"
);


let managedSummaryId = null;
let summaryPages = [];


// ======================================================
// MENSAGENS
// ======================================================

function showPagesMessage(
  message,
  type = "error"
) {
  const container = document.querySelector(
    "#summary-form-message"
  );

  const icon = document.querySelector(
    "#summary-form-message-icon"
  );

  const text = document.querySelector(
    "#summary-form-message-text"
  );

  if (!container || !icon || !text) {
    return;
  }

  container.hidden = false;
  container.dataset.type = type;
  text.textContent = message;

  icon.textContent =
    type === "success" ? "✓" : "!";
}


function hidePagesMessage() {
  const container = document.querySelector(
    "#summary-form-message"
  );

  if (container) {
    container.hidden = true;
  }
}


// ======================================================
// ARQUIVOS
// ======================================================

function validatePageFile(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `O arquivo “${file.name}” não possui um formato permitido.`
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      `O arquivo “${file.name}” excede 5 MB.`
    );
  }
}


function getPageExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return extensions[file.type];
}


async function uploadPageFile(file) {
  const extension = getPageExtension(file);

  const path =
    `resumos/${managedSummaryId}/paginas/` +
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


async function removePageFile(path) {
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
      "Erro ao remover imagem:",
      error
    );

    return false;
  }

  return true;
}


// ======================================================
// RENDERIZAÇÃO
// ======================================================

function createPageButton(
  label,
  action,
  pageId,
  disabled = false,
  className = ""
) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = pageId;
  button.disabled = disabled;

  if (className) {
    button.className = className;
  }

  return button;
}


function createPageCard(page, index) {
  const article = document.createElement("article");
  article.className = "summary-page-admin-card";

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "summary-page-admin-image";

  const image = document.createElement("img");

  image.src = page.imagem_url;
  image.alt =
    page.texto_alternativo ||
    `Página ${index + 1} do resumo`;

  imageWrapper.append(image);

  const information = document.createElement("div");
  information.className =
    "summary-page-admin-information";

  const number = document.createElement("strong");
  number.textContent = `Página ${index + 1}`;

  const alternativeText =
    document.createElement("p");

  alternativeText.textContent =
    page.texto_alternativo ||
    "Sem texto alternativo personalizado.";

  const actions = document.createElement("div");
  actions.className = "summary-page-admin-actions";

  actions.append(
    createPageButton(
      "↑",
      "move-up",
      page.id,
      index === 0
    ),
    createPageButton(
      "↓",
      "move-down",
      page.id,
      index === summaryPages.length - 1
    ),
    createPageButton(
      "Editar descrição",
      "edit-alt",
      page.id
    ),
    createPageButton(
      "Excluir",
      "delete",
      page.id,
      false,
      "danger"
    )
  );

  information.append(
    number,
    alternativeText,
    actions
  );

  article.append(
    imageWrapper,
    information
  );

  return article;
}


function renderSummaryPages() {
  pagesGrid.replaceChildren();

  pagesEmpty.hidden =
    summaryPages.length > 0;

  pagesGrid.hidden =
    summaryPages.length === 0;

  summaryPages.forEach((page, index) => {
    pagesGrid.append(
      createPageCard(page, index)
    );
  });
}


// ======================================================
// CARREGAMENTO
// ======================================================

async function loadSummaryPages() {
  if (!managedSummaryId) {
    pagesLocked.hidden = false;
    pagesContent.hidden = true;

    return;
  }

  pagesLocked.hidden = true;
  pagesContent.hidden = false;

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("imagens_resumo")
      .select("*")
      .eq("resumo_id", managedSummaryId)
      .order("ordem", {
        ascending: true
      });

    if (error) {
      throw error;
    }

    summaryPages = data || [];

    renderSummaryPages();
  } catch (error) {
    console.error(
      "Erro ao carregar páginas:",
      error
    );

    showPagesMessage(
      "Não foi possível carregar as páginas do resumo."
    );
  }
}


// ======================================================
// ENVIO DAS PÁGINAS
// ======================================================

uploadPagesButton?.addEventListener(
  "click",
  async () => {
    const files = Array.from(
      pagesInput.files || []
    );

    if (!managedSummaryId) {
      showPagesMessage(
        "Salve o resumo antes de enviar páginas."
      );

      return;
    }

    if (!files.length) {
      showPagesMessage(
        "Selecione pelo menos uma imagem."
      );

      return;
    }

    try {
      files.forEach(validatePageFile);
    } catch (error) {
      showPagesMessage(error.message);

      return;
    }

    hidePagesMessage();

    uploadPagesButton.disabled = true;
    uploadPagesButton.textContent =
      "Enviando...";

    let nextOrder =
      summaryPages.length > 0
        ? Math.max(
          ...summaryPages.map(
            (page) => page.ordem
          )
        ) + 1
        : 1;

    let uploadedCount = 0;

    try {
      for (const file of files) {
        let uploadedFile = null;

        try {
          uploadedFile =
            await uploadPageFile(file);

          const {
            error
          } = await window.supabaseClient
            .from("imagens_resumo")
            .insert({
              resumo_id: managedSummaryId,
              imagem_url: uploadedFile.url,
              imagem_path: uploadedFile.path,
              ordem: nextOrder,
              texto_alternativo:
                `Página ${nextOrder} do resumo`
            });

          if (error) {
            throw error;
          }

          nextOrder += 1;
          uploadedCount += 1;
        } catch (error) {
          if (uploadedFile?.path) {
            await removePageFile(
              uploadedFile.path
            );
          }

          throw error;
        }
      }

      pagesInput.value = "";

      await loadSummaryPages();

      showPagesMessage(
        uploadedCount === 1
          ? "1 página enviada com sucesso."
          : `${uploadedCount} páginas enviadas com sucesso.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao enviar páginas:",
        error
      );

      await loadSummaryPages();

      showPagesMessage(
        uploadedCount > 0
          ? `${uploadedCount} página(s) foram enviadas, mas ocorreu um erro no restante.`
          : "Não foi possível enviar as páginas."
      );
    } finally {
      uploadPagesButton.disabled = false;
      uploadPagesButton.textContent =
        "Enviar páginas";
    }
  }
);


// ======================================================
// REORDENAÇÃO
// ======================================================

async function swapPageOrder(
  firstPage,
  secondPage
) {
  const temporaryOrder =
    Math.max(
      ...summaryPages.map(
        (page) => page.ordem
      )
    ) + 1000;

  let result = await window.supabaseClient
    .from("imagens_resumo")
    .update({
      ordem: temporaryOrder
    })
    .eq("id", firstPage.id);

  if (result.error) {
    throw result.error;
  }

  result = await window.supabaseClient
    .from("imagens_resumo")
    .update({
      ordem: firstPage.ordem
    })
    .eq("id", secondPage.id);

  if (result.error) {
    throw result.error;
  }

  result = await window.supabaseClient
    .from("imagens_resumo")
    .update({
      ordem: secondPage.ordem
    })
    .eq("id", firstPage.id);

  if (result.error) {
    throw result.error;
  }
}


// ======================================================
// AÇÕES DAS PÁGINAS
// ======================================================

pagesGrid?.addEventListener(
  "click",
  async (event) => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) {
      return;
    }

    const pageIndex = summaryPages.findIndex(
      (page) => page.id === button.dataset.id
    );

    if (pageIndex < 0) {
      return;
    }

    const page = summaryPages[pageIndex];
    const action = button.dataset.action;

    hidePagesMessage();

    if (action === "edit-alt") {
      const newText = window.prompt(
        "Descrição da imagem para acessibilidade:",
        page.texto_alternativo || ""
      );

      if (newText === null) {
        return;
      }

      button.disabled = true;

      try {
        const {
          error
        } = await window.supabaseClient
          .from("imagens_resumo")
          .update({
            texto_alternativo:
              newText.trim() || null
          })
          .eq("id", page.id);

        if (error) {
          throw error;
        }

        await loadSummaryPages();

        showPagesMessage(
          "Descrição da página atualizada.",
          "success"
        );
      } catch (error) {
        console.error(
          "Erro ao atualizar descrição:",
          error
        );

        showPagesMessage(
          "Não foi possível atualizar a descrição."
        );
      } finally {
        button.disabled = false;
      }

      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(
        `Deseja excluir a página ${pageIndex + 1}?`
      );

      if (!confirmed) {
        return;
      }

      button.disabled = true;

      try {
        const {
          error
        } = await window.supabaseClient
          .from("imagens_resumo")
          .delete()
          .eq("id", page.id);

        if (error) {
          throw error;
        }

        const fileRemoved =
          await removePageFile(
            page.imagem_path
          );

        await normalizePageOrders();
        await loadSummaryPages();

        showPagesMessage(
          fileRemoved
            ? "Página excluída com sucesso."
            : "A página foi excluída, mas o arquivo pode ter permanecido no armazenamento.",
          fileRemoved ? "success" : "error"
        );
      } catch (error) {
        console.error(
          "Erro ao excluir página:",
          error
        );

        showPagesMessage(
          "Não foi possível excluir a página."
        );
      } finally {
        button.disabled = false;
      }

      return;
    }

    let targetPage = null;

    if (
      action === "move-up" &&
      pageIndex > 0
    ) {
      targetPage =
        summaryPages[pageIndex - 1];
    }

    if (
      action === "move-down" &&
      pageIndex < summaryPages.length - 1
    ) {
      targetPage =
        summaryPages[pageIndex + 1];
    }

    if (!targetPage) {
      return;
    }

    button.disabled = true;

    try {
      await swapPageOrder(
        page,
        targetPage
      );

      await loadSummaryPages();

      showPagesMessage(
        "Ordem das páginas atualizada.",
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao reordenar páginas:",
        error
      );

      showPagesMessage(
        "Não foi possível alterar a ordem das páginas."
      );
    } finally {
      button.disabled = false;
    }
  }
);


// ======================================================
// NORMALIZAÇÃO APÓS EXCLUSÃO
// ======================================================

async function normalizePageOrders() {
  const {
    data,
    error
  } = await window.supabaseClient
    .from("imagens_resumo")
    .select("id, ordem")
    .eq("resumo_id", managedSummaryId)
    .order("ordem", {
      ascending: true
    });

  if (error) {
    throw error;
  }

  const pages = data || [];

  for (
    let index = 0;
    index < pages.length;
    index += 1
  ) {
    const expectedOrder = index + 1;

    if (pages[index].ordem === expectedOrder) {
      continue;
    }

    const temporaryOrder =
      100000 + expectedOrder;

    let result = await window.supabaseClient
      .from("imagens_resumo")
      .update({
        ordem: temporaryOrder
      })
      .eq("id", pages[index].id);

    if (result.error) {
      throw result.error;
    }
  }

  for (
    let index = 0;
    index < pages.length;
    index += 1
  ) {
    const result = await window.supabaseClient
      .from("imagens_resumo")
      .update({
        ordem: index + 1
      })
      .eq("id", pages[index].id);

    if (result.error) {
      throw result.error;
    }
  }
}


// ======================================================
// RESUMO SALVO
// ======================================================

window.addEventListener(
  "summarySaved",
  (event) => {
    managedSummaryId = event.detail.id;

    loadSummaryPages();
  }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

const initialParameters =
  new URLSearchParams(window.location.search);

managedSummaryId =
  initialParameters.get("id");

loadSummaryPages();