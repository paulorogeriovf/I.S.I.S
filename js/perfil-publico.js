// ======================================================
// PERFIL PÚBLICO
// ======================================================

const publicProfileElements = {
  name: document.querySelector(
    "#public-profile-name"
  ),

  footerName: document.querySelector(
    "#public-profile-footer-name"
  ),

  presentation: document.querySelector(
    "#public-profile-presentation"
  ),

  photo: document.querySelector(
    "#public-profile-photo"
  ),

  course: document.querySelector(
    "#public-profile-course"
  ),

  college: document.querySelector(
    "#public-profile-college"
  ),

  endYear: document.querySelector(
    "#public-profile-end-year"
  ),

  institution: document.querySelector(
    "#public-profile-institution"
  ),

  quickCourse: document.querySelector(
    "#public-profile-quick-course"
  ),

  period: document.querySelector(
    "#public-profile-period"
  ),

  location: document.querySelector(
    "#public-profile-location"
  ),

  title: document.querySelector(
    "#public-profile-title"
  ),

  biography: document.querySelector(
    "#public-profile-biography"
  ),

  linkedin: document.querySelector(
    "#public-profile-linkedin"
  ),

  educationPeriod: document.querySelector(
    "#public-profile-education-period"
  ),

  educationInstitution: document.querySelector(
    "#public-profile-education-institution"
  ),

  educationCourse: document.querySelector(
    "#public-profile-education-course"
  ),

  educationDates: document.querySelector(
    "#public-profile-education-dates"
  ),

  city: document.querySelector(
    "#public-profile-city"
  ),

  stateCountry: document.querySelector(
    "#public-profile-state-country"
  ),

  contactLinkedin: document.querySelector(
    "#public-profile-contact-linkedin"
  )
};


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

// Atualiza o texto somente quando o elemento e o valor existem.
function setPublicText(element, value) {
  if (!element) {
    return;
  }

  if (value === null || value === undefined) {
    return;
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return;
  }

  element.textContent = normalizedValue;
}


// Retorna somente o ano de uma data do Supabase.
function getYear(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue).slice(0, 4);
}


// Transforma uma data em mês e ano por extenso.
function formatMonthAndYear(dateValue) {
  if (!dateValue) {
    return "";
  }

  const parts = String(dateValue).split("-");

  if (parts.length < 2) {
    return "";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!year || !month) {
    return "";
  }

  const date = new Date(
    year,
    month - 1,
    1
  );

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


// Cria o período da graduação.
function createPeriod(startDate, endDate) {
  const startYear = getYear(startDate);
  const endYear = getYear(endDate);

  if (startYear && endYear) {
    return `${startYear} — ${endYear}`;
  }

  return startYear || endYear || "";
}


// Cria a localização resumida.
function createShortLocation(city, state) {
  return [
    city,
    state
  ]
    .filter(Boolean)
    .join(", ");
}


// Cria o texto com estado e país.
function createStateCountry(state, country) {
  return [
    state,
    country
  ]
    .filter(Boolean)
    .join(", ");
}


// Cria o texto completo das datas da formação.
function createEducationDates(startDate, endDate) {
  const start = formatMonthAndYear(startDate);
  const end = formatMonthAndYear(endDate);

  if (start && end) {
    return (
      `Início em ${start} · ` +
      `conclusão prevista para ${end}`
    );
  }

  if (start) {
    return `Início em ${start}`;
  }

  if (end) {
    return `Conclusão prevista para ${end}`;
  }

  return "";
}


// ======================================================
// EXIBIÇÃO DO PERFIL
// ======================================================

function renderPublicProfile(profile) {
  setPublicText(
    publicProfileElements.name,
    profile.nome_completo
  );

  setPublicText(
    publicProfileElements.footerName,
    profile.nome_completo
  );

  setPublicText(
    publicProfileElements.presentation,
    profile.apresentacao
  );

  setPublicText(
    publicProfileElements.course,
    profile.curso
  );

  setPublicText(
    publicProfileElements.college,
    profile.faculdade
  );

  setPublicText(
    publicProfileElements.endYear,
    getYear(profile.data_conclusao)
  );

  setPublicText(
    publicProfileElements.institution,
    profile.faculdade
  );

  setPublicText(
    publicProfileElements.quickCourse,
    profile.curso
  );

  setPublicText(
    publicProfileElements.period,
    createPeriod(
      profile.data_inicio,
      profile.data_conclusao
    )
  );

  setPublicText(
    publicProfileElements.location,
    createShortLocation(
      profile.cidade,
      profile.estado
    )
  );

  setPublicText(
    publicProfileElements.title,
    profile.titulo_profissional
  );

  setPublicText(
    publicProfileElements.biography,
    profile.biografia
  );

  setPublicText(
    publicProfileElements.educationPeriod,
    createPeriod(
      profile.data_inicio,
      profile.data_conclusao
    )
  );

  setPublicText(
    publicProfileElements.educationInstitution,
    profile.faculdade
  );

  setPublicText(
    publicProfileElements.educationCourse,
    profile.curso
  );

  setPublicText(
    publicProfileElements.educationDates,
    createEducationDates(
      profile.data_inicio,
      profile.data_conclusao
    )
  );

  setPublicText(
    publicProfileElements.city,
    profile.cidade
  );

  setPublicText(
    publicProfileElements.stateCountry,
    createStateCountry(
      profile.estado,
      profile.pais
    )
  );


  // Atualiza a foto apenas quando existe uma URL cadastrada.
  if (
    publicProfileElements.photo &&
    profile.foto_url
  ) {
    publicProfileElements.photo.src =
      profile.foto_url;

    publicProfileElements.photo.alt =
      profile.nome_completo ||
      "Foto do perfil";
  }


  // Atualiza os links do LinkedIn.
  if (profile.linkedin) {
    if (publicProfileElements.linkedin) {
      publicProfileElements.linkedin.href =
        profile.linkedin;
    }

    if (publicProfileElements.contactLinkedin) {
      publicProfileElements.contactLinkedin.href =
        profile.linkedin;
    }
  }
}


// ======================================================
// CONSULTA AO SUPABASE
// ======================================================

async function loadPublicProfile() {
  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    return;
  }

  const {
    data,
    error
  } = await window.supabaseClient
    .from("perfil")
    .select(`
      nome_completo,
      titulo_profissional,
      apresentacao,
      biografia,
      curso,
      faculdade,
      cidade,
      estado,
      pais,
      data_inicio,
      data_conclusao,
      linkedin,
      email_profissional,
      foto_url,
      curriculo_url
    `)
    .limit(1)
    .maybeSingle();


  if (error) {
    console.error(
      "Não foi possível carregar o perfil:",
      error
    );

    return;
  }


  // Se não houver perfil cadastrado, mantém o HTML original.
  if (!data) {
    console.info(
      "Nenhum perfil cadastrado. O conteúdo padrão será mantido."
    );

    return;
  }

  renderPublicProfile(data);
}


// Inicia o carregamento quando o arquivo é executado.
loadPublicProfile();