// ======================================================
// CAPA DO CERTIFICADO
// ======================================================

const certificateCoverInput = document.querySelector(
  "#certificate-cover-file"
);

const certificateCoverImage = document.querySelector(
  "#certificate-cover-image"
);

const certificateCoverPlaceholder =
  document.querySelector(
    "#certificate-cover-placeholder"
  );

const uploadCertificateCoverButton =
  document.querySelector(
    "#upload-certificate-cover"
  );

const removeCertificateCoverButton =
  document.querySelector(
    "#remove-certificate-cover"
  );


let currentCertificateCover = {
  url: null,
  path: null
};

let temporaryCertificateCoverUrl = null;


// ======================================================
// IDENTIFICADOR
// ======================================================

function getCurrentCertificateId() {
  const parameters = new URLSearchParams(
    window.location.search
  );

  return parameters.get("id");
}


// ======================================================
// MENSAGENS
// ======================================================

function showCertificateCoverMessage(
  message,
  type = "error"
) {
  const container = document.querySelector(
    "#certificate-form-message"
  );

  const icon = document.querySelector(
    "#certificate-form-message-icon"
  );

  const text = document.querySelector(
    "#certificate-form-message-text"
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


// ======================================================
// PRÉVIA
// ======================================================

function clearTemporaryCertificateCover() {
  if (!temporaryCertificateCoverUrl) {
    return;
  }

  URL.revokeObjectURL(
    temporaryCertificateCoverUrl
  );

  temporaryCertificateCoverUrl = null;
}


function showCertificateCover(url) {
  if (!url) {
    certificateCoverImage.hidden = true;

    certificateCoverImage.removeAttribute(
      "src"
    );

    certificateCoverPlaceholder.hidden = false;

    return;
  }

  certificateCoverImage.src = url;
  certificateCoverImage.hidden = false;
  certificateCoverPlaceholder.hidden = true;
}


function updateCertificateCoverButtons() {
  removeCertificateCoverButton.hidden =
    !currentCertificateCover.path;
}


// ======================================================
// VALIDAÇÃO
// ======================================================

function validateCertificateCover(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Selecione uma imagem JPG, PNG ou WEBP."
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "A imagem de capa excede o limite de 5 MB."
    );
  }
}


function getCertificateCoverExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return extensions[file.type];
}


// ======================================================
// STORAGE
// ======================================================

async function uploadCertificateCover(
  file,
  certificateId
) {
  const extension =
    getCertificateCoverExtension(file);

  const path =
    `certificados/${certificateId}/capa/` +
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


async function removeCertificateCoverFile(path) {
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
      "Erro ao remover capa:",
      error
    );

    return false;
  }

  return true;
}


// ======================================================
// CARREGAMENTO
// ======================================================

async function loadCertificateCover() {
  const certificateId =
    getCurrentCertificateId();

  if (!certificateId) {
    showCertificateCover(null);
    updateCertificateCoverButtons();

    return;
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("certificados")
      .select("capa_url, capa_path")
      .eq("id", certificateId)
      .single();

    if (error) {
      throw error;
    }

    currentCertificateCover = {
      url: data.capa_url,
      path: data.capa_path
    };

    showCertificateCover(
      currentCertificateCover.url
    );

    updateCertificateCoverButtons();
  } catch (error) {
    console.error(
      "Erro ao carregar capa:",
      error
    );
  }
}


// ======================================================
// SELEÇÃO
// ======================================================

certificateCoverInput?.addEventListener(
  "change",
  () => {
    const file =
      certificateCoverInput.files[0];

    clearTemporaryCertificateCover();

    if (!file) {
      showCertificateCover(
        currentCertificateCover.url
      );

      return;
    }

    try {
      validateCertificateCover(file);

      temporaryCertificateCoverUrl =
        URL.createObjectURL(file);

      showCertificateCover(
        temporaryCertificateCoverUrl
      );
    } catch (error) {
      certificateCoverInput.value = "";

      showCertificateCover(
        currentCertificateCover.url
      );

      showCertificateCoverMessage(
        error.message
      );
    }
  }
);


// ======================================================
// SALVAMENTO DA CAPA
// ======================================================

uploadCertificateCoverButton?.addEventListener(
  "click",
  async () => {
    const certificateId =
      getCurrentCertificateId();

    const file =
      certificateCoverInput.files[0];

    if (!certificateId) {
      showCertificateCoverMessage(
        "Salve primeiro os dados do certificado e depois envie a capa."
      );

      return;
    }

    if (!file) {
      showCertificateCoverMessage(
        "Selecione uma imagem de capa."
      );

      return;
    }

    uploadCertificateCoverButton.disabled = true;
    uploadCertificateCoverButton.textContent =
      "Enviando...";

    let newCover = null;

    try {
      validateCertificateCover(file);

      newCover =
        await uploadCertificateCover(
          file,
          certificateId
        );

      const oldPath =
        currentCertificateCover.path;

      const {
        error
      } = await window.supabaseClient
        .from("certificados")
        .update({
          capa_url: newCover.url,
          capa_path: newCover.path
        })
        .eq("id", certificateId);

      if (error) {
        throw error;
      }

      currentCertificateCover = {
        url: newCover.url,
        path: newCover.path
      };

      if (
        oldPath &&
        oldPath !== newCover.path
      ) {
        await removeCertificateCoverFile(
          oldPath
        );
      }

      clearTemporaryCertificateCover();
      certificateCoverInput.value = "";

      showCertificateCover(
        currentCertificateCover.url
      );

      updateCertificateCoverButtons();

      showCertificateCoverMessage(
        "Capa salva com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao salvar capa:",
        error
      );

      if (newCover?.path) {
        await removeCertificateCoverFile(
          newCover.path
        );
      }

      showCertificateCoverMessage(
        error.message ||
        "Não foi possível salvar a capa."
      );
    } finally {
      uploadCertificateCoverButton.disabled =
        false;

      uploadCertificateCoverButton.textContent =
        "Salvar capa";
    }
  }
);


// ======================================================
// REMOÇÃO DA CAPA
// ======================================================

removeCertificateCoverButton?.addEventListener(
  "click",
  async () => {
    const certificateId =
      getCurrentCertificateId();

    if (
      !certificateId ||
      !currentCertificateCover.path
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja remover a capa deste certificado?"
    );

    if (!confirmed) {
      return;
    }

    removeCertificateCoverButton.disabled =
      true;

    const oldPath =
      currentCertificateCover.path;

    try {
      const {
        error
      } = await window.supabaseClient
        .from("certificados")
        .update({
          capa_url: null,
          capa_path: null
        })
        .eq("id", certificateId);

      if (error) {
        throw error;
      }

      const removed =
        await removeCertificateCoverFile(
          oldPath
        );

      currentCertificateCover = {
        url: null,
        path: null
      };

      clearTemporaryCertificateCover();
      certificateCoverInput.value = "";

      showCertificateCover(null);
      updateCertificateCoverButtons();

      showCertificateCoverMessage(
        removed
          ? "Capa removida com sucesso."
          : "A capa foi retirada, mas o arquivo pode ter permanecido no armazenamento.",
        removed ? "success" : "error"
      );
    } catch (error) {
      console.error(
        "Erro ao remover capa:",
        error
      );

      showCertificateCoverMessage(
        "Não foi possível remover a capa."
      );
    } finally {
      removeCertificateCoverButton.disabled =
        false;
    }
  }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadCertificateCover();