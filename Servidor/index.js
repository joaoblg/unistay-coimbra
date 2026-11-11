require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { authenticateToken, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'unistay_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// =====================
// Rotas de Autenticação
// =====================
app.use('/auth', require('./routes/auth'));

// =====================
// Rotas de Favoritos
// =====================
app.use('/favoritos', require('./routes/favoritos'));

// =====================
// Rotas de Admin
// =====================
app.use('/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Listar todas as Universidades e Polos com coordenadas exatas
app.get('/universidades', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                nome, 
                alias, 
                descricao,
                ST_X(location::geometry) AS lon, 
                ST_Y(location::geometry) AS lat 
            FROM universidades
            ORDER BY id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar universidades:', err.message);
        res.status(500).json({ error: 'Erro ao consultar base de dados' });
    }
});

// 2. Listar quartos próximos de coordenadas (lat, lon) com PostGIS
app.get('/quartos', async (req, res) => {
    const { lat, lon, raio = 2500, maxPrice, tipo } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordenadas lat e lon são obrigatórias.' });
    }

    try {
        let query = `
            SELECT 
                id, 
                titulo, 
                preco, 
                tipo,
                despesas_incluidas,
                slug_curto, 
                imagem_url, 
                link_original,
                ST_X(location::geometry) AS lon,
                ST_Y(location::geometry) AS lat,
                ROUND(ST_Distance(
                    location, 
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                )) AS distancia
            FROM anuncios
            WHERE status = 'ativo'
              AND ST_DWithin(
                    location, 
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
                    $3
              )
        `;

        const params = [parseFloat(lon), parseFloat(lat), parseFloat(raio)];

        if (maxPrice) {
            params.push(parseFloat(maxPrice));
            query += ` AND preco <= $${params.length}`;
        }

        if (tipo && tipo !== 'todos') {
            params.push(tipo);
            query += ` AND tipo = $${params.length}`;
        }

        query += ` ORDER BY distancia ASC;`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar quartos por proximidade:', err.message);
        res.status(500).json({ error: 'Erro ao consultar quartos' });
    }
});

// 3. Listar TODOS os quartos ativos (para visão geral e painel de administração)
app.get('/quartos/todos', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                titulo, 
                preco, 
                tipo,
                despesas_incluidas,
                slug_curto, 
                imagem_url, 
                link_original,
                user_id,
                ST_X(location::geometry) AS lon,
                ST_Y(location::geometry) AS lat,
                criado_em
            FROM anuncios
            WHERE status = 'ativo'
            ORDER BY criado_em DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar todos os quartos:', err.message);
        res.status(500).json({ error: 'Erro ao consultar todos os quartos' });
    }
});

// 4. Criar novo anúncio de quarto - requer anunciante ou admin
app.post('/quartos', authenticateToken, requireRole('anunciante', 'admin'), async (req, res) => {
    const { 
        titulo, 
        preco, 
        tipo = 'Quarto individual', 
        despesas_incluidas = false, 
        link_original, 
        imagem_url, 
        lat, 
        lon 
    } = req.body;

    if (!titulo || !preco || !lat || !lon) {
        return res.status(400).json({ error: 'Título, preço, latitude e longitude são obrigatórios.' });
    }

    try {
        const slug = 'quarto-' + Math.random().toString(36).slice(2, 9);
        const query = `
            INSERT INTO anuncios (
                titulo, preco, tipo, despesas_incluidas, 
                link_original, imagem_url, slug_curto, 
                location, status, user_id
            )
            VALUES (
                $1, $2, $3, $4, 
                $5, $6, $7, 
                ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography, 
                'ativo', $10
            )
            RETURNING 
                id, titulo, preco, tipo, despesas_incluidas,
                link_original, imagem_url, slug_curto,
                ST_X(location::geometry) AS lon,
                ST_Y(location::geometry) AS lat;
        `;
        const values = [
            titulo, 
            parseFloat(preco), 
            tipo, 
            Boolean(despesas_incluidas), 
            link_original || 'https://olx.pt', 
            imagem_url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 
            slug, 
            parseFloat(lon), 
            parseFloat(lat),
            req.user.id
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar quarto:', err.message);
        res.status(500).json({ error: 'Erro ao cadastrar quarto no banco de dados' });
    }
});

// 5. Apagar anúncio por ID - requer auth; anunciantes só podem apagar os seus
app.delete('/quartos/:id', authenticateToken, requireRole('anunciante', 'admin'), async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar propriedade
        const anuncio = await pool.query('SELECT user_id FROM anuncios WHERE id = $1', [id]);
        if (anuncio.rows.length === 0) {
            return res.status(404).json({ error: 'Anúncio não encontrado' });
        }
        if (req.user.role !== 'admin' && anuncio.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Só podes apagar os teus próprios anúncios.' });
        }

        const result = await pool.query('DELETE FROM anuncios WHERE id = $1 RETURNING id', [id]);
        res.json({ message: 'Quarto removido com sucesso!', id: result.rows[0].id });
    } catch (err) {
        console.error('Erro ao apagar quarto:', err.message);
        res.status(500).json({ error: 'Erro ao apagar quarto' });
    }
});

// 6. Editar anúncio - requer auth; anunciantes só podem editar os seus
app.patch('/quartos/:id', authenticateToken, requireRole('anunciante', 'admin'), async (req, res) => {
    const { id } = req.params;
    const { titulo, preco, tipo, despesas_incluidas, imagem_url, link_original } = req.body;

    try {
        const anuncio = await pool.query('SELECT user_id FROM anuncios WHERE id = $1', [id]);
        if (anuncio.rows.length === 0) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }
        if (req.user.role !== 'admin' && anuncio.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Só podes editar os teus próprios anúncios.' });
        }

        const result = await pool.query(
            `UPDATE anuncios SET
                titulo = COALESCE($1, titulo),
                preco = COALESCE($2, preco),
                tipo = COALESCE($3, tipo),
                despesas_incluidas = COALESCE($4, despesas_incluidas),
                imagem_url = COALESCE($5, imagem_url),
                link_original = COALESCE($6, link_original)
             WHERE id = $7
             RETURNING id, titulo, preco, tipo, despesas_incluidas, imagem_url, link_original`,
            [titulo, preco ? parseFloat(preco) : null, tipo, despesas_incluidas, imagem_url, link_original, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao editar quarto:', err.message);
        res.status(500).json({ error: 'Erro ao editar quarto.' });
    }
});

app.listen(PORT, () => {
    console.log(`UniStay Coimbra API rodando na porta ${PORT}`);
});
