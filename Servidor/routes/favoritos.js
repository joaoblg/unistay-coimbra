const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken, requireRole } = require('../middleware/auth');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// GET /favoritos - Listar favoritos do utilizador autenticado
router.get('/', authenticateToken, requireRole('estudante', 'admin'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                f.id AS favorito_id,
                f.criado_em,
                a.id,
                a.titulo,
                a.preco,
                a.tipo,
                a.despesas_incluidas,
                a.imagem_url,
                a.link_original,
                a.slug_curto,
                ST_X(a.location::geometry) AS lon,
                ST_Y(a.location::geometry) AS lat
             FROM favoritos f
             JOIN anuncios a ON a.id = f.anuncio_id
             WHERE f.user_id = $1
             ORDER BY f.criado_em DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar favoritos:', err.message);
        res.status(500).json({ error: 'Erro ao buscar favoritos.' });
    }
});

// POST /favoritos/:anuncioId - Guardar favorito
router.post('/:anuncioId', authenticateToken, requireRole('estudante', 'admin'), async (req, res) => {
    const { anuncioId } = req.params;
    try {
        // Verificar se o anúncio existe
        const anuncio = await pool.query('SELECT id FROM anuncios WHERE id = $1', [anuncioId]);
        if (anuncio.rows.length === 0) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        await pool.query(
            'INSERT INTO favoritos (user_id, anuncio_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user.id, anuncioId]
        );
        res.status(201).json({ message: 'Guardado nos favoritos!' });
    } catch (err) {
        console.error('Erro ao guardar favorito:', err.message);
        res.status(500).json({ error: 'Erro ao guardar favorito.' });
    }
});

// DELETE /favoritos/:anuncioId - Remover favorito
router.delete('/:anuncioId', authenticateToken, requireRole('estudante', 'admin'), async (req, res) => {
    const { anuncioId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM favoritos WHERE user_id = $1 AND anuncio_id = $2 RETURNING id',
            [req.user.id, anuncioId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Favorito não encontrado.' });
        }
        res.json({ message: 'Removido dos favoritos.' });
    } catch (err) {
        console.error('Erro ao remover favorito:', err.message);
        res.status(500).json({ error: 'Erro ao remover favorito.' });
    }
});

module.exports = router;
