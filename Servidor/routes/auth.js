const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

function gerarToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

// POST /auth/register
router.post('/register', async (req, res) => {
    const { nome, email, password, role = 'estudante', universidade_id } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e password são obrigatórios.' });
    }
    if (!['estudante', 'anunciante'].includes(role)) {
        return res.status(400).json({ error: 'Role inválido. Escolhe estudante ou anunciante.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });
    }

    try {
        // Verificar se o email já existe
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Este email já está registado.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (email, nome, role, password_hash, universidade_id, data_registo)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id, email, nome, role, foto_url, universidade_id`,
            [email, nome, role, password_hash, universidade_id || null]
        );

        const user = result.rows[0];
        const token = gerarToken(user);

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, nome: user.nome, role: user.role, foto_url: user.foto_url }
        });
    } catch (err) {
        console.error('Erro no registo:', err.message);
        res.status(500).json({ error: 'Erro interno ao registar utilizador.' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e password são obrigatórios.' });
    }

    try {
        const result = await pool.query(
            'SELECT id, email, nome, role, foto_url, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou password incorretos.' });
        }

        const user = result.rows[0];

        if (!user.password_hash) {
            return res.status(401).json({ error: 'Esta conta foi criada com Google. Usa o login Google.' });
        }

        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Email ou password incorretos.' });
        }

        const token = gerarToken(user);

        res.json({
            token,
            user: { id: user.id, email: user.email, nome: user.nome, role: user.role, foto_url: user.foto_url }
        });
    } catch (err) {
        console.error('Erro no login:', err.message);
        res.status(500).json({ error: 'Erro interno ao fazer login.' });
    }
});

// GET /auth/me - Retorna o utilizador autenticado
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, nome, role, foto_url, universidade_id, data_registo FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao obter utilizador:', err.message);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

module.exports = router;
