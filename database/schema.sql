-- Schema UniStay Coimbra
-- PostgreSQL com extensão PostGIS para consultas geoespaciais

CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabela de Universidades / Polos
CREATE TABLE IF NOT EXISTS universidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    alias VARCHAR(50) NOT NULL,
    descricao VARCHAR(255),
    location GEOGRAPHY(Point, 4326) NOT NULL
);

-- Tabela de Anúncios de Quartos
CREATE TABLE IF NOT EXISTS anuncios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'Quarto individual',
    despesas_incluidas BOOLEAN DEFAULT false,
    link_original TEXT NOT NULL,
    imagem_url TEXT,
    slug_curto VARCHAR(50) UNIQUE,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    cliques INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices espaciais GIST para máxima performance nas consultas ST_DWithin e ST_Distance
CREATE INDEX IF NOT EXISTS idx_universidades_location ON universidades USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_anuncios_location ON anuncios USING GIST (location);
