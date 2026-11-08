// src/Logo.jsx
import { MapPin, Home } from 'lucide-react';

function Logo() {
  return (
    <div className="logo-container">
      <div className="logo-icon">
        <Home size={24} className="house-icon" />
        <MapPin size={24} className="pin-icon" />
      </div>
      <h1 className="logo-text">UniStay <span className="logo-accent">Coimbra</span></h1>
    </div>
  );
}

export default Logo;