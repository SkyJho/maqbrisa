// ===== SCRIPT PRINCIPAL - CARREGAR PRODUTOS E BANNERS DINÂMICOS =====
// NOTA: Todos os produtos e banners são carregados do banco de dados MySQL
// localStorage é usado APENAS para verificar sessão do usuário

const API_PRODUTOS = "api/produtos.php"
const API_BANNERS = "api/banners.php"

let paginaAtualResidencial = 1
let paginaAtualIndustrial = 1
const produtosPorPagina = 6

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[MAIN] Inicializando página principal...")
  await loadDynamicProducts()
  await loadDynamicBanners()
  updateNavbar()
})

// Atualizar navbar com botão de login/perfil
function updateNavbar() {
  const navbarMenu = document.getElementById("navbarMenu")
  if (!navbarMenu) return

  const navbarNav = navbarMenu.querySelector(".navbar-nav")
  const user = JSON.parse(localStorage.getItem("maqbrisa_session"))

  const existingLoginItem = document.getElementById("navLoginItem")
  if (existingLoginItem) existingLoginItem.remove()

  const loginItem = document.createElement("li")
  loginItem.className = "nav-item"
  loginItem.id = "navLoginItem"

  if (user) {
    if (user.tipo === "admin") {
      loginItem.innerHTML = `
        <div class="dropdown">
          <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
            ${user.nome}
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="admin.html">Painel Admin</a></li>
            <li><a class="dropdown-item" href="perfil.html">Meu Perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logout()">Sair</a></li>
          </ul>
        </div>
      `
    } else {
      loginItem.innerHTML = `
        <div class="dropdown">
          <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
            ${user.nome}
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="perfil.html">Meu Perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logout()">Sair</a></li>
          </ul>
        </div>
      `
    }
  } else {
    loginItem.innerHTML = '<a class="nav-link" href="login.html">Entrar</a>'
  }

  navbarNav.appendChild(loginItem)
}

function logout() {
  localStorage.removeItem("maqbrisa_session")
  window.location.href = "index.html"
}

async function loadDynamicProducts() {
  console.log("[MAIN] Carregando produtos...")

  try {
    const response = await fetch(API_PRODUTOS)
    const data = await response.json()

    if (data.success) {
      const residenciais = data.produtos.filter((p) => p.tipo === "residencial")
      const industriais = data.produtos.filter((p) => p.tipo === "industrial")

      console.log("[MAIN] Residenciais:", residenciais.length, "Industriais:", industriais.length)

      renderizarProdutos(residenciais, "residenciais")
      renderizarProdutos(industriais, "industriais")
    }
  } catch (error) {
    console.error("[MAIN] Erro ao carregar produtos:", error)
  }
}

function renderizarProdutos(produtos, tipo) {
  const container = document.getElementById(`produtos-${tipo}-container`)
  const paginacaoContainer = document.getElementById(`paginacao-${tipo}`)

  if (!container) return

  container.innerHTML = ""

  produtos.forEach((produto) => {
    const descId = `desc-${tipo}-${produto.id}`
    const acessId = `acess-${tipo}-${produto.id}`

    let botoesExtras = ""
    if (tipo === "industriais" && produto.acessorios) {
      botoesExtras = `
        <button class="btn-ver-acessorios mt-2" type="button" data-bs-toggle="collapse" data-bs-target="#${acessId}">
          Ver acessórios
        </button>
      `
    }

    const overlayAcessorios =
      tipo === "industriais" && produto.acessorios
        ? `
      <div class="descricao-overlay collapse" id="${acessId}">
        <button class="btn-fechar-descricao" type="button" data-bs-toggle="collapse" data-bs-target="#${acessId}">✕</button>
        <p class="card-text">${produto.acessorios.replace(/\n/g, "<br>")}</p>
      </div>
    `
        : ""

    const productHTML = `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100 shadow">
          <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
          
          <div class="descricao-overlay collapse" id="${descId}">
            <button class="btn-fechar-descricao" type="button" data-bs-toggle="collapse" data-bs-target="#${descId}">✕</button>
            <p class="card-text">${produto.descricao.replace(/\n/g, "<br>")}</p>
          </div>
          
          ${overlayAcessorios}
          
          <div class="card-body">
            <h5 class="card-title">${produto.nome}</h5>
            <button class="btn-ver-descricao" type="button" data-bs-toggle="collapse" data-bs-target="#${descId}">
              Ver descrição
            </button>
            ${botoesExtras}
          </div>
        </div>
      </div>
    `

    container.insertAdjacentHTML("beforeend", productHTML)
  })

  // Paginação
  const totalCards = container.querySelectorAll(".col-12").length
  if (totalCards > produtosPorPagina) {
    implementarPaginacao(tipo)
  } else if (paginacaoContainer) {
    paginacaoContainer.innerHTML = ""
  }
}

function implementarPaginacao(tipo) {
  const container = document.getElementById(`produtos-${tipo}-container`)
  const paginacaoContainer = document.getElementById(`paginacao-${tipo}`)

  if (!container || !paginacaoContainer) return

  const todosCards = Array.from(container.querySelectorAll(".col-12"))
  const totalPaginas = Math.ceil(todosCards.length / produtosPorPagina)
  const paginaAtual = tipo === "residenciais" ? paginaAtualResidencial : paginaAtualIndustrial

  // Esconder todos
  todosCards.forEach((card) => (card.style.display = "none"))

  // Mostrar apenas da página atual
  const inicio = (paginaAtual - 1) * produtosPorPagina
  const fim = inicio + produtosPorPagina
  todosCards.slice(inicio, fim).forEach((card) => (card.style.display = "block"))

  // Criar botões de paginação
  let paginacaoHTML = ""

  if (totalPaginas > 1) {
    paginacaoHTML += `
      <li class="page-item ${paginaAtual === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" onclick="mudarPagina('${tipo}', ${paginaAtual - 1}); return false;">Anterior</a>
      </li>
    `

    for (let i = 1; i <= totalPaginas; i++) {
      paginacaoHTML += `
        <li class="page-item ${i === paginaAtual ? "active" : ""}">
          <a class="page-link" href="#" onclick="mudarPagina('${tipo}', ${i}); return false;">${i}</a>
        </li>
      `
    }

    paginacaoHTML += `
      <li class="page-item ${paginaAtual === totalPaginas ? "disabled" : ""}">
        <a class="page-link" href="#" onclick="mudarPagina('${tipo}', ${paginaAtual + 1}); return false;">Próximo</a>
      </li>
    `
  }

  paginacaoContainer.innerHTML = paginacaoHTML
}

function mudarPagina(tipo, novaPagina) {
  const container = document.getElementById(`produtos-${tipo}-container`)
  const todosCards = Array.from(container.querySelectorAll(".col-12"))
  const totalPaginas = Math.ceil(todosCards.length / produtosPorPagina)

  if (novaPagina < 1 || novaPagina > totalPaginas) return

  if (tipo === "residenciais") {
    paginaAtualResidencial = novaPagina
  } else if (tipo === "industriais") {
    paginaAtualIndustrial = novaPagina
  }

  implementarPaginacao(tipo)

  document.getElementById(`produtos-${tipo}`).scrollIntoView({ behavior: "smooth" })
}

async function loadDynamicBanners() {
  console.log("[MAIN] Carregando banners...")

  try {
    const response = await fetch(API_BANNERS)
    const data = await response.json()

    if (data.success) {
      const carouselImages = document.querySelectorAll("#bannerCarousel .carousel-item img")

      if (data.banners.banner1) carouselImages[0].src = data.banners.banner1
      if (data.banners.banner2) carouselImages[1].src = data.banners.banner2
      if (data.banners.banner3) carouselImages[2].src = data.banners.banner3

      console.log("[MAIN] Banners carregados")
    }
  } catch (error) {
    console.error("[MAIN] Erro ao carregar banners:", error)
  }
}
