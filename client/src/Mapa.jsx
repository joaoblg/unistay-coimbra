import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Componente para animar a câmara suavemente para o novo centro
function FlyToLocation({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Criação de ícone personalizado para a Universidade (Polo)
const createUniIcon = (alias) => {
  return L.divIcon({
    className: 'custom-uni-marker',
    html: `
      <div class="uni-marker-wrapper">
        <div class="uni-marker-pulse"></div>
        <div class="uni-marker-pin">
          <span class="uni-icon">🎓</span>
          <span class="uni-label">${alias}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
};

// Criação de ícone estilo "Airbnb" com badge de preço para cada quarto
const createRoomIcon = (preco, isSelected) => {
  const precoFormatado = Math.round(preco);
  return L.divIcon({
    className: 'custom-room-marker',
    html: `
      <div class="room-marker-pill ${isSelected ? 'selected' : ''}">
        <span class="room-currency">€</span><span class="room-val">${precoFormatado}</span>
      </div>
    `,
    iconSize: [64, 30],
    iconAnchor: [32, 15],
    popupAnchor: [0, -18]
  });
};

export default function Mapa({ 
  uni, 
  quartos = [], 
  quartoSelecionado = null, 
  onSelectQuarto = () => {},
  raio = 2000
}) {
  // Centro padrão: Coimbra (Alta Universitária / Solum)
  const centro = useMemo(() => {
    if (quartoSelecionado && quartoSelecionado.lat && quartoSelecionado.lon) {
      return [parseFloat(quartoSelecionado.lat), parseFloat(quartoSelecionado.lon)];
    }
    if (uni && uni.lat && uni.lon) {
      return [parseFloat(uni.lat), parseFloat(uni.lon)];
    }
    return [40.2033, -8.4103];
  }, [uni, quartoSelecionado]);

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={centro} 
        zoom={uni ? 14 : 13} 
        scrollWheelZoom={true}
        className="leaflet-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FlyToLocation center={centro} zoom={quartoSelecionado ? 16 : (uni ? 14 : 13)} />

        {/* Raio de proximidade visual em torno da faculdade */}
        {uni && uni.lat && uni.lon && (
          <Circle
            center={[parseFloat(uni.lat), parseFloat(uni.lon)]}
            radius={raio}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6, 8'
            }}
          />
        )}

        {/* Marcador do Polo Universitário */}
        {uni && uni.lat && uni.lon && (
          <Marker 
            position={[parseFloat(uni.lat), parseFloat(uni.lon)]}
            icon={createUniIcon(uni.alias)}
          >
            <Popup className="custom-popup">
              <div className="popup-uni">
                <div className="popup-badge">Polo Académico</div>
                <h3>{uni.nome}</h3>
                <p className="popup-desc">{uni.descricao || uni.alias}</p>
                <div className="popup-coords">
                  GPS: {parseFloat(uni.lat).toFixed(4)}, {parseFloat(uni.lon).toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores dos Quartos com Preço Real e Coordenadas PostGIS */}
        {quartos.map((quarto) => {
          if (!quarto.lat || !quarto.lon) return null;
          const isSelected = quartoSelecionado && quartoSelecionado.id === quarto.id;
          const pos = [parseFloat(quarto.lat), parseFloat(quarto.lon)];

          return (
            <Marker
              key={quarto.id}
              position={pos}
              icon={createRoomIcon(quarto.preco, isSelected)}
              eventHandlers={{
                click: () => onSelectQuarto(quarto)
              }}
            >
              <Popup className="custom-popup">
                <div className="popup-room">
                  {quarto.imagem_url && (
                    <div className="popup-image-container">
                      <img 
                        src={quarto.imagem_url} 
                        alt={quarto.titulo} 
                        className="popup-image" 
                      />
                      {quarto.despesas_incluidas && (
                        <span className="popup-tag">Contas Incluídas</span>
                      )}
                    </div>
                  )}
                  <div className="popup-body">
                    <div className="popup-header-row">
                      <span className="popup-type">{quarto.tipo || 'Quarto'}</span>
                      <span className="popup-price">€{Math.round(quarto.preco)}<small>/mês</small></span>
                    </div>
                    <h4 className="popup-title">{quarto.titulo}</h4>
                    {quarto.distancia !== undefined && (
                      <div className="popup-walk">
                        🚶 <strong>{Math.round(quarto.distancia / 80)} min</strong> a pé ({Math.round(quarto.distancia)}m da faculdade)
                      </div>
                    )}
                    <a 
                      href={quarto.link_original} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="popup-btn"
                    >
                      Ver Anúncio Original ↗
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
