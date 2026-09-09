// ======================================================
// PÁGINA PÚBLICA DE CERTIFICADOS
// ======================================================

const certificateSearch = document.querySelector(
  "#certificate-search"
);

const institutionFilter = document.querySelector(
  "#institution-filter"
);

const yearFilter = document.querySelector(
  "#year-filter"
);

const certificateOrder = document.querySelector(
  "#certificate-order"
);

const clearCertificateFilters = document.querySelector(
  "#clear-certificate-filters"
);

const certificateCounter = document.querySelector(
  "#certificate-counter"
);

const certificatesGrid = document.querySelector(
  "#certificates-grid"
);

const certificatesEmpty = document.querySelector(
  "#certificates-empty"
);


/**
 * Permanecerá vazio até os certificados reais
 * serem carregados do Supabase.
 */
const certificates = [];


/**
 * Normaliza textos para permitir pesquisas sem diferença
 * entre letras maiúsculas, minúsculas ou acentos.
 */
function normalizeCertificateText(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/**
 * Atualiza a quantidade de resultados.
 */
function updateCertificateCounter(total) {
  if (total === 0) {
    certificateCounter.textContent =
      "Nenhum certificado publicado";

    return;
  }

  if (total === 1) {
    certificateCounter.textContent =
      "1 certificado encontrado";

    return;
  }

  certificateCounter.textContent =
    `${total} certificados encontrados`;
}


/**
 * Exibe ou oculta o estado vazio.
 */
function updateCertificateEmptyState(total) {
  certificatesEmpty.hidden = total > 0;
}


/**
 * Filtra os certificados.
 */
function filterCertificates() {
  const searchValue = normalizeCertificateText(
    certificateSearch?.value || ""
  );

  const institutionValue = institutionFilter?.value || "";
  const yearValue = yearFilter?.value || "";
  const orderValue = certificateOrder?.value || "recent";

  const filteredCertificates = certificates.filter(
    (certificate) => {
      const matchesSearch =
        !searchValue ||
        normalizeCertificateText(
          certificate.title
        ).includes(searchValue);

      const matchesInstitution =
        !institutionValue ||
        certificate.institution === institutionValue;

      const certificateYear = String(
        new Date(certificate.completedAt).getFullYear()
      );

      const matchesYear =
        !yearValue ||
        certificateYear === yearValue;

      return (
        matchesSearch &&
        matchesInstitution &&
        matchesYear
      );
    }
  );

  filteredCertificates.sort(
    (firstCertificate, secondCertificate) => {
      if (orderValue === "alphabetical") {
        return firstCertificate.title.localeCompare(
          secondCertificate.title,
          "pt-BR"
        );
      }

      const firstDate = new Date(
        firstCertificate.completedAt
      );

      const secondDate = new Date(
        secondCertificate.completedAt
      );

      if (orderValue === "oldest") {
        return firstDate - secondDate;
      }

      return secondDate - firstDate;
    }
  );

  updateCertificateCounter(filteredCertificates.length);
  updateCertificateEmptyState(filteredCertificates.length);
}


/**
 * Limpa todos os filtros.
 */
function resetCertificateFilters() {
  if (certificateSearch) {
    certificateSearch.value = "";
  }

  if (institutionFilter) {
    institutionFilter.value = "";
  }

  if (yearFilter) {
    yearFilter.value = "";
  }

  if (certificateOrder) {
    certificateOrder.value = "recent";
  }

  filterCertificates();
}


certificateSearch?.addEventListener(
  "input",
  filterCertificates
);

institutionFilter?.addEventListener(
  "change",
  filterCertificates
);

yearFilter?.addEventListener(
  "change",
  filterCertificates
);

certificateOrder?.addEventListener(
  "change",
  filterCertificates
);

clearCertificateFilters?.addEventListener(
  "click",
  resetCertificateFilters
);

filterCertificates();