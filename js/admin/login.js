// ======================================================
// LOGIN ADMINISTRATIVO
// ======================================================

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-submit");
const loginButtonText = document.querySelector(
  "#login-button-text"
);

const loginMessage = document.querySelector("#login-message");
const loginMessageIcon = document.querySelector(
  "#login-message-icon"
);

const loginMessageText = document.querySelector(
  "#login-message-text"
);

const forgotPasswordButton = document.querySelector(
  "#forgot-password"
);


/**
 * Mostra uma mensagem abaixo do formulário.
 */
function showLoginMessage(message, type = "error") {
  loginMessage.hidden = false;
  loginMessage.dataset.type = type;
  loginMessageText.textContent = message;

  loginMessageIcon.textContent =
    type === "success" ? "✓" : "!";
}


/**
 * Esconde a mensagem atual.
 */
function hideLoginMessage() {
  loginMessage.hidden = true;
  loginMessageText.textContent = "";
  delete loginMessage.dataset.type;
}


/**
 * Ativa ou desativa o formulário durante a consulta.
 */
function setLoginLoading(isLoading) {
  emailInput.disabled = isLoading;
  passwordInput.disabled = isLoading;
  loginButton.disabled = isLoading;

  loginButtonText.textContent = isLoading
    ? "Verificando acesso..."
    : "Entrar no painel";
}


/**
 * Verifica se o usuário autenticado está cadastrado
 * como administrador ativo.
 */
async function getAdministrator(userId) {
  const { data, error } = await window.supabaseClient
    .from("administradores")
    .select("usuario_id, nome, ativo")
    .eq("usuario_id", userId)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


/**
 * Realiza o login.
 */
loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideLoginMessage();
  setLoginLoading(true);

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const { data, error } =
      await window.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    const administrator = await getAdministrator(
      data.user.id
    );

    if (!administrator) {
      await window.supabaseClient.auth.signOut();

      showLoginMessage(
        "Esta conta não possui acesso administrativo."
      );

      return;
    }

    showLoginMessage(
      "Acesso autorizado. Abrindo o painel...",
      "success"
    );

    window.setTimeout(() => {
      window.location.href = "../admin/index.html";
    }, 700);
  } catch (error) {
    console.error("Erro durante o login:", error);

    showLoginMessage(
      "Não foi possível entrar. Confira o e-mail e a senha."
    );
  } finally {
    setLoginLoading(false);
  }
});


/**
 * Inicia a recuperação da senha.
 */
forgotPasswordButton?.addEventListener(
  "click",
  async () => {
    hideLoginMessage();

    const email = emailInput.value.trim();

    if (!email) {
      showLoginMessage(
        "Digite seu e-mail antes de solicitar uma nova senha."
      );

      emailInput.focus();
      return;
    }

    forgotPasswordButton.disabled = true;

    try {
      const redirectUrl = new URL(
        "./login.html",
        window.location.href
      ).href;

      const { error } =
        await window.supabaseClient.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: redirectUrl
          }
        );

      if (error) {
        throw error;
      }

      showLoginMessage(
        "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.",
        "success"
      );
    } catch (error) {
      console.error("Erro ao recuperar senha:", error);

      showLoginMessage(
        "Não foi possível solicitar a recuperação agora."
      );
    } finally {
      forgotPasswordButton.disabled = false;
    }
  }
);


/**
 * Se já existir uma sessão administrativa válida,
 * direciona imediatamente para o painel.
 */
async function redirectAuthenticatedAdministrator() {
  try {
    const {
      data: { session }
    } = await window.supabaseClient.auth.getSession();

    if (!session?.user) {
      return;
    }

    const administrator = await getAdministrator(
      session.user.id
    );

    if (administrator) {
      window.location.replace("../admin/index.html");
    }
  } catch (error) {
    console.error(
      "Não foi possível verificar a sessão:",
      error
    );
  }
}


redirectAuthenticatedAdministrator();