// ======================================================
// EDIÇÃO DO PERFIL
// ======================================================

const profileForm = document.querySelector("#profile-form");
const profileLoading = document.querySelector("#profile-loading");
const profileMessage = document.querySelector("#profile-message");
const profileMessageIcon = document.querySelector(
  "#profile-message-icon"
);
const profileMessageText = document.querySelector(
  "#profile-message-text"
);

const saveProfileButton = document.querySelector("#save-profile");
const saveProfileText = document.querySelector(
  "#save-profile-text"
);

const photoInput = document.querySelector("#profile-photo");
const curriculumInput = document.querySelector(
  "#profile-curriculum"
);

const photoImage = document.querySelector(
  "#profile-photo-image"
);
const photoPlaceholder = document.querySelector(
  "#profile-photo-placeholder"
);

const currentCurriculum = document.querySelector(
  "#current-curriculum"
);

const adminMenuButton = document.querySelector(
  "#admin-menu-button"
);
const adminSidebar = document.querySelector(".admin-sidebar");
const adminSidebarOverlay = document.querySelector(
  "#admin-sidebar-overlay"
);

const fields = {
  nomeCompleto: document.querySelector("#nome-completo"),
  tituloProfissional: document.querySelector(
    "#titulo-profissional"
  ),
  apresentacao: document.querySelector("#apresentacao"),
  biografia: document.querySelector("#biografia"),
  curso: document.querySelector("#curso"),
  faculdade: document.querySelector("#faculdade"),
  dataInicio: document.querySelector("#data-inicio"),
  dataConclusao: document.querySelector("#data-conclusao"),
  cidade: document.querySelector("#cidade"),
  estado: document.querySelector("#estado"),
  pais: document.querySelector("#pais"),
  emailProfissional: document.querySelector(
    "#email-profissional"
  ),
  linkedin: document.querySelector("#linkedin")
};

let currentProfile = null;


/**
 * Exibe mensagens de sucesso ou erro.
 */
function showProfileMessage(message, type = "error") {
  profileMessage.hidden = false;
  profileMessage.dataset.type = type;
  profileMessageText.textContent = message;
  profileMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


/**
 * Esconde a mensagem atual.
 */
function hideProfileMessage() {
  profileMessage.hidden = true;
  profileMessageText.textContent = "";
  delete profileMessage.dataset.type;
}


/**
 * Mostra a fotografia no formulário.
 */
function showPhotoPreview(url) {
  if (!url) {
    photoImage.hidden = true;
    photoImage.removeAttribute("src");
    photoPlaceholder.hidden = false;
    return;
  }

  photoImage.src = url;
  photoImage.hidden = false;
  photoPlaceholder.hidden = true;
}


/**
 * Mostra o currículo atual.
 */
function showCurrentCurriculum(url) {
  if (!url) {
    currentCurriculum.hidden = true;
    currentCurriculum.removeAttribute("href");
    return;
  }

  currentCurriculum.href = url;
  currentCurriculum.hidden = false;
}


/**
 * Converte YYYY-MM do formulário em uma data do banco.
 */
function monthToDatabaseDate(value) {
  return value ? `${value}-01` : null;
}


/**
 * Converte a data do banco para o campo de mês.
 */
function databaseDateToMonth(value) {
  return value ? value.slice(0, 7) : "";
}


/**
 * Preenche os dados confirmados quando ainda não existe perfil.
 */
function fillInitialData() {
  fields.nomeCompleto.value =
    "Isis Raphaelli Antunes da Costa";

  fields.tituloProfissional.value =
    "Graduanda em Biomedicina";

  fields.apresentacao.value =
    "Graduanda em Biomedicina pela PUC-Campinas, construindo uma trajetória dedicada ao conhecimento científico e ao desenvolvimento profissional na área da saúde.";

  fields.biografia.value =
    "Atualmente em formação acadêmica, tenho interesse no desenvolvimento científico e nas diversas áreas de atuação biomédica. Busco oportunidades de aprendizado, estágio e crescimento profissional na área da saúde.";

  fields.curso.value = "Bacharelado em Biomedicina";

  fields.faculdade.value =
    "Pontifícia Universidade Católica de Campinas — PUC-Campinas";

  fields.dataInicio.value = "2025-02";
  fields.dataConclusao.value = "2028-12";
  fields.cidade.value = "Campinas";
  fields.estado.value = "São Paulo";
  fields.pais.value = "Brasil";

  fields.linkedin.value =
    "https://www.linkedin.com/in/isis-raphaelli-antunes-da-costa-24044b232";
}


/**
 * Preenche o formulário com o registro existente.
 */
function fillProfile(profile) {
  fields.nomeCompleto.value = profile.nome_completo || "";
  fields.tituloProfissional.value =
    profile.titulo_profissional || "";
  fields.apresentacao.value = profile.apresentacao || "";
  fields.biografia.value = profile.biografia || "";
  fields.curso.value = profile.curso || "";
  fields.faculdade.value = profile.faculdade || "";
  fields.dataInicio.value = databaseDateToMonth(
    profile.data_inicio
  );
  fields.dataConclusao.value = databaseDateToMonth(
    profile.data_conclusao
  );
  fields.cidade.value = profile.cidade || "";
  fields.estado.value = profile.estado || "";
  fields.pais.value = profile.pais || "";
  fields.emailProfissional.value =
    profile.email_profissional || "";
  fields.linkedin.value = profile.linkedin || "";

  showPhotoPreview(profile.foto_url);
  showCurrentCurriculum(profile.curriculo_url);
}


/**
 * Carrega o perfil do banco.
 */
async function loadProfile() {
  try {
    const { data, error } = await window.supabaseClient
      .from("perfil")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    currentProfile = data;

    if (currentProfile) {
      fillProfile(currentProfile);
    } else {
      fillInitialData();
    }

    profileLoading.hidden = true;
    profileForm.hidden = false;
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);

    profileLoading.textContent =
      "Não foi possível carregar o perfil.";

    showProfileMessage(
      "Ocorreu um erro ao consultar as informações."
    );
  }
}


/**
 * Valida um arquivo selecionado.
 */
function validateFile(file, allowedTypes, maximumSize) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido.");
  }

  if (file.size > maximumSize) {
    throw new Error("O arquivo excede o tamanho permitido.");
  }
}


/**
 * Retorna uma extensão confiável a partir do tipo.
 */
function getFileExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf"
  };

  return extensions[file.type];
}


/**
 * Envia um arquivo ao bucket público.
 */
async function uploadPublicFile(file, folder) {
  const extension = getFileExtension(file);
  const path =
    `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await window.supabaseClient.storage
    .from("portfolio-publico")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = window.supabaseClient.storage
    .from("portfolio-publico")
    .getPublicUrl(path);

  return {
    path,
    url: data.publicUrl
  };
}


/**
 * Remove um arquivo público pelo caminho interno.
 */
async function removePublicFile(path) {
  if (!path) {
    return;
  }

  const { error } = await window.supabaseClient.storage
    .from("portfolio-publico")
    .remove([path]);

  if (error) {
    console.error("Erro ao remover arquivo antigo:", error);
  }
}


/**
 * Mostra localmente a foto selecionada.
 */
photoInput?.addEventListener("change", () => {
  const file = photoInput.files[0];

  if (!file) {
    showPhotoPreview(currentProfile?.foto_url);
    return;
  }

  try {
    validateFile(
      file,
      ["image/jpeg", "image/png", "image/webp"],
      5 * 1024 * 1024
    );

    const temporaryUrl = URL.createObjectURL(file);
    showPhotoPreview(temporaryUrl);
    hideProfileMessage();
  } catch (error) {
    photoInput.value = "";
    showPhotoPreview(currentProfile?.foto_url);
    showProfileMessage(error.message);
  }
});


/**
 * Valida o currículo selecionado.
 */
curriculumInput?.addEventListener("change", () => {
  const file = curriculumInput.files[0];

  if (!file) {
    return;
  }

  try {
    validateFile(
      file,
      ["application/pdf"],
      15 * 1024 * 1024
    );

    hideProfileMessage();
  } catch (error) {
    curriculumInput.value = "";
    showProfileMessage(error.message);
  }
});


/**
 * Salva o perfil.
 */
profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideProfileMessage();

  saveProfileButton.disabled = true;
  saveProfileText.textContent = "Salvando...";

  const photoFile = photoInput.files[0];
  const curriculumFile = curriculumInput.files[0];

  let newPhoto = null;
  let newCurriculum = null;

  try {
    if (photoFile) {
      validateFile(
        photoFile,
        ["image/jpeg", "image/png", "image/webp"],
        5 * 1024 * 1024
      );

      newPhoto = await uploadPublicFile(
        photoFile,
        "perfil/foto"
      );
    }

    if (curriculumFile) {
      validateFile(
        curriculumFile,
        ["application/pdf"],
        15 * 1024 * 1024
      );

      newCurriculum = await uploadPublicFile(
        curriculumFile,
        "perfil/curriculo"
      );
    }

    const payload = {
      nome_completo: fields.nomeCompleto.value.trim(),
      titulo_profissional:
        fields.tituloProfissional.value.trim() || null,
      apresentacao:
        fields.apresentacao.value.trim() || null,
      biografia:
        fields.biografia.value.trim() || null,
      curso:
        fields.curso.value.trim() || null,
      faculdade:
        fields.faculdade.value.trim() || null,
      cidade:
        fields.cidade.value.trim() || null,
      estado:
        fields.estado.value.trim() || null,
      pais:
        fields.pais.value.trim() || null,
      data_inicio: monthToDatabaseDate(
        fields.dataInicio.value
      ),
      data_conclusao: monthToDatabaseDate(
        fields.dataConclusao.value
      ),
      linkedin:
        fields.linkedin.value.trim() || null,
      email_profissional:
        fields.emailProfissional.value.trim() || null,
      foto_url:
        newPhoto?.url ||
        currentProfile?.foto_url ||
        null,
      foto_path:
        newPhoto?.path ||
        currentProfile?.foto_path ||
        null,
      curriculo_url:
        newCurriculum?.url ||
        currentProfile?.curriculo_url ||
        null,
      curriculo_path:
        newCurriculum?.path ||
        currentProfile?.curriculo_path ||
        null
    };

    let result;

    if (currentProfile) {
      result = await window.supabaseClient
        .from("perfil")
        .update(payload)
        .eq("id", currentProfile.id)
        .select()
        .single();
    } else {
      result = await window.supabaseClient
        .from("perfil")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    const oldPhotoPath = currentProfile?.foto_path;
    const oldCurriculumPath =
      currentProfile?.curriculo_path;

    currentProfile = result.data;

    if (
      newPhoto &&
      oldPhotoPath &&
      oldPhotoPath !== newPhoto.path
    ) {
      await removePublicFile(oldPhotoPath);
    }

    if (
      newCurriculum &&
      oldCurriculumPath &&
      oldCurriculumPath !== newCurriculum.path
    ) {
      await removePublicFile(oldCurriculumPath);
    }

    photoInput.value = "";
    curriculumInput.value = "";

    fillProfile(currentProfile);

    showProfileMessage(
      "Perfil salvo com sucesso.",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);

    if (newPhoto?.path) {
      await removePublicFile(newPhoto.path);
    }

    if (newCurriculum?.path) {
      await removePublicFile(newCurriculum.path);
    }

    showProfileMessage(
      error.message ||
      "Não foi possível salvar o perfil."
    );
  } finally {
    saveProfileButton.disabled = false;
    saveProfileText.textContent = "Salvar perfil";
  }
});


/**
 * Menu administrativo no celular.
 */
function toggleAdminMenu() {
  const isOpen = adminSidebar.classList.toggle("open");

  adminSidebarOverlay.classList.toggle("open", isOpen);

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


loadProfile();