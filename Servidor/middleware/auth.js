const jwt = require('jsonwebtoken');

/**
 * Middleware: verifica o token JWT no header Authorization: Bearer <token>
 * Anexa req.user = { id, email, role } se válido
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7);

    if (!token) {
        return res.status(401).json({ error: 'Acesso não autorizado. Token em falta.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
}

/**
 * Middleware factory: verifica se o utilizador tem um dos roles permitidos
 * Deve ser usado DEPOIS de authenticateToken
 * @param  {...string} roles - ex: requireRole('admin'), requireRole('anunciante', 'admin')
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Autenticação necessária.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Acesso restrito a: ${roles.join(', ')}.` });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole };
