// ===== SISTEMA DE AUTENTICAÇÃO =====
// NOTA: localStorage é usado APENAS para gerenciar a sessão do usuário logado
// Todos os produtos, imagens e banners são salvos no banco de dados MySQL via PHP

const API_URL = "api/auth.php"

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm")
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const senha = document.getElementById("password").value
    const errorDiv = document.getElementById("loginError")

    try {
      const response = await fetch(`${API_URL}?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Salvar sessão
        localStorage.setItem("maqbrisa_session", JSON.stringify(data.usuario))

        // Redirecionar baseado no tipo
        if (data.usuario.tipo === "admin") {
          window.location.href = "admin.html"
        } else {
          window.location.href = "perfil.html"
        }
      } else {
        errorDiv.textContent = data.error || "E-mail ou senha incorretos!"
        errorDiv.classList.remove("d-none")
      }
    } catch (error) {
      errorDiv.textContent = "Erro ao conectar com o servidor!"
      errorDiv.classList.remove("d-none")
    }
  })
}

// ===== CADASTRO =====
const cadastroForm = document.getElementById("cadastroForm")
if (cadastroForm) {
  cadastroForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const nome = document.getElementById("nome").value
    const email = document.getElementById("email").value
    const senha = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const errorDiv = document.getElementById("cadastroError")
    const successDiv = document.getElementById("cadastroSuccess")

    // Validar senhas
    if (senha !== confirmPassword) {
      errorDiv.textContent = "As senhas não conferem!"
      errorDiv.classList.remove("d-none")
      successDiv.classList.add("d-none")
      return
    }

    try {
      const response = await fetch(`${API_URL}?action=cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        errorDiv.classList.add("d-none")
        successDiv.textContent = "Conta criada com sucesso! Redirecionando..."
        successDiv.classList.remove("d-none")

        setTimeout(() => {
          window.location.href = "login.html"
        }, 2000)
      } else {
        errorDiv.textContent = data.error || "Erro ao criar conta!"
        errorDiv.classList.remove("d-none")
        successDiv.classList.add("d-none")
      }
    } catch (error) {
      errorDiv.textContent = "Erro ao conectar com o servidor!"
      errorDiv.classList.remove("d-none")
    }
  })
}

// ===== LOGOUT =====
const logoutBtn = document.getElementById("logoutBtn")
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("maqbrisa_session")
    window.location.href = "index.html"
  })
}

// ===== VERIFICAR SESSÃO =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("maqbrisa_session"))
}

window.getCurrentUser = getCurrentUser

function isAdmin() {
  const user = getCurrentUser()
  return user && user.tipo === "admin"
}

window.isAdmin = isAdmin

function isLoggedIn() {
  return getCurrentUser() !== null
}

window.isLoggedIn = isLoggedIn

// Proteger página admin
if (window.location.pathname.includes("admin.html")) {
  const user = getCurrentUser()
  console.log("[v0] Verificando acesso admin...")
  console.log("[v0] Usuário atual:", user)

  if (!user) {
    alert("Você precisa fazer login primeiro!")
    window.location.href = "login.html"
  } else if (user.tipo !== "admin") {
    alert("Somente administradores podem acessar essa página!")
    window.location.href = "index.html"
  } else {
    console.log("[v0] Acesso admin autorizado!")
  }
}

// Proteger página perfil
if (window.location.pathname.includes("perfil.html")) {
  if (!isLoggedIn()) {
    alert("Você precisa fazer login primeiro!")
    window.location.href = "login.html"
  }
}
