import React from "react";
import Logo from "./Logo";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-left">
          <h3><Logo /></h3>
        </div>

        <div className="footer-right">
          <p>© {new Date().getFullYear()} EquipeSUL</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;