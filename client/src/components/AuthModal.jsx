import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Building2, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

export default function AuthModal({ onClose }) {
    const { login, register } = useAuth();
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Campos login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Campos registo
    const [regNome, setRegNome] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regRole, setRegRole] = useState('estudante');
    const [regUniId, setRegUniId] = useState('');
    const [universidades, setUniversidades] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/universidades`)
            .then(r => r.json())
            .then(setUniversidades)
            .catch(() => {});
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            onClose();
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErro('');
        if (regPassword.length < 6) {
            setErro('A password deve ter pelo menos 6 caracteres.');
            return;
        }
        setLoading(true);
        try {
            await register(
                regNome,
                regEmail,
                regPassword,
                regRole,
                regRole === 'estudante' && regUniId ? parseInt(regUniId) : null
            );
            onClose();
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="auth-modal" role="dialog" aria-modal="true">
                <button className="auth-close" onClick={onClose} aria-label="Fechar">
                    <X size={20} />
                </button>

                <div className="auth-brand">
                    <span className="auth-logo-icon">🏠</span>
                    <strong>UniStay Coimbra</strong>
                </div>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => { setTab('login'); setErro(''); }}
                    >
                        <LogIn size={16} /> Entrar
                    </button>
                    <button
                        className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
                        onClick={() => { setTab('register'); setErro(''); }}
                    >
                        <UserPlus size={16} /> Registar
                    </button>
                </div>

                {/* Erro */}
                {erro && <div className="auth-error">{erro}</div>}

                {/* LOGIN */}
                {tab === 'login' && (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="auth-field">
                            <Mail size={16} className="auth-field-icon" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="auth-field">
                            <Lock size={16} className="auth-field-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(v => !v)}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'A entrar...' : 'Entrar'}
                        </button>
                        <p className="auth-switch-hint">
                            Ainda não tens conta?{' '}
                            <button type="button" className="auth-link-btn" onClick={() => { setTab('register'); setErro(''); }}>
                                Registar
                            </button>
                        </p>
                    </form>
                )}

                {/* REGISTER */}
                {tab === 'register' && (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <div className="auth-field">
                            <User size={16} className="auth-field-icon" />
                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={regNome}
                                onChange={e => setRegNome(e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>
                        <div className="auth-field">
                            <Mail size={16} className="auth-field-icon" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={regEmail}
                                onChange={e => setRegEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="auth-field">
                            <Lock size={16} className="auth-field-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password (mín. 6 caracteres)"
                                value={regPassword}
                                onChange={e => setRegPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(v => !v)}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>

                        {/* Selector de Role */}
                        <div className="auth-role-selector">
                            <p className="auth-role-label">Sou um...</p>
                            <div className="auth-role-options">
                                <button
                                    type="button"
                                    className={`auth-role-btn ${regRole === 'estudante' ? 'selected' : ''}`}
                                    onClick={() => setRegRole('estudante')}
                                >
                                    🎓 Estudante
                                    <span>Procuro alojamento</span>
                                </button>
                                <button
                                    type="button"
                                    className={`auth-role-btn ${regRole === 'anunciante' ? 'selected' : ''}`}
                                    onClick={() => setRegRole('anunciante')}
                                >
                                    🏠 Anunciante
                                    <span>Tenho quartos para arrendar</span>
                                </button>
                            </div>
                        </div>

                        {/* Universidade — apenas para estudantes */}
                        {regRole === 'estudante' && universidades.length > 0 && (
                            <div className="auth-field">
                                <Building2 size={16} className="auth-field-icon" />
                                <select
                                    value={regUniId}
                                    onChange={e => setRegUniId(e.target.value)}
                                >
                                    <option value="">Polo / Faculdade (opcional)</option>
                                    {universidades.map(u => (
                                        <option key={u.id} value={u.id}>{u.alias} — {u.nome.split(' - ')[1] || u.nome}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'A criar conta...' : 'Criar Conta'}
                        </button>
                        <p className="auth-switch-hint">
                            Já tens conta?{' '}
                            <button type="button" className="auth-link-btn" onClick={() => { setTab('login'); setErro(''); }}>
                                Entrar
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
