// ======================================================
// PROTEÇÃO DAS PÁGINAS ADMINISTRATIVAS
// ======================================================

const adminBody = document.querySelector(".admin-body");
const adminName = document.querySelector("#admin-name");
const adminEmail = document.querySelector("#admin-email");
const logoutButton = document.querySelector("#logout-button");


/**
 * Envia usuários não autorizados para o login.
 */
function redirectToLogin() {
  window.location.replace("../pages/login.html");
}


/**
 * Valida a sessão e o cadastro administrativo.
 */
async function protectAdminPage() {
  try {
    const {
      data: { session },
      error: sessionError
    } = await window.supabaseClient.auth.getSession();

    if (sessionError || !session?.user) {
      redirectToLogin();
      return;
    }

    const { data: administrator, error } =
      await window.supabaseClient
        .from("administradores")
        .select("usuario_id, nome, ativo")
        .eq("usuario_id", session.user.id)
        .eq("ativo", true)
        .maybeSingle();

    if (error || !administrator) {
      await window.supabaseClient.auth.signOut();
      redirectToLogin();
      return;
    }

    if (adminName) {
      adminName.textContent = administrator.nome;
    }

    if (adminEmail) {
      adminEmail.textContent = session.user.email || "";
    }

    adminBody?.classList.remove("admin-auth-pending");
  } catch (error) {
    console.error(
      "Erro ao proteger a página administrativa:",
      error
    );

    redirectToLogin();
  }
}


/**
 * Encerra a sessão.
 */
logoutButton?.addEventListener("click", async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = "Saindo...";

  await window.supabaseClient.auth.signOut();

  redirectToLogin();
});


protectAdminPage();