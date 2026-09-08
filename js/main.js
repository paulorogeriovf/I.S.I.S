// ======================================================
// ELEMENTOS GERAIS
// ======================================================

// Cabeçalho da página pública.
const header = document.querySelector(".header");

// Botão responsável pelo menu em celulares e tablets.
const menuButton = document.querySelector(".menu-button");

// Navegação principal.
const navigation = document.querySelector("#navigation");

// Elemento que recebe o ano atual no rodapé.
const yearElement = document.querySelector("#year");

// Elementos que possuem animação durante a rolagem.
const revealElements = document.querySelectorAll(".reveal");


// ======================================================
// CABEÇALHO
// ======================================================

/**
 * Adiciona uma classe ao cabeçalho quando a página é rolada.
 * A classe "scrolled" altera o fundo e o tamanho do cabeçalho.
 */
function updateHeader() {
  if (!header) {
    return;
  }

  header.classList.toggle("scrolled", window.scrollY > 30);
}


// Executa a verificação quando a página é aberta.
updateHeader();


// Executa novamente sempre que a página é rolada.
window.addEventListener("scroll", updateHeader);


// ======================================================
// MENU RESPONSIVO
// ======================================================

/**
 * Abre ou fecha o menu de navegação em telas menores.
 */
menuButton?.addEventListener("click", () => {
  if (!navigation) {
    return;
  }

  const menuIsOpen = navigation.classList.toggle("open");

  menuButton.setAttribute(
    "aria-expanded",
    String(menuIsOpen)
  );
});


/**
 * Fecha o menu depois que um link é selecionado.
 */
navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");

    menuButton?.setAttribute(
      "aria-expanded",
      "false"
    );
  });
});


/**
 * Fecha o menu quando o visitante clica fora dele.
 */
document.addEventListener("click", (event) => {
  if (!navigation || !menuButton) {
    return;
  }

  const clickedNavigation = navigation.contains(event.target);
  const clickedMenuButton = menuButton.contains(event.target);

  if (!clickedNavigation && !clickedMenuButton) {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});


/**
 * Fecha o menu caso a tela volte ao tamanho de computador.
 */
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    navigation?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});


// ======================================================
// ANO AUTOMÁTICO
// ======================================================

/**
 * Coloca automaticamente o ano atual no rodapé.
 */
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ======================================================
// ANIMAÇÕES DURANTE A ROLAGEM
// ======================================================

/**
 * Respeita a configuração do dispositivo caso o usuário
 * prefira visualizar páginas sem animações.
 */
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/**
 * Verifica se o navegador suporta IntersectionObserver
 * e se as animações estão permitidas.
 */
if (
  "IntersectionObserver" in window &&
  !reducedMotion
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  // Mostra os elementos normalmente caso as animações
  // não possam ser utilizadas.
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}