// ======================================================
// ÁREAS DE INTERESSE E COMPETÊNCIAS
// ======================================================

const contentLoading = document.querySelector(
  "#content-loading"
);

const contentManagement = document.querySelector(
  "#content-management"
);

const contentMessage = document.querySelector(
  "#content-message"
);

const contentMessageIcon = document.querySelector(
  "#content-message-icon"
);

const contentMessageText = document.querySelector(
  "#content-message-text"
);


// Áreas de interesse
const interestForm = document.querySelector(
  "#interest-form"
);

const interestId = document.querySelector(
  "#interest-id"
);

const interestTitle = document.querySelector(
  "#interest-title"
);

const interestIcon = document.querySelector(
  "#interest-icon"
);

const interestOrder = document.querySelector(
  "#interest-order"
);

const interestDescription = document.querySelector(
  "#interest-description"
);

const interestActive = document.querySelector(
  "#interest-active"
);

const saveInterestButton = document.querySelector(
  "#save-interest"
);

const cancelInterestButton = document.querySelector(
  "#cancel-interest"
);

const interestList = document.querySelector(
  "#interest-list"
);

const interestEmpty = document.querySelector(
  "#interest-empty"
);

const interestCount = document.querySelector(
  "#interest-count"
);


// Competências
const skillForm = document.querySelector(
  "#skill-form"
);

const skillId = document.querySelector(
  "#skill-id"
);

const skillName = document.querySelector(
  "#skill-name"
);

const skillOrder = document.querySelector(
  "#skill-order"
);

const skillDescription = document.querySelector(
  "#skill-description"
);

const skillActive = document.querySelector(
  "#skill-active"
);

const saveSkillButton = document.querySelector(
  "#save-skill"
);

const cancelSkillButton = document.querySelector(
  "#cancel-skill"
);

const skillList = document.querySelector(
  "#skill-list"
);

const skillEmpty = document.querySelector(
  "#skill-empty"
);

const skillCount = document.querySelector(
  "#skill-count"
);


// Menu móvel
const adminMenuButton = document.querySelector(
  "#admin-menu-button"
);

const adminSidebar = document.querySelector(
  ".admin-sidebar"
);

const adminSidebarOverlay = document.querySelector(
  "#admin-sidebar-overlay"
);


let currentProfileId = null;
let interests = [];
let skills = [];


// ======================================================
// MENSAGENS
// ======================================================

function showContentMessage(
  message,
  type = "error"
) {
  contentMessage.hidden = false;
  contentMessage.dataset.type = type;
  contentMessageText.textContent = message;

  contentMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


function hideContentMessage() {
  contentMessage.hidden = true;
  contentMessageText.textContent = "";

  delete contentMessage.dataset.type;
}


// ======================================================
// ELEMENTOS DOS ITENS
// ======================================================

function createActionButton(
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


function createStatus(active) {
  const status = document.createElement("span");

  status.className = active
    ? "management-status active"
    : "management-status inactive";

  status.textContent = active
    ? "Visível"
    : "Oculto";

  return status;
}


// ======================================================
// RENDERIZAÇÃO DAS ÁREAS
// ======================================================

function renderInterests() {
  interestList.replaceChildren();

  interestCount.textContent = String(
    interests.length
  );

  interestEmpty.hidden =
    interests.length > 0;

  interestList.hidden =
    interests.length === 0;

  interests.forEach((interest) => {
    const article = document.createElement("article");
    article.className = "management-item";

    const symbol = document.createElement("span");
    symbol.className = "management-item-symbol";
    symbol.textContent = interest.icone || "✦";

    const content = document.createElement("div");
    content.className = "management-item-content";

    const top = document.createElement("div");
    top.className = "management-item-top";

    const title = document.createElement("strong");
    title.textContent = interest.titulo;

    top.append(
      title,
      createStatus(interest.ativo)
    );

    const description = document.createElement("p");

    description.textContent =
      interest.descricao ||
      "Sem descrição cadastrada.";

    const order = document.createElement("small");
    order.textContent =
      `Ordem de exibição: ${interest.ordem}`;

    content.append(
      top,
      description,
      order
    );

    const actions = document.createElement("div");
    actions.className = "management-item-actions";

    actions.append(
      createActionButton(
        "Editar",
        "edit-interest",
        interest.id
      ),
      createActionButton(
        interest.ativo ? "Ocultar" : "Exibir",
        "toggle-interest",
        interest.id
      ),
      createActionButton(
        "Excluir",
        "delete-interest",
        interest.id,
        "danger"
      )
    );

    article.append(
      symbol,
      content,
      actions
    );

    interestList.append(article);
  });
}


// ======================================================
// RENDERIZAÇÃO DAS COMPETÊNCIAS
// ======================================================

function renderSkills() {
  skillList.replaceChildren();

  skillCount.textContent = String(
    skills.length
  );

  skillEmpty.hidden =
    skills.length > 0;

  skillList.hidden =
    skills.length === 0;

  skills.forEach((skill) => {
    const article = document.createElement("article");
    article.className = "management-item";

    const symbol = document.createElement("span");
    symbol.className = "management-item-symbol";
    symbol.textContent = "◇";

    const content = document.createElement("div");
    content.className = "management-item-content";

    const top = document.createElement("div");
    top.className = "management-item-top";

    const name = document.createElement("strong");
    name.textContent = skill.nome;

    top.append(
      name,
      createStatus(skill.ativo)
    );

    const description = document.createElement("p");

    description.textContent =
      skill.descricao ||
      "Sem descrição cadastrada.";

    const order = document.createElement("small");
    order.textContent =
      `Ordem de exibição: ${skill.ordem}`;

    content.append(
      top,
      description,
      order
    );

    const actions = document.createElement("div");
    actions.className = "management-item-actions";

    actions.append(
      createActionButton(
        "Editar",
        "edit-skill",
        skill.id
      ),
      createActionButton(
        skill.ativo ? "Ocultar" : "Exibir",
        "toggle-skill",
        skill.id
      ),
      createActionButton(
        "Excluir",
        "delete-skill",
        skill.id,
        "danger"
      )
    );

    article.append(
      symbol,
      content,
      actions
    );

    skillList.append(article);
  });
}


// ======================================================
// CARREGAMENTO
// ======================================================

async function loadManagementContent() {
  try {
    const {
      data: profile,
      error: profileError
    } = await window.supabaseClient
      .from("perfil")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      throw new Error(
        "Salve o perfil principal antes de cadastrar conteúdos."
      );
    }

    currentProfileId = profile.id;

    const [
      interestResult,
      skillResult
    ] = await Promise.all([
      window.supabaseClient
        .from("areas_interesse")
        .select("*")
        .eq("perfil_id", currentProfileId)
        .order("ordem", {
          ascending: true
        })
        .order("criado_em", {
          ascending: true
        }),

      window.supabaseClient
        .from("competencias")
        .select("*")
        .eq("perfil_id", currentProfileId)
        .order("ordem", {
          ascending: true
        })
        .order("criado_em", {
          ascending: true
        })
    ]);

    if (interestResult.error) {
      throw interestResult.error;
    }

    if (skillResult.error) {
      throw skillResult.error;
    }

    interests = interestResult.data || [];
    skills = skillResult.data || [];

    renderInterests();
    renderSkills();

    contentLoading.hidden = true;
    contentManagement.hidden = false;
  } catch (error) {
    console.error(
      "Erro ao carregar conteúdos:",
      error
    );

    contentLoading.textContent =
      "Não foi possível carregar os conteúdos.";

    showContentMessage(
      error.message ||
      "Ocorreu um erro ao carregar os conteúdos."
    );
  }
}


// ======================================================
// FORMULÁRIO DE ÁREAS
// ======================================================

function resetInterestForm() {
  interestForm.reset();
  interestId.value = "";
  interestOrder.value = "0";
  interestActive.checked = true;

  saveInterestButton.textContent =
    "Salvar área";

  cancelInterestButton.hidden = true;
}


interestForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();
    hideContentMessage();

    saveInterestButton.disabled = true;
    saveInterestButton.textContent =
      "Salvando...";

    const payload = {
      perfil_id: currentProfileId,
      titulo: interestTitle.value.trim(),
      descricao:
        interestDescription.value.trim() ||
        null,
      icone:
        interestIcon.value.trim() ||
        "✦",
      ordem:
        Number(interestOrder.value) || 0,
      ativo: interestActive.checked
    };

    try {
      let result;

      if (interestId.value) {
        result = await window.supabaseClient
          .from("areas_interesse")
          .update(payload)
          .eq("id", interestId.value)
          .select()
          .single();
      } else {
        result = await window.supabaseClient
          .from("areas_interesse")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      resetInterestForm();
      await loadManagementContent();

      showContentMessage(
        "Área de interesse salva com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao salvar área:",
        error
      );

      showContentMessage(
        error.message ||
        "Não foi possível salvar a área."
      );
    } finally {
      saveInterestButton.disabled = false;

      if (!interestId.value) {
        saveInterestButton.textContent =
          "Salvar área";
      }
    }
  }
);


cancelInterestButton?.addEventListener(
  "click",
  resetInterestForm
);


// ======================================================
// FORMULÁRIO DE COMPETÊNCIAS
// ======================================================

function resetSkillForm() {
  skillForm.reset();
  skillId.value = "";
  skillOrder.value = "0";
  skillActive.checked = true;

  saveSkillButton.textContent =
    "Salvar competência";

  cancelSkillButton.hidden = true;
}


skillForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();
    hideContentMessage();

    saveSkillButton.disabled = true;
    saveSkillButton.textContent =
      "Salvando...";

    const payload = {
      perfil_id: currentProfileId,
      nome: skillName.value.trim(),
      descricao:
        skillDescription.value.trim() ||
        null,
      ordem:
        Number(skillOrder.value) || 0,
      ativo: skillActive.checked
    };

    try {
      let result;

      if (skillId.value) {
        result = await window.supabaseClient
          .from("competencias")
          .update(payload)
          .eq("id", skillId.value)
          .select()
          .single();
      } else {
        result = await window.supabaseClient
          .from("competencias")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      resetSkillForm();
      await loadManagementContent();

      showContentMessage(
        "Competência salva com sucesso.",
        "success"
      );
    } catch (error) {
      console.error(
        "Erro ao salvar competência:",
        error
      );

      showContentMessage(
        error.message ||
        "Não foi possível salvar a competência."
      );
    } finally {
      saveSkillButton.disabled = false;

      if (!skillId.value) {
        saveSkillButton.textContent =
          "Salvar competência";
      }
    }
  }
);


cancelSkillButton?.addEventListener(
  "click",
  resetSkillForm
);


// ======================================================
// AÇÕES DAS ÁREAS
// ======================================================

interestList?.addEventListener(
  "click",
  async (event) => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) {
      return;
    }

    const interest = interests.find(
      (item) => item.id === button.dataset.id
    );

    if (!interest) {
      return;
    }

    const action = button.dataset.action;

    if (action === "edit-interest") {
      interestId.value = interest.id;
      interestTitle.value = interest.titulo;
      interestIcon.value = interest.icone || "";
      interestOrder.value = interest.ordem;
      interestDescription.value =
        interest.descricao || "";
      interestActive.checked = interest.ativo;

      saveInterestButton.textContent =
        "Atualizar área";

      cancelInterestButton.hidden = false;

      interestTitle.focus();
      interestForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return;
    }

    button.disabled = true;
    hideContentMessage();

    try {
      if (action === "toggle-interest") {
        const {
          error
        } = await window.supabaseClient
          .from("areas_interesse")
          .update({
            ativo: !interest.ativo
          })
          .eq("id", interest.id);

        if (error) {
          throw error;
        }

        await loadManagementContent();

        showContentMessage(
          "Visibilidade da área atualizada.",
          "success"
        );
      }

      if (action === "delete-interest") {
        const confirmed = window.confirm(
          `Deseja excluir a área “${interest.titulo}”?`
        );

        if (!confirmed) {
          return;
        }

        const {
          error
        } = await window.supabaseClient
          .from("areas_interesse")
          .delete()
          .eq("id", interest.id);

        if (error) {
          throw error;
        }

        resetInterestForm();
        await loadManagementContent();

        showContentMessage(
          "Área de interesse excluída.",
          "success"
        );
      }
    } catch (error) {
      console.error(
        "Erro ao alterar área:",
        error
      );

      showContentMessage(
        error.message ||
        "Não foi possível alterar a área."
      );
    } finally {
      button.disabled = false;
    }
  }
);


// ======================================================
// AÇÕES DAS COMPETÊNCIAS
// ======================================================

skillList?.addEventListener(
  "click",
  async (event) => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) {
      return;
    }

    const skill = skills.find(
      (item) => item.id === button.dataset.id
    );

    if (!skill) {
      return;
    }

    const action = button.dataset.action;

    if (action === "edit-skill") {
      skillId.value = skill.id;
      skillName.value = skill.nome;
      skillOrder.value = skill.ordem;
      skillDescription.value =
        skill.descricao || "";
      skillActive.checked = skill.ativo;

      saveSkillButton.textContent =
        "Atualizar competência";

      cancelSkillButton.hidden = false;

      skillName.focus();
      skillForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return;
    }

    button.disabled = true;
    hideContentMessage();

    try {
      if (action === "toggle-skill") {
        const {
          error
        } = await window.supabaseClient
          .from("competencias")
          .update({
            ativo: !skill.ativo
          })
          .eq("id", skill.id);

        if (error) {
          throw error;
        }

        await loadManagementContent();

        showContentMessage(
          "Visibilidade da competência atualizada.",
          "success"
        );
      }

      if (action === "delete-skill") {
        const confirmed = window.confirm(
          `Deseja excluir a competência “${skill.nome}”?`
        );

        if (!confirmed) {
          return;
        }

        const {
          error
        } = await window.supabaseClient
          .from("competencias")
          .delete()
          .eq("id", skill.id);

        if (error) {
          throw error;
        }

        resetSkillForm();
        await loadManagementContent();

        showContentMessage(
          "Competência excluída.",
          "success"
        );
      }
    } catch (error) {
      console.error(
        "Erro ao alterar competência:",
        error
      );

      showContentMessage(
        error.message ||
        "Não foi possível alterar a competência."
      );
    } finally {
      button.disabled = false;
    }
  }
);


// ======================================================
// MENU ADMINISTRATIVO NO CELULAR
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

loadManagementContent();