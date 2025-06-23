-- Inserir equipamentos de teste
INSERT INTO equipments (name, amount, image_url) VALUES 
('Bola Mikasa', 4, '/placeholder.jpg'),
('Bola Penalty', 2, '/placeholder.jpg'),
('Raquete Beach Tennis', 6, '/placeholder.jpg'),
('Rede Vôlei', 1, '/placeholder.jpg'),
('Varetas', 8, '/placeholder.jpg'),
('Placar Manual', 3, '/placeholder.jpg');

-- Verificar se foram inseridos
SELECT * FROM equipments; 