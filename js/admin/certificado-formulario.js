// ======================================================
// CADASTRO E EDIÇÃO DE CERTIFICADOS
// ======================================================

const parameters = new URLSearchParams(
  window.location.search
);

const certificateIdFromUrl =
  parameters.get("id");

const certificateForm = document.querySelector(
  "#certificate-form"
);

const formLoading = document.querySelector(
  "#certificate-form-loading"
);

const formHeading = document.querySelector(
  "#certificate-form-heading"
);

const topbarTitle = document.querySelector(
  "#certificate-topbar-title"
);

const formMessage = document.querySelector(
  "#certificate-form-message"
);

const formMessageIcon = document.querySelector(
  "#certificate-form-message-icon"
);

const formMessageText = document.querySelector(
  "#certificate-form-message-text"
);

const saveButton = document.querySelector(
  "#save-certificate"
);

const saveButtonText = document.querySelector(
  "#save-certificate-text"
);

const fileInput = document.querySelector(
  "#certificate-file"
);

const previewImage = document.querySelector(
  "#certificate-preview-image"
);

const previewPlaceholder = document.querySelector(
  "#certificate-preview-placeholder"
);

const currentFileLink = document.querySelector(
  "#current-certificate-file"
);

const removeFileButton = document.querySelector(
  "#remove-certificate-file"
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
  title: document.querySelector(
    "#certificate-title"
  ),

  institution: document.querySelector(
    "#certificate-institution"
  ),

  workload: document.querySelector(
    "#certificate-workload"
  ),

  date: document.querySelector(
    "#certificate-date"
  ),

  status: document.querySelector(
    "#certificate-status"
  ),

  description: document.querySelector(
    "#certificate-description"
  ),

  validationLink: document.querySelector(
    "#certificate-validation-link"
  ),

  validationCode: document.querySelector(
    "#certificate-validation-code"
  )
};


let currentCertificate = null;
let temporaryImageUrl = null;


// ======================================================
// MENSAGENS
// ======================================================

function showCertificateFormMessage(
  message,
  type = "error"
) {
  formMessage.hidden = false;
  formMessage.dataset.type = type;
  formMessageText.textContent = message;

  formMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


function hideCertificateFormMessage() {
  formMessage.hidden = true;
  formMessageText.textContent = "";

  delete formMessage.dataset.type;
}


// ======================================================
// EXIBIÇÃO DO ARQUIVO
// ======================================================

function clearTemporaryImageUrl() {
  if (!temporaryImageUrl) {
    return;
  }

  URL.revokeObjectURL(temporaryImageUrl);
  temporaryImageUrl = null;
}


function showCertificateFile(
  url,
  type
) {
  if (!url) {
    previewImage.hidden = true;
    previewImage.removeAttribute("src");

    previewPlaceholder.textContent = "◇";
    previewPlaceholder.hidden = false;

    currentFileLink.hidden = true;
    currentFileLink.removeAttribute("href");

    return;
  }

  currentFileLink.href = url;
  currentFileLink.hidden = false;

  if (type === "imagem") {
    previewImage.src = url;
    previewImage.hidden = false;
    previewPlaceholder.hidden = true;

    return;
  }

  previewImage.hidden = true;
  previewImage.removeAttribute("src");

  previewPlaceholder.textContent = "PDF";
  previewPlaceholder.hidden = false;
}


function updateRemoveFileButton() {
  removeFileButton.hidden =
    !currentCertificate?.arquivo_path;
}


// ======================================================
// VALIDAÇÃO
// ======================================================

function getCertificateFileType(file) {
  if (
    [
      "image/jpeg",
      "image/png",
      "image/webp"
    ].includes(file.type)
  ) {
    return "imagem";
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  return null;
}


function getCertificateExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf"
  };

  return extensions[file.type];
}


function validateCertificateFile(file) {
  const type = getCertificateFileType(file);

  if (!type) {
    throw new Error(
      "Selecione uma imagem JPG, PNG, WEBP ou um PDF."
    );
  }

  const maximumSize =
    type === "pdf"
      ? 15 * 1024 * 1024
      : 5 * 1024 * 1024;

  if (file.size > maximumSize) {
    throw new Error(
      type === "pdf"
        ? "O PDF excede o limite de 15 MB."
        : "A imagem excede o limite de 5 MB."
    );
  }

  return type;
}


// ======================================================
// STORAGE
// ======================================================

async function uploadCertificateFile(
  file,
  certificateId
) {
  const type = validateCertificateFile(file);
  const extension =
    getCertificateExtension(file);

  const path =
    `certificados/${certificateId}/` +
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
    url: data.publicUrl,
    type
  };
}


async function removeCertificateStorageFile(path) {
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
      "Erro ao remover arquivo:",
      error
    );

    return false;
  }

  return true;
}


// ======================================================
// PREENCHIMENTO
// ======================================================

function fillCertificate(certificate) {
  fields.title.value =
    certificate.titulo || "";

  fields.institution.value =
    certificate.instituicao || "";

  fields.workload.value =
    certificate.carga_horaria ?? "";

  fields.date.value =
    certificate.data_conclusao || "";

  fields.status.value =
    certificate.status || "rascunho";

  fields.description.value =
    certificate.descricao || "";

  fields.validationLink.value =
    certificate.link_validacao || "";

  fields.validationCode.value =
    certificate.codigo_validacao || "";

  showCertificateFile(
    certificate.arquivo_url,
    certificate.arquivo_tipo
  );

  updateRemoveFileButton();
}


// ======================================================
// CARREGAMENTO
// ======================================================

async function loadCertificate() {
  if (!certificateIdFromUrl) {
    showCertificateFile(null, null);
    updateRemoveFileButton();

    return;
  }

  certificateForm.hidden = true;
  formLoading.hidden = false;

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("certificados")
      .select("*")
      .eq("id", certificateIdFromUrl)
      .single();

    if (error) {
      throw error;
    }

    currentCertificate = data;
    fillCertificate(currentCertificate);

    formHeading.textContent =
      "Editar certificado.";

    topbarTitle.textContent =
      "Edição de certificado";

    document.title =
      `Editar ${currentCertificate.titulo} | I.S.I.S.`;

    formLoading.hidden = true;
    certificateForm.hidden = false;
  } catch (error) {
    console.error(
      "Erro ao carregar certificado:",
      error
    );

    formLoading.textContent =
      "Não foi possível carregar o certificado.";

    showCertificateFormMessage(
      "O certificado solicitado não foi encontrado."
    );
  }
}


// ======================================================
// PRÉVIA
// ======================================================

fileInput?.addEventListener(
  "change",
  () => {
    const file = fileInput.files[0];

    clearTemporaryImageUrl();

    if (!file) {
      showCertificateFile(
        currentCertificate?.arquivo_url,
        currentCertificate?.arquivo_tipo
      );

      return;
    }

    try {
      const type =
        validateCertificateFile(file);

      if (type === "imagem") {
        temporaryImageUrl =
          URL.createObjectURL(file);

        showCertificateFile(
          temporaryImageUrl,
          "imagem"
        );
      } else {
        showCertificateFile(
          "#",
          "pdf"
        );

        currentFileLink.hidden = true;
      }

      hideCertificateFormMessage();
    } catch (error) {
      fileInput.value = "";

      showCertificateFile(
        currentCertificate?.arquivo_url,
        currentCertificate?.arquivo_tipo
      );

      showCertificateFormMessage(
        error.message
      );
    }
  }
);


// ======================================================
// SALVAMENTO
// ======================================================

certificateForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();
    hideCertificateFormMessage();

    saveButton.disabled = true;
    saveButtonText.textContent =
      "Salvando...";

    const certificateId =
      currentCertificate?.id ||
      crypto.randomUUID();

    const file = fileInput.files[0];
    let newFile = null;

    try {
      if (file) {
        newFile =
          await uploadCertificateFile(
            file,
            certificateId
          );
      }

      const selectedStatus =
        fields.status.value;

      const workloadValue =
        fields.workload.value.trim();

      const payload = {
        id: certificateId,
        titulo:
          fields.title.value.trim(),

        instituicao:
          fields.institution.value.trim(),

        descricao:
          fields.description.value.trim() ||
          null,

        carga_horaria:
          workloadValue === ""
            ? null
            : Number(workloadValue),

        data_conclusao:
          fields.date.value || null,

        link_validacao:
          fields.validationLink.value.trim() ||
          null,

        codigo_validacao:
          fields.validationCode.value.trim() ||
          null,

        status: selectedStatus,

        publicado_em:
          selectedStatus === "publicado"
            ? (
              currentCertificate?.publicado_em ||
              new Date().toISOString()
            )
            : currentCertificate?.publicado_em || null,

        arquivo_url:
          newFile?.url ||
          currentCertificate?.arquivo_url ||
          null,

        arquivo_path:
          newFile?.path ||
          currentCertificate?.arquivo_path ||
          null,

        arquivo_tipo:
          newFile?.type ||
          currentCertificate?.arquivo_tipo ||
          null
      };

      let result;

      if (currentCertificate) {
        delete payload.id;

        result = await window.supabaseClient
          .from("certificados")
          .update(payload)
          .eq("id", currentCertificate.id)
          .select()
          .single();
      } else {
        result = await window.supabaseClient
          .from("certificados")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      const oldFilePath =
        currentCertificate?.arquivo_path;

      currentCertificate = result.data;

      if (
        newFile &&
        oldFilePath &&
        oldFilePath !== newFile.path
      ) {
        await removeCertificateStorageFile(
          oldFilePath
        );
      }

      clearTemporaryImageUrl();
      fileInput.value = "";

      fillCertificate(currentCertificate);

      formHeading.textContent =
        "Editar certificado.";

      topbarTitle.textContent =
        "Edição de certificado";

      window.history.replaceState(
        {},
        "",
        `./certificado-formulario.html?id=${currentCertificate.id}`
      );

      showCertificateFormMessage(
        "Certificado salvo com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao salvar certificado:",
        error
      );

      if (newFile?.path) {
        await removeCertificateStorageFile(
          newFile.path
        );
      }

      showCertificateFormMessage(
        error.message ||
        "Não foi possível salvar o certificado."
      );
    } finally {
      saveButton.disabled = false;
      saveButtonText.textContent =
        "Salvar certificado";
    }
  }
);


// ======================================================
// REMOÇÃO DO ARQUIVO
// ======================================================

removeFileButton?.addEventListener(
  "click",
  async () => {
    if (!currentCertificate?.arquivo_path) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja remover o arquivo atual do certificado?"
    );

    if (!confirmed) {
      return;
    }

    removeFileButton.disabled = true;
    saveButton.disabled = true;

    const oldPath =
      currentCertificate.arquivo_path;

    try {
      const {
        data,
        error
      } = await window.supabaseClient
        .from("certificados")
        .update({
          arquivo_url: null,
          arquivo_path: null,
          arquivo_tipo: null
        })
        .eq("id", currentCertificate.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const removed =
        await removeCertificateStorageFile(
          oldPath
        );

      currentCertificate = data;

      clearTemporaryImageUrl();
      fileInput.value = "";

      showCertificateFile(null, null);
      updateRemoveFileButton();

      showCertificateFormMessage(
        removed
          ? "Arquivo removido com sucesso."
          : "O arquivo foi retirado do certificado, mas pode ter permanecido no armazenamento.",
        removed ? "success" : "error"
      );
    } catch (error) {
      console.error(
        "Erro ao remover arquivo:",
        error
      );

      showCertificateFormMessage(
        "Não foi possível remover o arquivo."
      );
    } finally {
      removeFileButton.disabled = false;
      saveButton.disabled = false;
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

loadCertificate();