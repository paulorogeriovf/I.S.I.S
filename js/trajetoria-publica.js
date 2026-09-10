// ======================================================
// TRAJETÓRIA PÚBLICA
// Áreas de interesse e competências
// ======================================================

const publicInterestGrid = document.querySelector(
  "#public-interest-grid"
);

const publicInterestEmpty = document.querySelector(
  "#public-interest-empty"
);

const publicSkillsGrid = document.querySelector(
  "#public-skills-grid"
);

const publicSkillsEmpty = document.querySelector(
  "#public-skills-empty"
);


// ======================================================
// ÁREAS DE INTERESSE
// ======================================================

function createInterestCard(interest, index) {
  const article = document.createElement("article");

  const number = document.createElement("span");

  number.textContent = String(index + 1)
    .padStart(2, "0");

  const symbol = document.createElement("div");

  symbol.className = "interest-symbol";
  symbol.textContent = interest.icone || "✦";

  const title = document.createElement("h3");
  title.textContent = interest.titulo;

  const description = document.createElement("p");

  description.textContent =
    interest.descricao ||
    "Área de interesse acadêmico.";

  article.append(
    number,
    symbol,
    title,
    description
  );

  return article;
}


function renderPublicInterests(interests) {
  publicInterestGrid.replaceChildren();

  if (!interests.length) {
    publicInterestGrid.hidden = true;
    publicInterestEmpty.hidden = false;

    return;
  }

  interests.forEach((interest, index) => {
    publicInterestGrid.append(
      createInterestCard(interest, index)
    );
  });

  publicInterestEmpty.hidden = true;
  publicInterestGrid.hidden = false;
}


// ======================================================
// COMPETÊNCIAS
// ======================================================

function createSkillCard(skill, index) {
  const article = document.createElement("article");
  article.className = "public-skill-card";

  const number = document.createElement("span");
  number.className = "public-skill-number";

  number.textContent = String(index + 1)
    .padStart(2, "0");

  const content = document.createElement("div");

  const name = document.createElement("h3");
  name.textContent = skill.nome;

  const description = document.createElement("p");

  description.textContent =
    skill.descricao ||
    "Competência acadêmica em desenvolvimento.";

  content.append(
    name,
    description
  );

  const symbol = document.createElement("strong");
  symbol.textContent = "◇";

  article.append(
    number,
    content,
    symbol
  );

  return article;
}


function renderPublicSkills(skills) {
  publicSkillsGrid.replaceChildren();

  if (!skills.length) {
    publicSkillsGrid.hidden = true;
    publicSkillsEmpty.hidden = false;

    return;
  }

  skills.forEach((skill, index) => {
    publicSkillsGrid.append(
      createSkillCard(skill, index)
    );
  });

  publicSkillsEmpty.hidden = true;
  publicSkillsGrid.hidden = false;
}


// ======================================================
// CONSULTA AO SUPABASE
// ======================================================

async function loadPublicTrajectory() {
  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    return;
  }

  try {
    const [
      interestResult,
      skillResult
    ] = await Promise.all([
      window.supabaseClient
        .from("areas_interesse")
        .select(`
          id,
          titulo,
          descricao,
          icone,
          ordem
        `)
        .eq("ativo", true)
        .order("ordem", {
          ascending: true
        })
        .order("criado_em", {
          ascending: true
        }),

      window.supabaseClient
        .from("competencias")
        .select(`
          id,
          nome,
          descricao,
          ordem
        `)
        .eq("ativo", true)
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

    renderPublicInterests(
      interestResult.data || []
    );

    renderPublicSkills(
      skillResult.data || []
    );
  } catch (error) {
    console.error(
      "Não foi possível carregar a trajetória:",
      error
    );

    publicInterestGrid.hidden = true;
    publicSkillsGrid.hidden = true;

    publicInterestEmpty.hidden = false;
    publicSkillsEmpty.hidden = false;
  }
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

loadPublicTrajectory();