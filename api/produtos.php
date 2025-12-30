<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $conn = getConnection();
    
    // GET - Listar todos os produtos
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            // Buscar produto específico
            $id = $_GET['id'];
            $tipo = $_GET['tipo'] ?? 'residencial';
            $tabela = $tipo === 'industrial' ? 'produtos_industriais' : 'produtos_residenciais';
            
            $stmt = $conn->prepare("SELECT * FROM $tabela WHERE id = ?");
            $stmt->execute([$id]);
            $produto = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($produto) {
                $produto['tipo'] = $tipo;
                echo json_encode(['success' => true, 'produto' => $produto]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Produto não encontrado']);
            }
        } else {
            // Listar todos os produtos
            $residenciais = $conn->query("SELECT *, 'residencial' as tipo FROM produtos_residenciais ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
            $industriais = $conn->query("SELECT *, 'industrial' as tipo FROM produtos_industriais ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
            
            $produtos = array_merge($residenciais, $industriais);
            echo json_encode(['success' => true, 'produtos' => $produtos]);
        }
    }
    
    // POST - Adicionar produto
    elseif ($method === 'POST') {
        $nome = $_POST['nome'] ?? '';
        $imagem = $_POST['imagem'] ?? '';
        $descricao = $_POST['descricao'] ?? '';
        $acessorios = $_POST['acessorios'] ?? '';
        $tipo = $_POST['tipo'] ?? 'residencial';
        $posicao = $_POST['posicao'] ?? 'inicio';
        
        if (empty($nome) || empty($imagem) || empty($descricao)) {
            echo json_encode(['success' => false, 'message' => 'Nome, imagem e descrição são obrigatórios']);
            exit;
        }
        
        $tabela = $tipo === 'industrial' ? 'produtos_industriais' : 'produtos_residenciais';
        
        if ($tipo === 'industrial') {
            $stmt = $conn->prepare("INSERT INTO $tabela (nome, imagem, descricao, acessorios) VALUES (?, ?, ?, ?)");
            $stmt->execute([$nome, $imagem, $descricao, $acessorios]);
        } else {
            $stmt = $conn->prepare("INSERT INTO $tabela (nome, imagem, descricao) VALUES (?, ?, ?)");
            $stmt->execute([$nome, $imagem, $descricao]);
        }
        
        echo json_encode(['success' => true, 'id' => $conn->lastInsertId(), 'message' => 'Produto adicionado com sucesso']);
    }
    
    // PUT - Atualizar produto
    elseif ($method === 'PUT') {
        parse_str(file_get_contents('php://input'), $_PUT);
        
        $id = $_PUT['id'] ?? '';
        $nome = $_PUT['nome'] ?? '';
        $imagem = $_PUT['imagem'] ?? '';
        $descricao = $_PUT['descricao'] ?? '';
        $acessorios = $_PUT['acessorios'] ?? '';
        $tipo = $_PUT['tipo'] ?? 'residencial';
        
        if (empty($id) || empty($nome) || empty($imagem) || empty($descricao)) {
            echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
            exit;
        }
        
        $tabela = $tipo === 'industrial' ? 'produtos_industriais' : 'produtos_residenciais';
        
        if ($tipo === 'industrial') {
            $stmt = $conn->prepare("UPDATE $tabela SET nome = ?, imagem = ?, descricao = ?, acessorios = ? WHERE id = ?");
            $stmt->execute([$nome, $imagem, $descricao, $acessorios, $id]);
        } else {
            $stmt = $conn->prepare("UPDATE $tabela SET nome = ?, imagem = ?, descricao = ? WHERE id = ?");
            $stmt->execute([$nome, $imagem, $descricao, $id]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Produto atualizado com sucesso']);
    }
    
    // DELETE - Remover produto
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $tipo = $_GET['tipo'] ?? 'residencial';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            exit;
        }
        
        $tabela = $tipo === 'industrial' ? 'produtos_industriais' : 'produtos_residenciais';
        
        $stmt = $conn->prepare("DELETE FROM $tabela WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Produto removido com sucesso']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
