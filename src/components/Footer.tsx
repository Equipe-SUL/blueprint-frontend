import React from "react";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        <div className="footer-left">
          <h3>BluePrint</h3>
          <p>Gerenciamento de projetos e obras.</p>
        </div>

        <div className="footer-right">
          <p>© {new Date().getFullYear()} EquipeSUL</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;