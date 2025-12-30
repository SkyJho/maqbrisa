<?php
// Script para criar/resetar a senha do administrador
require_once '../config/database.php';

$senha = 'admin123';
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

echo "Hash gerado para senha 'admin123':\n";
echo $senhaHash . "\n\n";

try {
    $conn = getConnection();
    
    // Verificar se admin já existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = 'admin@maqbrisa.com'");
    $stmt->execute();
    $adminExiste = $stmt->fetch();
    
    if ($adminExiste) {
        // Atualizar senha
        $stmt = $conn->prepare("UPDATE usuarios SET senha = ? WHERE email = 'admin@maqbrisa.com'");
        $stmt->execute([$senhaHash]);
        echo "✓ Senha do admin atualizada com sucesso!\n";
    } else {
        // Criar admin
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Administrador', 'admin@maqbrisa.com', $senhaHash, 'admin']);
        echo "✓ Admin criado com sucesso!\n";
    }
    
    echo "\nCredenciais de login:\n";
    echo "E-mail: admin@maqbrisa.com\n";
    echo "Senha: admin123\n";
    
} catch (Exception $e) {
    echo "✗ Erro: " . $e->getMessage() . "\n";
}
?>
