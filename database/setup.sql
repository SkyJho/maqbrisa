-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS maqbrisa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE maqbrisa;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'cliente') DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos residenciais
CREATE TABLE IF NOT EXISTS produtos_residenciais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    imagem LONGTEXT NOT NULL,
    descricao TEXT,
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos industriais
CREATE TABLE IF NOT EXISTS produtos_industriais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    imagem LONGTEXT NOT NULL,
    descricao TEXT,
    acessorios TEXT,
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de banners do carrossel
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    posicao INT NOT NULL UNIQUE,
    imagem_url VARCHAR(500) NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Removido INSERT do admin - use o script criar_admin.php para criar/resetar a senha

-- Inserir banners padrão
INSERT INTO banners (posicao, imagem_url) VALUES 
(1, 'img/banner1.jpg'),
(2, 'img/banner2.jpg'),
(3, 'img/banner3.jpg')
ON DUPLICATE KEY UPDATE imagem_url = VALUES(imagem_url);
