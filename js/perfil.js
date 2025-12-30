// ===== PÁGINA DE PERFIL =====
// NOTA: localStorage é usado APENAS para ler dados da sessão do usuário
// Atualizações de perfil são salvas no banco de dados MySQL via PHP

const API_AUTH = "api/auth.php"

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("maqbrisa_session"))

  if (!user) {
    window.location.href = "login.html"
    return
  }

  // Preencher dados do perfil
  document.getElementById("perfilNome").textContent = user.nome
  document.getElementById("perfilEmail").textContent = user.email
  document.getElementById("avatarInitial").textContent = user.nome.charAt(0).toUpperCase()
  document.getElementById("perfilTipo").textContent = user.tipo === "admin" ? "Administrador" : "Cliente"

  // Preencher formulário de atualização
  document.getElementById("updateNome").value = user.nome
  document.getElementById("updateEmail").value = user.email
})

// Atualizar dados
const updateProfileForm = document.getElementById("updateProfileForm")
if (updateProfileForm) {
  updateProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const newNome = document.getElementById("updateNome").value
    const newEmail = document.getElementById("updateEmail").value
    const successDiv = document.getElementById("updateSuccess")
    const user = JSON.parse(localStorage.getItem("maqbrisa_session"))

    try {
      const response = await fetch(API_AUTH, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          nome: newNome,
          email: newEmail,
        }),
      })

      if (response.ok) {
        // Atualizar sessão
        user.nome = newNome
        user.email = newEmail
        localStorage.setItem("maqbrisa_session", JSON.stringify(user))

        // Atualizar UI
        document.getElementById("perfilNome").textContent = newNome
        document.getElementById("perfilEmail").textContent = newEmail
        document.getElementById("avatarInitial").textContent = newNome.charAt(0).toUpperCase()

        successDiv.textContent = "Dados atualizados com sucesso!"
        successDiv.classList.remove("d-none")

        setTimeout(() => {
          successDiv.classList.add("d-none")
        }, 3000)
      } else {
        const error = await response.json()
        alert("Erro ao atualizar perfil: " + (error.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      alert("Erro ao conectar com o servidor!")
    }
  })
}

// Alterar senha
const updatePasswordForm = document.getElementById("updatePasswordForm")
if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const errorDiv = document.getElementById("passwordError")
    const successDiv = document.getElementById("passwordSuccess")
    const user = JSON.parse(localStorage.getItem("maqbrisa_session"))

    try {
      const response = await fetch(API_AUTH, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          nome: user.nome,
          email: user.email,
          senhaAtual: currentPassword,
          novaSenha: newPassword,
        }),
      })

      if (response.ok) {
        errorDiv.classList.add("d-none")
        successDiv.textContent = "Senha alterada com sucesso!"
        successDiv.classList.remove("d-none")

        updatePasswordForm.reset()

        setTimeout(() => {
          successDiv.classList.add("d-none")
        }, 3000)
      } else {
        const error = await response.json()
        errorDiv.textContent = error.error || "Erro ao alterar senha!"
        errorDiv.classList.remove("d-none")
        successDiv.classList.add("d-none")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      errorDiv.textContent = "Erro ao conectar com o servidor!"
      errorDiv.classList.remove("d-none")
    }
  })
}
