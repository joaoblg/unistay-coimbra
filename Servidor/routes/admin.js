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

// GET /admin/users - Listar todos os utilizadores (apenas admin)
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, nome, role, foto_url, universidade_id, data_registo
             FROM users ORDER BY data_registo DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar utilizadores:', err.message);
        res.status(500).json({ error: 'Erro ao buscar utilizadores.' });
    }
});

// PATCH /admin/users/:id/role - Alterar role de um utilizador (apenas admin)
router.patch('/users/:id/role', authenticateToken, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['estudante', 'anunciante', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role inválido.' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, nome, role',
            [role, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao alterar role:', err.message);
        res.status(500).json({ error: 'Erro ao alterar role.' });
    }
});

// DELETE /admin/users/:id - Apagar utilizador (apenas admin)
router.delete('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }
        res.json({ message: 'Utilizador removido.' });
    } catch (err) {
        console.error('Erro ao apagar utilizador:', err.message);
        res.status(500).json({ error: 'Erro ao apagar utilizador.' });
    }
});

module.exports = router;
