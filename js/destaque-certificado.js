// ======================================================
// CERTIFICADO EM DESTAQUE NA PÁGINA INICIAL
// ======================================================

const homeCertificateLabel = document.querySelector(
  "#home-certificate-label"
);

const homeCertificateTitle = document.querySelector(
  "#home-certificate-title"
);

const homeCertificateDescription =
  document.querySelector(
    "#home-certificate-description"
  );

const homeCertificateLink = document.querySelector(
  "#home-certificate-link"
);

const homeCertificateSymbol = document.querySelector(
  "#home-certificate-symbol"
);

const homeCertificateCoverImage =
  document.querySelector(
    "#home-certificate-cover-image"
  );


function limitCertificateDescription(
  value,
  maximumLength = 190
) {
  const text = String(value || "").trim();

  if (text.length <= maximumLength) {
    return text;
  }

  return (
    text.slice(0, maximumLength)
      .trimEnd() +
    "..."
  );
}


function getCertificateYear(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue).slice(0, 4);
}


function renderHomeCertificate(certificate) {
  const year = getCertificateYear(
    certificate.data_conclusao
  );

  homeCertificateLabel.textContent = [
    certificate.instituicao,
    year
  ]
    .filter(Boolean)
    .join(" · ") ||
    "FORMAÇÃO COMPLEMENTAR";

  homeCertificateTitle.textContent =
    certificate.titulo;

  homeCertificateDescription.textContent =
    limitCertificateDescription(
      certificate.descricao ||
      "Certificado de formação complementar disponível no acervo."
    );

  homeCertificateLink.href =
    "pages/certificados.html";

  homeCertificateLink.innerHTML =
    "Ver certificado no acervo <span>→</span>";

  const previewUrl =
    certificate.capa_url ||
    (
      certificate.arquivo_tipo === "imagem"
        ? certificate.arquivo_url
        : null
    );

  if (previewUrl) {
    homeCertificateCoverImage.src =
      previewUrl;

    homeCertificateCoverImage.alt =
      `Certificado ${certificate.titulo}`;

    homeCertificateCoverImage.hidden = false;
    homeCertificateSymbol.hidden = true;
  } else {
    homeCertificateCoverImage.hidden = true;
    homeCertificateCoverImage.removeAttribute(
      "src"
    );

    homeCertificateCoverImage.alt = "";
    homeCertificateSymbol.hidden = false;

    homeCertificateSymbol.textContent =
      certificate.arquivo_tipo === "pdf"
        ? "PDF"
        : "I.";
  }
}


async function loadHomeCertificate() {
  if (!window.supabaseClient) {
    console.error(
      "Cliente do Supabase não foi inicializado."
    );

    return;
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("certificados")
      .select(`
        id,
        titulo,
        instituicao,
        descricao,
        data_conclusao,
        arquivo_url,
        arquivo_tipo,
        capa_url,
        publicado_em,
        criado_em
      `)
      .eq("status", "publicado")
      .order("publicado_em", {
        ascending: false,
        nullsFirst: false
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return;
    }

    renderHomeCertificate(data);
  } catch (error) {
    console.error(
      "Não foi possível carregar o certificado em destaque:",
      error
    );
  }
}


loadHomeCertificate();