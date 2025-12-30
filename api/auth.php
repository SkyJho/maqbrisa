<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

// LOGIN
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $senha = $data['senha'] ?? '';
    
    if (empty($email) || empty($senha)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email e senha são obrigatórios']);
        exit();
    }
    
    $conn = getConnection();
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();
    
    if ($usuario && password_verify($senha, $usuario['senha'])) {
        unset($usuario['senha']);
        echo json_encode(['success' => true, 'usuario' => $usuario]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou senha inválidos']);
    }
}

// CADASTRO
elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'cadastro') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $data['nome'] ?? '';
    $email = $data['email'] ?? '';
    $senha = $data['senha'] ?? '';
    
    if (empty($nome) || empty($email) || empty($senha)) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos os campos são obrigatórios']);
        exit();
    }
    
    $conn = getConnection();
    
    // Verificar se email já existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email já cadastrado']);
        exit();
    }
    
    // Inserir novo usuário
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'cliente')");
    $stmt->execute([$nome, $email, $senhaHash]);
    
    $usuario = [
        'id' => $conn->lastInsertId(),
        'nome' => $nome,
        'email' => $email,
        'tipo' => 'cliente'
    ];
    
    echo json_encode(['success' => true, 'usuario' => $usuario]);
}

// ATUALIZAR PERFIL
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';
    $nome = $data['nome'] ?? '';
    $email = $data['email'] ?? '';
    $senhaAtual = $data['senhaAtual'] ?? '';
    $novaSenha = $data['novaSenha'] ?? '';
    
    if (empty($id) || empty($nome) || empty($email)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        exit();
    }
    
    $conn = getConnection();
    
    // Verificar senha atual se estiver mudando senha
    if (!empty($novaSenha)) {
        $stmt = $conn->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        $usuario = $stmt->fetch();
        
        if (!password_verify($senhaAtual, $usuario['senha'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Senha atual incorreta']);
            exit();
        }
        
        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?");
        $stmt->execute([$nome, $email, $senhaHash, $id]);
    } else {
        $stmt = $conn->prepare("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?");
        $stmt->execute([$nome, $email, $id]);
    }
    
    echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}
?>
