-- Dados de Teste para o UniStay Coimbra (Seed Data)

-- 1. Limpar e recarregar Universidades principais de Coimbra
TRUNCATE TABLE universidades RESTART IDENTITY CASCADE;

INSERT INTO universidades (nome, alias, descricao, location) VALUES
('Instituto Superior de Engenharia de Coimbra', 'ISEC', 'Vale das Flores • Engenharia e Tecnologia', ST_SetSRID(ST_MakePoint(-8.4115, 40.1925), 4326)),
('Universidade de Coimbra - Polo I', 'Polo 1', 'Alta Universitária • Letras, Direito, Ciências', ST_SetSRID(ST_MakePoint(-8.4260, 40.2074), 4326)),
('Universidade de Coimbra - Polo II', 'Polo 2', 'Pinhal de Marrocos • Engenharias FCTUC', ST_SetSRID(ST_MakePoint(-8.4156, 40.1866), 4326)),
('Universidade de Coimbra - Polo III', 'Polo 3', 'Celas • Medicina, Farmácia e Ciências da Saúde', ST_SetSRID(ST_MakePoint(-8.4112, 40.2185), 4326)),
('Faculdade de Economia da Universidade de Coimbra', 'FEUC', 'Olivais • Economia, Gestão e Sociologia', ST_SetSRID(ST_MakePoint(-8.4068, 40.2138), 4326)),
('Escola Superior de Educação de Coimbra', 'ESEC', 'Solum • Educação, Comunicação e Desporto', ST_SetSRID(ST_MakePoint(-8.4089, 40.2012), 4326));

-- 2. Limpar e recarregar Alojamentos reais em Coimbra
TRUNCATE TABLE anuncios RESTART IDENTITY CASCADE;

INSERT INTO anuncios (titulo, preco, tipo, despesas_incluidas, link_original, imagem_url, slug_curto, location, status) VALUES
-- Perto do ISEC & Polo 2 (Vale das Flores / Norton de Matos)
('Quarto Moderno c/ Varanda no Vale das Flores', 260.00, 'Quarto individual', true, 
 'https://www.olx.pt/d/anuncio/quarto-vale-das-flores-isec-ID12345.html', 
 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
 'vf-quarto1', ST_SetSRID(ST_MakePoint(-8.4125, 40.1932), 4326), 'ativo'),

('Suite Luminosa ao lado do CoimbraShopping / ISEC', 310.00, 'Suite c/ casa de banho', true, 
 'https://www.olx.pt/d/anuncio/suite-coimbrashopping-isec-ID12346.html', 
 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
 'vf-suite2', ST_SetSRID(ST_MakePoint(-8.4102, 40.1945), 4326), 'ativo'),

('Quarto Espaçoso no Bairro Norton de Matos', 240.00, 'Quarto individual', false, 
 'https://www.olx.pt/d/anuncio/quarto-norton-matos-ID12347.html', 
 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
 'nm-quarto3', ST_SetSRID(ST_MakePoint(-8.4140, 40.1902), 4326), 'ativo'),

('Estúdio T0 Totalmente Remodelado no Pinhal de Marrocos', 420.00, 'Estúdio T0', false, 
 'https://www.olx.pt/d/anuncio/estudio-t0-polo2-ID12348.html', 
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
 'p2-estudio4', ST_SetSRID(ST_MakePoint(-8.4162, 40.1878), 4326), 'ativo'),

-- Perto do Polo 1 & Praça da República (Alta Universitária)
('Quarto em Apartamento de Estudantes na Praça da República', 290.00, 'Quarto individual', true, 
 'https://www.olx.pt/d/anuncio/quarto-praca-republica-ID12349.html', 
 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
 'pr-quarto5', ST_SetSRID(ST_MakePoint(-8.4235, 40.2085), 4326), 'ativo'),

('Quarto com Vista Panorâmica na Alta de Coimbra', 275.00, 'Quarto individual', false, 
 'https://www.olx.pt/d/anuncio/quarto-alta-coimbra-ID12350.html', 
 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80',
 'alt-quarto6', ST_SetSRID(ST_MakePoint(-8.4248, 40.2065), 4326), 'ativo'),

('Quarto Duplo Junto às Escadas Monumentais', 220.00, 'Quarto partilhado', true, 
 'https://www.olx.pt/d/anuncio/quarto-monumentais-ID12351.html', 
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
 'mon-quarto7', ST_SetSRID(ST_MakePoint(-8.4215, 40.2078), 4326), 'ativo'),

-- Perto da Solum & ESEC
('Quarto Individual em Frente ao Estádio / Solum', 280.00, 'Quarto individual', true, 
 'https://www.olx.pt/d/anuncio/quarto-solum-estadio-ID12352.html', 
 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
 'sol-quarto8', ST_SetSRID(ST_MakePoint(-8.4095, 40.2025), 4326), 'ativo'),

('Apartamento T1 Renovado na Rua General Humberto Delgado', 480.00, 'Apartamento T1', false, 
 'https://www.olx.pt/d/anuncio/t1-solum-esec-ID12353.html', 
 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
 'sol-t1-9', ST_SetSRID(ST_MakePoint(-8.4072, 40.2038), 4326), 'ativo'),

-- Perto do Polo 3 & FEUC (Celas / Olivais)
('Suite com Varanda Privada em Celas (Perto HUC / Polo 3)', 340.00, 'Suite c/ casa de banho', true, 
 'https://www.olx.pt/d/anuncio/suite-celas-polo3-ID12354.html', 
 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
 'cel-suite10', ST_SetSRID(ST_MakePoint(-8.4128, 40.2175), 4326), 'ativo'),

('Quarto Aconchegante na Cruz de Celas', 250.00, 'Quarto individual', false, 
 'https://www.olx.pt/d/anuncio/quarto-cruz-celas-ID12355.html', 
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
 'cel-quarto11', ST_SetSRID(ST_MakePoint(-8.4145, 40.2152), 4326), 'ativo'),

('Quarto para Estudante junto à FEUC (Avenida Dias da Silva)', 270.00, 'Quarto individual', true, 
 'https://www.olx.pt/d/anuncio/quarto-feuc-dias-silva-ID12356.html', 
 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
 'feuc-quarto12', ST_SetSRID(ST_MakePoint(-8.4082, 40.2125), 4326), 'ativo');
