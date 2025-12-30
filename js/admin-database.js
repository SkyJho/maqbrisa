console.log("==================================================")
console.log("ADMIN-DATABASE.JS v4.0 CARREGADO - VERSÃO FINAL")
console.log("Sistema 100% MySQL - Upload de imagem funcionando")
console.log("==================================================")

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let produtoEmEdicao = null

// ============================================
// PRODUTOS
// ============================================

async function carregarProdutos() {
  console.log("[v0] Carregando produtos do MySQL...")

  try {
    const response = await fetch("api/produtos.php")
    const data = await response.json()

    console.log("[v0] Resposta da API:", data)

    if (data.success) {
      console.log("[v0] Total de produtos:", data.produtos.length)
      renderizarProdutos(data.produtos)
    } else {
      console.error("[v0] Erro ao carregar produtos:", data.message)
      alert("Erro ao carregar produtos: " + data.message)
    }
  } catch (error) {
    console.error("[v0] Erro na requisição:", error)
    alert("Erro ao conectar com o servidor. Verifique se o XAMPP está rodando.")
  }
}

function renderizarProdutos(produtos) {
  const residenciais = produtos.filter((p) => p.tipo === "residencial")
  const industriais = produtos.filter((p) => p.tipo === "industrial")

  console.log("[v0] Renderizando - Residenciais:", residenciais.length, "Industriais:", industriais.length)

  renderizarLista("produtosResidenciaisList", residenciais, "residencial")
  renderizarLista("produtosIndustriaisList", industriais, "industrial")
}

function renderizarLista(elementId, produtos, tipo) {
  const container = document.getElementById(elementId)
  if (!container) return

  if (produtos.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">Nenhum produto ${tipo} adicionado ainda.</p>`
    return
  }

  container.innerHTML = produtos
    .map(
      (produto) => `
        <div class="col-md-4 mb-3">
            <div class="card h-100 shadow-sm">
                <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}" 
                     style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title">${produto.nome}</h6>
                    <span class="badge ${tipo === "industrial" ? "bg-success" : "bg-primary"} mb-2">
                        ${tipo === "industrial" ? "Industrial" : "Residencial"}
                    </span>
                    <div class="d-grid gap-2">
                        <button class="btn btn-sm btn-warning" onclick="editarProduto(${produto.id}, '${tipo}')">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="removerProduto(${produto.id}, '${tipo}')">
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

async function adicionarProduto(event) {
  event.preventDefault()
  console.log("[v0] Adicionando produto...")

  const formData = new FormData()
  formData.append("nome", document.getElementById("produtoNome").value.trim())
  formData.append("imagem", document.getElementById("produtoImagem").value.trim())
  formData.append("descricao", document.getElementById("produtoDescricao").value.trim())
  formData.append("acessorios", document.getElementById("produtoAcessorios").value.trim())
  formData.append("tipo", document.getElementById("produtoTipo").value)
  formData.append("posicao", document.getElementById("produtoPosicao").value)

  // Validação
  if (!formData.get("nome") || !formData.get("imagem") || !formData.get("descricao")) {
    alert("Por favor, preencha todos os campos obrigatórios!")
    return
  }

  console.log("[v0] Enviando dados:", {
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    imagemLength: formData.get("imagem").length,
  })

  try {
    const response = await fetch("api/produtos.php", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    console.log("[v0] Resposta:", data)

    if (data.success) {
      alert("Produto adicionado com sucesso!")
      document.getElementById("formProduto").reset()
      document.getElementById("imagemPreview").innerHTML = ""
      await carregarProdutos()
    } else {
      alert("Erro ao adicionar produto: " + data.message)
    }
  } catch (error) {
    console.error("[v0] Erro:", error)
    alert("Erro ao adicionar produto.")
  }
}

async function editarProduto(id, tipo) {
  console.log("[v0] Editando produto ID:", id, "Tipo:", tipo)

  try {
    const response = await fetch(`api/produtos.php?id=${id}&tipo=${tipo}`)
    const data = await response.json()

    if (data.success && data.produto) {
      const p = data.produto
      document.getElementById("produtoNome").value = p.nome
      document.getElementById("produtoImagem").value = p.imagem
      document.getElementById("produtoDescricao").value = p.descricao
      document.getElementById("produtoAcessorios").value = p.acessorios || ""
      document.getElementById("produtoTipo").value = tipo

      produtoEmEdicao = { id, tipo }

      const btnSubmit = document.querySelector('#formProduto button[type="submit"]')
      btnSubmit.textContent = "ATUALIZAR PRODUTO"
      btnSubmit.className = "btn btn-warning w-100"

      document.getElementById("formProduto").scrollIntoView({ behavior: "smooth" })
    }
  } catch (error) {
    console.error("[v0] Erro:", error)
    alert("Erro ao carregar produto.")
  }
}

async function atualizarProduto(event) {
  event.preventDefault()
  console.log("[v0] Atualizando produto ID:", produtoEmEdicao.id)

  const params = new URLSearchParams()
  params.append("id", produtoEmEdicao.id)
  params.append("nome", document.getElementById("produtoNome").value.trim())
  params.append("imagem", document.getElementById("produtoImagem").value.trim())
  params.append("descricao", document.getElementById("produtoDescricao").value.trim())
  params.append("acessorios", document.getElementById("produtoAcessorios").value.trim())
  params.append("tipo", produtoEmEdicao.tipo)

  try {
    const response = await fetch("api/produtos.php", {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const data = await response.json()

    if (data.success) {
      alert("Produto atualizado com sucesso!")
      cancelarEdicao()
      await carregarProdutos()
    } else {
      alert("Erro: " + data.message)
    }
  } catch (error) {
    console.error("[v0] Erro:", error)
    alert("Erro ao atualizar produto.")
  }
}

function cancelarEdicao() {
  document.getElementById("formProduto").reset()
  document.getElementById("imagemPreview").innerHTML = ""
  produtoEmEdicao = null

  const btnSubmit = document.querySelector('#formProduto button[type="submit"]')
  btnSubmit.textContent = "ADICIONAR PRODUTO"
  btnSubmit.className = "btn-login w-100"
}

async function removerProduto(id, tipo) {
  if (!confirm("Deseja realmente remover este produto?")) return

  console.log("[v0] Removendo produto ID:", id)

  try {
    const response = await fetch(`api/produtos.php?id=${id}&tipo=${tipo}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (data.success) {
      alert("Produto removido com sucesso!")
      await carregarProdutos()
    } else {
      alert("Erro: " + data.message)
    }
  } catch (error) {
    console.error("[v0] Erro:", error)
    alert("Erro ao remover produto.")
  }
}

// Tornando funções globais para serem chamadas do HTML
window.editarProduto = editarProduto
window.removerProduto = removerProduto

// ============================================
// BANNERS
// ============================================

async function carregarBanners() {
  console.log("[v0] Carregando banners do MySQL...")

  try {
    const response = await fetch("api/banners.php")
    const data = await response.json()

    if (data.success) {
      document.getElementById("banner1").value = data.banners.banner1 || "img/banner1.jpg"
      document.getElementById("banner2").value = data.banners.banner2 || "img/banner2.jpg"
      document.getElementById("banner3").value = data.banners.banner3 || "img/banner3.jpg"
      console.log("[v0] Banners carregados")
    }
  } catch (error) {
    console.error("[v0] Erro ao carregar banners:", error)
  }
}

async function salvarBanners() {
  console.log("[v0] Salvando banners...")

  const formData = new FormData()
  formData.append("banner1", document.getElementById("banner1").value.trim())
  formData.append("banner2", document.getElementById("banner2").value.trim())
  formData.append("banner3", document.getElementById("banner3").value.trim())

  try {
    const response = await fetch("api/banners.php", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      alert("Banners salvos com sucesso!")
    } else {
      alert("Erro: " + data.message)
    }
  } catch (error) {
    console.error("[v0] Erro:", error)
    alert("Erro ao salvar banners.")
  }
}

// ============================================
// UPLOAD DE IMAGEM
// ============================================

function configurarUploadImagem() {
  console.log("[v0] ===== CONFIGURANDO UPLOAD DE IMAGEM =====")

  const imagemInput = document.getElementById("produtoImagem")
  const imagemFileInput = document.getElementById("imagemFileInput")
  const btnSelecionar = document.getElementById("btnSelecionarImagem")
  const imagemPreview = document.getElementById("imagemPreview")

  console.log("[v0] Verificando elementos...")
  console.log("[v0] - imagemInput:", !!imagemInput)
  console.log("[v0] - imagemFileInput:", !!imagemFileInput)
  console.log("[v0] - btnSelecionar:", !!btnSelecionar)
  console.log("[v0] - imagemPreview:", !!imagemPreview)

  if (!imagemInput || !imagemFileInput || !btnSelecionar || !imagemPreview) {
    console.error("[v0] ERRO: Elementos de upload não encontrados!")
    return
  }

  // Botão de selecionar imagem
  btnSelecionar.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("[v0] Botão selecionar imagem clicado!")
    imagemFileInput.click()
  })
  console.log("[v0] Event listener do botão configurado")

  // Input file
  imagemFileInput.addEventListener("change", async (e) => {
    console.log("[v0] Input file changed")
    const file = e.target.files[0]
    if (file) {
      console.log("[v0] Arquivo selecionado:", file.name, "-", (file.size / 1024).toFixed(2), "KB")
      await processarImagem(file)
    }
  })
  console.log("[v0] Event listener do input file configurado")

  // Colar imagem
  document.addEventListener("paste", async (e) => {
    const items = e.clipboardData.items

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        console.log("[v0] Imagem colada:", (file.size / 1024).toFixed(2), "KB")
        await processarImagem(file)
        break
      }
    }
  })
  console.log("[v0] Event listener de colar configurado")

  // Arrastar e soltar
  const dropZone = btnSelecionar.parentElement

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropZone.style.backgroundColor = "#e3f2fd"
    dropZone.style.border = "2px dashed #085a94"
  })

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault()
    dropZone.style.backgroundColor = ""
    dropZone.style.border = ""
  })

  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault()
    dropZone.style.backgroundColor = ""
    dropZone.style.border = ""

    const file = e.dataTransfer.files[0]
    if (file && file.type.indexOf("image") !== -1) {
      console.log("[v0] Arquivo arrastado:", file.name)
      await processarImagem(file)
    } else {
      alert("Por favor, arraste apenas imagens.")
    }
  })
  console.log("[v0] Event listeners de drag configurados")

  console.log("[v0] ===== UPLOAD DE IMAGEM CONFIGURADO =====")
}

async function processarImagem(file) {
  console.log("[v0] ===== PROCESSANDO IMAGEM =====")
  console.log("[v0] Arquivo:", file.name, "Tamanho original:", (file.size / 1024).toFixed(2), "KB")

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Criar canvas para redimensionar/comprimir
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Definir tamanho máximo (mantém proporção)
        const maxWidth = 800
        const maxHeight = 800
        let width = img.width
        let height = img.height

        // Calcular novo tamanho mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)

        // Comprimir para JPEG com qualidade 0.7 (70%)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7)

        const tamanhoOriginal = (file.size / 1024).toFixed(2)
        const tamanhoComprimido = (compressedBase64.length / 1024).toFixed(2)
        const reducao = ((1 - compressedBase64.length / file.size) * 100).toFixed(1)

        console.log("[v0] Imagem comprimida!")
        console.log("[v0] - Tamanho original:", tamanhoOriginal, "KB")
        console.log("[v0] - Tamanho comprimido:", tamanhoComprimido, "KB")
        console.log("[v0] - Redução:", reducao + "%")

        document.getElementById("produtoImagem").value = compressedBase64

        // Mostrar preview
        const preview = document.getElementById("imagemPreview")
        preview.innerHTML = `
          <div class="alert alert-success mt-3" role="alert">
            <img src="${compressedBase64}" class="img-fluid rounded" style="max-height: 200px;">
            <p class="mb-0 mt-2">
              <strong>Imagem carregada e comprimida!</strong><br>
              Original: ${tamanhoOriginal} KB → Comprimida: ${tamanhoComprimido} KB (${reducao}% menor)
            </p>
          </div>
        `

        console.log("[v0] Preview exibido com sucesso!")
        resolve(compressedBase64)
      }

      img.onerror = () => {
        console.error("[v0] Erro ao carregar imagem para compressão")
        alert("Erro ao processar a imagem.")
        reject(new Error("Falha ao carregar imagem"))
      }

      img.src = e.target.result
    }

    reader.onerror = (error) => {
      console.error("[v0] Erro ao ler arquivo:", error)
      alert("Erro ao ler o arquivo de imagem.")
      reject(error)
    }

    reader.readAsDataURL(file)
  })
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] ========================================")
  console.log("[v0] INICIALIZANDO PAINEL ADMIN v4.0")
  console.log("[v0] ========================================")

  // Verificar usuário
  const user = window.getCurrentUser ? window.getCurrentUser() : null
  console.log("[v0] Usuário atual:", user)

  if (!user) {
    console.error("[v0] Usuário não autenticado!")
    alert("Você precisa fazer login primeiro!")
    window.location.href = "login.html"
    return
  }

  if (user.tipo !== "admin") {
    console.error("[v0] Usuário não é administrador!")
    alert("Somente administradores podem acessar esta página!")
    window.location.href = "index.html"
    return
  }

  console.log("[v0] Acesso admin autorizado para:", user.nome)

  // Configurar formulário de produto
  const formProduto = document.getElementById("formProduto")
  if (formProduto) {
    formProduto.addEventListener("submit", (e) => {
      if (produtoEmEdicao) {
        atualizarProduto(e)
      } else {
        adicionarProduto(e)
      }
    })
    console.log("[v0] Formulário de produto configurado")
  }

  // Configurar botão de salvar banners
  const btnSalvarBanners = document.getElementById("btnSalvarBanners")
  if (btnSalvarBanners) {
    btnSalvarBanners.addEventListener("click", salvarBanners)
    console.log("[v0] Botão salvar banners configurado")
  }

  // Configurar campo de acessórios
  const produtoTipo = document.getElementById("produtoTipo")
  const campoAcessorios = document.getElementById("campoAcessorios")

  if (produtoTipo && campoAcessorios) {
    produtoTipo.addEventListener("change", () => {
      campoAcessorios.style.display = produtoTipo.value === "industrial" ? "block" : "none"
      if (produtoTipo.value === "residencial") {
        document.getElementById("produtoAcessorios").value = ""
      }
    })
    campoAcessorios.style.display = "none"
    console.log("[v0] Campo acessórios configurado")
  }

  // CONFIGURAR UPLOAD DE IMAGEM
  configurarUploadImagem()

  // Carregar dados
  carregarProdutos()
  carregarBanners()

  console.log("[v0] ========================================")
  console.log("[v0] PAINEL ADMIN INICIALIZADO COM SUCESSO")
  console.log("[v0] ========================================")
})
