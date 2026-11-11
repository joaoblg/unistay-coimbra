import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';
const TOKEN_KEY = 'unistay_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       // { id, nome, email, role, foto_url }
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // a verificar token inicial
    const [favoritos, setFavoritos] = useState([]); // array de anuncio_ids guardados

    // Validar token guardado no localStorage ao iniciar
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
            fetch(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${savedToken}` }
            })
                .then(r => r.ok ? r.json() : null)
                .then(userData => {
                    if (userData) {
                        setUser(userData);
                        setToken(savedToken);
                    } else {
                        localStorage.removeItem(TOKEN_KEY);
                    }
                })
                .catch(() => localStorage.removeItem(TOKEN_KEY))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Carregar favoritos quando o utilizador é estudante/admin
    useEffect(() => {
        if (user && token && (user.role === 'estudante' || user.role === 'admin')) {
            fetch(`${API_BASE}/favoritos`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : [])
                .then(lista => setFavoritos(lista.map(f => f.id)))
                .catch(() => setFavoritos([]));
        } else {
            setFavoritos([]);
        }
    }, [user, token]);

    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (nome, email, password, role, universidade_id) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, password, role, universidade_id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao registar');
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setFavoritos([]);
    }, []);

    const toggleFavorito = useCallback(async (anuncioId) => {
        if (!token) return;
        const isFav = favoritos.includes(anuncioId);
        const method = isFav ? 'DELETE' : 'POST';
        try {
            const res = await fetch(`${API_BASE}/favoritos/${anuncioId}`, {
                method,
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setFavoritos(prev =>
                    isFav ? prev.filter(id => id !== anuncioId) : [...prev, anuncioId]
                );
            }
        } catch (err) {
            console.error('Erro ao alterar favorito:', err);
        }
    }, [token, favoritos]);

    const value = {
        user,
        token,
        loading,
        favoritos,
        login,
        register,
        logout,
        toggleFavorito,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        isAnunciante: user?.role === 'anunciante',
        isEstudante: user?.role === 'estudante',
        canFavorite: user?.role === 'estudante' || user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    return ctx;
}
