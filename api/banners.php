<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $conn = getConnection();
    
    // GET - Listar banners
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM banners ORDER BY posicao");
        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar para retornar como objeto
        $bannersObj = [
            'banner1' => '',
            'banner2' => '',
            'banner3' => ''
        ];
        
        foreach ($banners as $banner) {
            $bannersObj['banner' . $banner['posicao']] = $banner['imagem_url'];
        }
        
        echo json_encode(['success' => true, 'banners' => $bannersObj]);
    }
    
    // POST - Salvar banners
    elseif ($method === 'POST') {
        $banner1 = $_POST['banner1'] ?? '';
        $banner2 = $_POST['banner2'] ?? '';
        $banner3 = $_POST['banner3'] ?? '';
        
        // Atualizar cada banner
        $stmt = $conn->prepare("UPDATE banners SET imagem_url = ? WHERE posicao = ?");
        $stmt->execute([$banner1, 1]);
        $stmt->execute([$banner2, 2]);
        $stmt->execute([$banner3, 3]);
        
        echo json_encode(['success' => true, 'message' => 'Banners salvos com sucesso']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
