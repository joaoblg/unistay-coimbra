import { useState, useEffect, useMemo } from 'react';
import { Trash2, ArrowLeft, PlusCircle, CheckCircle, AlertCircle, MapPin, Euro, Home } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

export default function Admin({ aoVoltar, universidades = [] }) {
  const [form, setForm] = useState({
    titulo: '',
    preco: '',
    tipo: 'Quarto individual',
    despesas_incluidas: true,
    link_original: '',
    imagem_url: '',
    lat: '40.1925',
    lon: '-8.4115'
  });

  const [listaQuartos, setListaQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const carregarQuartos = () => {
    setLoading(true);
    fetch(`${API_BASE}/quartos/todos`)
      .then(res => res.json())
      .then(dados => {
        setListaQuartos(dados);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar quartos:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarQuartos();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // Preenchimento rápido de coordenadas com base nos polos
  const aplicarCoordenadasUni = (uni) => {
    setForm({
      ...form,
      lat: (parseFloat(uni.lat) + (Math.random() * 0.002 - 0.001)).toFixed(6),
      lon: (parseFloat(uni.lon) + (Math.random() * 0.002 - 0.001)).toFixed(6)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');

    try {
      const resposta = await fetch(`${API_BASE}/quartos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (resposta.ok) {
        setMensagemSucesso('Anúncio cadastrado com sucesso com indexação espacial PostGIS!');
        setForm({
          titulo: '',
          preco: '',
          tipo: 'Quarto individual',
          despesas_incluidas: true,
          link_original: '',
          imagem_url: '',
          lat: form.lat,
          lon: form.lon
        });
        carregarQuartos();
        setTimeout(() => setMensagemSucesso(''), 4000);
      } else {
        const err = await resposta.json();
        setMensagemErro(err.error || 'Erro ao cadastrar anúncio.');
      }
    } catch (err) {
      setMensagemErro('Não foi possível conectar ao servidor backend.');
    }
  };

  const apagarQuarto = async (id, titulo) => {
    if (!window.confirm(`Tens a certeza que desejas remover o anúncio:\n"${titulo}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/quartos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setListaQuartos(listaQuartos.filter(q => q.id !== id));
      } else {
        alert('Erro ao apagar anúncio.');
      }
    } catch (err) {
      alert('Erro de conexão ao apagar anúncio.');
    }
  };

  // Métricas rápidas
  const precoMedio = useMemo(() => {
    if (listaQuartos.length === 0) return 0;
    const soma = listaQuartos.reduce((acc, q) => acc + parseFloat(q.preco || 0), 0);
    return Math.round(soma / listaQuartos.length);
  }, [listaQuartos]);

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Topbar Admin */}
        <div className="admin-topbar">
          <button onClick={aoVoltar} className="btn-back">
            <ArrowLeft size={16} /> Voltar ao Mapa de Alojamentos
          </button>
          <div className="admin-badge">
            ⚙️ Painel de Gestão UniStay
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <Home className="stat-icon" size={24} />
            <div>
              <div className="stat-number">{listaQuartos.length}</div>
              <div className="stat-label">Anúncios Ativos</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <Euro className="stat-icon" size={24} />
            <div>
              <div className="stat-number">€{precoMedio}</div>
              <div className="stat-label">Preço Médio / Mês</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <MapPin className="stat-icon" size={24} />
            <div>
              <div className="stat-number">6</div>
              <div className="stat-label">Polos Universitários Cobertos</div>
            </div>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {mensagemSucesso && (
          <div className="alert-box success">
            <CheckCircle size={18} /> {mensagemSucesso}
          </div>
        )}
        {mensagemErro && (
          <div className="alert-box error">
            <AlertCircle size={18} /> {mensagemErro}
          </div>
        )}

        {/* Layout 2 Colunas */}
        <div className="admin-layout-grid">
          {/* Formulário Novo Quarto */}
          <div className="admin-card">
            <div className="admin-card-header">
              <PlusCircle size={20} className="header-icon" />
              <h3>Adicionar Novo Alojamento</h3>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Título do Anúncio *</label>
                <input
                  name="titulo"
                  value={form.titulo}
                  placeholder="Ex: Quarto Luminoso no Vale das Flores"
                  required
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Preço Mensal (€) *</label>
                  <input
                    name="preco"
                    type="number"
                    step="5"
                    value={form.preco}
                    placeholder="Ex: 270"
                    required
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label>Tipologia</label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="admin-input"
                  >
                    <option value="Quarto individual">Quarto individual</option>
                    <option value="Suite c/ casa de banho">Suite c/ WC privativo</option>
                    <option value="Quarto partilhado">Quarto partilhado</option>
                    <option value="Estúdio T0">Estúdio T0</option>
                    <option value="Apartamento T1">Apartamento T1</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    name="despesas_incluidas"
                    checked={form.despesas_incluidas}
                    onChange={handleChange}
                  />
                  <span>Despesas incluídas (água, luz, internet)</span>
                </label>
              </div>

              <div className="form-group">
                <label>Link do Anúncio Original (OLX, Idealista) *</label>
                <input
                  name="link_original"
                  value={form.link_original}
                  placeholder="https://www.olx.pt/d/anuncio/..."
                  required
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>URL da Fotografia</label>
                <input
                  name="imagem_url"
                  value={form.imagem_url}
                  placeholder="https://images.unsplash.com/..."
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Preenchimento rápido de coordenadas:</label>
                <div className="preset-buttons">
                  {universidades.map(u => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => aplicarCoordenadasUni(u)}
                      className="preset-btn"
                    >
                      Perto de {u.alias}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Latitude (GPS) *</label>
                  <input
                    name="lat"
                    value={form.lat}
                    placeholder="40.1925"
                    required
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude (GPS) *</label>
                  <input
                    name="lon"
                    value={form.lon}
                    placeholder="-8.4115"
                    required
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn-admin-submit">
                Gravar Anúncio com PostGIS 🚀
              </button>
            </form>
          </div>

          {/* Lista de Gestão */}
          <div className="admin-card">
            <div className="admin-card-header">
              <Home size={20} className="header-icon" />
              <h3>Alojamentos Registados ({listaQuartos.length})</h3>
            </div>

            <div className="admin-rooms-list">
              {loading ? (
                <p>A carregar lista...</p>
              ) : listaQuartos.length === 0 ? (
                <p>Nenhum alojamento registado ainda.</p>
              ) : (
                listaQuartos.map(q => (
                  <div key={q.id} className="admin-room-item">
                    <img 
                      src={q.imagem_url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200"} 
                      alt={q.titulo}
                      className="admin-room-thumb" 
                    />
                    <div className="admin-room-info">
                      <div className="admin-room-title">{q.titulo}</div>
                      <div className="admin-room-meta">
                        <span className="admin-room-price">€{Math.round(q.preco)}/mês</span>
                        <span className="admin-room-type">• {q.tipo || 'Quarto'}</span>
                        {q.despesas_incluidas && <span className="admin-room-badge">Contas Incl.</span>}
                      </div>
                      <div className="admin-room-coords">
                        GPS: {parseFloat(q.lat).toFixed(4)}, {parseFloat(q.lon).toFixed(4)}
                      </div>
                    </div>
                    <button
                      onClick={() => apagarQuarto(q.id, q.titulo)}
                      className="btn-admin-delete"
                      title="Eliminar este anúncio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
