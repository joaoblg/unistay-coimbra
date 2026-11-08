import { useEffect, useState, useMemo } from 'react';
import Logo from './Logo.jsx';
import Mapa from './Mapa.jsx';
import Admin from './Admin.jsx';
import { 
  Building2, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Filter, 
  ArrowUpDown,
  Home,
  ShieldCheck
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:3000';

function App() {
  const [universidades, setUniversidades] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [uniSelecionada, setUniSelecionada] = useState(null); // null = todas as universidades
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [pagina, setPagina] = useState('home'); // 'home' | 'admin'
  const [carregando, setCarregando] = useState(false);

  // Filtros locais
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [precoMax, setPrecoMax] = useState(500);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [apenasContasIncluidas, setApenasContasIncluidas] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('distancia'); // 'distancia' | 'preco-asc' | 'preco-desc'

  // 1. Carregar Universidades na inicialização
  useEffect(() => {
    fetch(`${API_BASE}/universidades`)
      .then(res => res.json())
      .then(dados => {
        setUniversidades(dados);
        // Seleciona ISEC por padrão para carregar logo uma experiência rica
        const defaultUni = dados.find(u => u.alias === 'ISEC') || dados[0];
        if (defaultUni) {
          selecionarUni(defaultUni);
        }
      })
      .catch(err => console.error('Erro ao buscar universidades:', err));
  }, []);

  // 2. Carregar Quartos por proximidade do Polo selecionado
  const selecionarUni = (uni) => {
    setUniSelecionada(uni);
    setQuartoSelecionado(null);
    setCarregando(true);

    if (uni) {
      fetch(`${API_BASE}/quartos?lat=${uni.lat}&lon=${uni.lon}&raio=3000`)
        .then(res => res.json())
        .then(dados => {
          setQuartos(dados);
          setCarregando(false);
        })
        .catch(err => {
          console.error('Erro ao carregar quartos da universidade:', err);
          setCarregando(false);
        });
    } else {
      // Carregar todos os quartos
      fetch(`${API_BASE}/quartos/todos`)
        .then(res => res.json())
        .then(dados => {
          setQuartos(dados);
          setCarregando(false);
        })
        .catch(err => {
          console.error('Erro ao carregar todos os quartos:', err);
          setCarregando(false);
        });
    }
  };

  // 3. Filtrar e Ordenar a lista em tempo real
  const quartosFiltrados = useMemo(() => {
    return quartos
      .filter(q => {
        const matchesSearch = 
          q.titulo?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
          q.tipo?.toLowerCase().includes(termoPesquisa.toLowerCase());
        const matchesPrice = parseFloat(q.preco) <= precoMax;
        const matchesTipo = tipoFiltro === 'todos' || q.tipo === tipoFiltro;
        const matchesDespesas = !apenasContasIncluidas || q.despesas_incluidas;

        return matchesSearch && matchesPrice && matchesTipo && matchesDespesas;
      })
      .sort((a, b) => {
        if (ordenarPor === 'distancia') {
          return (a.distancia ?? 99999) - (b.distancia ?? 99999);
        }
        if (ordenarPor === 'preco-asc') {
          return parseFloat(a.preco) - parseFloat(b.preco);
        }
        if (ordenarPor === 'preco-desc') {
          return parseFloat(b.preco) - parseFloat(a.preco);
        }
        return 0;
      });
  }, [quartos, termoPesquisa, precoMax, tipoFiltro, apenasContasIncluidas, ordenarPor]);

  return (
    <>
      {pagina === 'admin' ? (
        <Admin 
          universidades={universidades}
          aoVoltar={() => {
            setPagina('home');
            if (uniSelecionada) selecionarUni(uniSelecionada);
          }} 
        />
      ) : (
        <div className="main-wrapper">
          {/* Topbar / Navigation */}
          <nav className="top-navbar">
            <div className="nav-container">
              <Logo />
              <div className="nav-actions">
                <span className="location-badge">
                  <MapPin size={15} /> Coimbra, Portugal
                </span>
                <button 
                  onClick={() => setPagina('admin')} 
                  className="nav-admin-btn"
                  title="Gerir quartos e anúncios"
                >
                  Painel de Gestão ⚙️
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Header */}
          <header className="hero-section">
            <div className="hero-tag">
              <Sparkles size={14} /> Plataforma Geoespacial de Alojamento Universitário
            </div>
            <h1 className="hero-title">
              Encontra o teu quarto a passos da faculdade.
            </h1>
            <p className="hero-subtitle">
              Calculamos as distâncias a pé reais com base nas coordenadas GPS de cada polo de Coimbra.
            </p>

            {/* Selector de Campus / Faculdades */}
            <div className="campus-bar">
              <button
                onClick={() => selecionarUni(null)}
                className={`campus-pill ${uniSelecionada === null ? 'active' : ''}`}
              >
                🌍 Ver Todos em Coimbra
              </button>
              {universidades.map(u => (
                <button
                  key={u.id}
                  onClick={() => selecionarUni(u)}
                  className={`campus-pill ${uniSelecionada?.id === u.id ? 'active' : ''}`}
                >
                  🎓 <strong>{u.alias}</strong>
                  <span className="campus-sub">{u.nome.split(' - ')[1] || u.alias}</span>
                </button>
              ))}
            </div>
          </header>

          {/* Secção de Filtros Rápidos */}
          <section className="filters-strip">
            <div className="filter-group search-group">
              <Search size={18} className="filter-icon" />
              <input
                type="text"
                placeholder="Pesquisar por rua, zona ou tipologia..."
                value={termoPesquisa}
                onChange={e => setTermoPesquisa(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Preço Máx: <strong>{precoMax}€</strong></label>
              <input
                type="range"
                min="180"
                max="600"
                step="10"
                value={precoMax}
                onChange={e => setPrecoMax(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Tipologia</label>
              <select 
                value={tipoFiltro} 
                onChange={e => setTipoFiltro(e.target.value)}
                className="select-filter"
              >
                <option value="todos">Todas as Tipologias</option>
                <option value="Quarto individual">Quarto individual</option>
                <option value="Suite c/ casa de banho">Suite c/ WC privativo</option>
                <option value="Quarto partilhado">Quarto partilhado</option>
                <option value="Estúdio T0">Estúdio T0</option>
                <option value="Apartamento T1">Apartamento T1</option>
              </select>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={apenasContasIncluidas}
                  onChange={e => setApenasContasIncluidas(e.target.checked)}
                />
                <span>Contas Incluídas</span>
              </label>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ordenar por</label>
              <select 
                value={ordenarPor} 
                onChange={e => setOrdenarPor(e.target.value)}
                className="select-filter"
              >
                <option value="distancia">Mais Próximo (a pé)</option>
                <option value="preco-asc">Preço: Menor para Maior</option>
                <option value="preco-desc">Preço: Maior para Menor</option>
              </select>
            </div>
          </section>

          {/* Mapa Interativo Geoespacial Leaflet */}
          <section className="map-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-heading">
                  {uniSelecionada ? `📍 Mapa em redor do ${uniSelecionada.alias}` : '📍 Todos os Alojamentos em Coimbra'}
                </h2>
                <p className="section-subheading">
                  {uniSelecionada?.descricao || 'Clica num pin para ver o preço e a distância exata até ao polo'}
                </p>
              </div>
              <div className="results-badge">
                {quartosFiltrados.length} alojamento{quartosFiltrados.length === 1 ? '' : 's'} encontrado{quartosFiltrados.length === 1 ? '' : 's'}
              </div>
            </div>

            <Mapa
              uni={uniSelecionada}
              quartos={quartosFiltrados}
              quartoSelecionado={quartoSelecionado}
              onSelectQuarto={setQuartoSelecionado}
              raio={2500}
            />
          </section>

          {/* Grelha de Cartões de Alojamento */}
          <section className="listings-section">
            <h3 className="listings-title">
              {uniSelecionada 
                ? `Alojamentos disponíveis perto de ${uniSelecionada.alias}` 
                : 'Todos os Alojamentos'}
            </h3>

            {carregando ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>A calcular distâncias geoespaciais com PostGIS...</p>
              </div>
            ) : quartosFiltrados.length > 0 ? (
              <div className="listings-grid">
                {quartosFiltrados.map((quarto) => {
                  const isSelected = quartoSelecionado?.id === quarto.id;
                  const minutosAPe = quarto.distancia !== undefined ? Math.round(quarto.distancia / 80) : null;

                  return (
                    <article 
                      key={quarto.id} 
                      className={`listing-card ${isSelected ? 'card-selected' : ''}`}
                      onClick={() => setQuartoSelecionado(quarto)}
                    >
                      <div className="card-thumb-wrapper">
                        <img 
                          src={quarto.imagem_url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"} 
                          alt={quarto.titulo}
                          className="card-thumb"
                          loading="lazy"
                        />
                        <div className="thumb-badges">
                          <span className="type-tag">{quarto.tipo || 'Quarto'}</span>
                          {quarto.despesas_incluidas && (
                            <span className="bills-tag">✓ Despesas Incluídas</span>
                          )}
                        </div>
                      </div>

                      <div className="card-details">
                        <h4 className="card-heading" title={quarto.titulo}>
                          {quarto.titulo}
                        </h4>

                        <div className="card-metrics">
                          <div className="card-price-tag">
                            <span className="price-val">€{Math.round(quarto.preco)}</span>
                            <span className="price-period">/mês</span>
                          </div>

                          {quarto.distancia !== undefined && (
                            <div className="walk-metric" title={`${Math.round(quarto.distancia)} metros da universidade`}>
                              <Clock size={14} className="walk-icon" />
                              <span><strong>{minutosAPe} min</strong> a pé</span>
                              <span className="dist-sub">({Math.round(quarto.distancia)}m)</span>
                            </div>
                          )}
                        </div>

                        <div className="card-footer-actions">
                          <button 
                            className="btn-locate-map"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuartoSelecionado(quarto);
                              window.scrollTo({ top: 400, behavior: 'smooth' });
                            }}
                          >
                            Ver no Mapa 🗺️
                          </button>

                          <a 
                            href={quarto.link_original} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-view-external"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Ver Anúncio</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Home size={44} className="empty-icon" />
                <h4>Nenhum quarto corresponde aos filtros selecionados</h4>
                <p>Tenta aumentar o preço máximo ou selecionar outro polo de Coimbra.</p>
                <button 
                  onClick={() => {
                    setTermoPesquisa('');
                    setPrecoMax(500);
                    setTipoFiltro('todos');
                    setApenasContasIncluidas(false);
                  }}
                  className="btn-reset-filters"
                >
                  Repor Filtros
                </button>
              </div>
            )}
          </section>

          {/* Footer Informativo */}
          <footer className="footer-bar">
            <div className="footer-content">
              <div>
                <strong>UniStay Coimbra</strong> • Desenvolvido de forma independente por{' '}
                <a 
                  href="https://github.com/joaoblg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-author-link"
                >
                  João Bernardo Libório Graça (joaoblg)
                </a>
              </div>
              <div className="footer-tech-stack">
                <span>React 19</span> • <span>Node.js / Express</span> • <span>PostgreSQL & PostGIS</span> • <span>Leaflet</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
