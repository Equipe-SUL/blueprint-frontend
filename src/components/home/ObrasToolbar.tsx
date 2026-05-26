import { Link, useNavigate } from "react-router-dom";
import { Plus, MagnifyingGlass, SignOut } from "phosphor-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

type ObrasToolbarProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  ctaLabel: string;
  ctaTo: string;
};

export default function ObrasToolbar({
  searchTerm,
  onSearchTermChange,
  ctaLabel,
  ctaTo,
}: ObrasToolbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/cadastro");
  };

  return (
    <div className="obras-toolbar">
      <div className="obras-search-wrap">
        <MagnifyingGlass size={18} weight="bold" className="obras-field-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Buscar por nome, cidade, estado ou descrição"
          className="obras-search-input"
        />
      </div>

      <div className="obras-actions">
        {/* Botão de logout com confirmação inline */}
        {confirming ? (
          <div className="logout-confirm">
            <span>Sair do sistema?</span>
            <button className="logout-confirm-yes" onClick={handleLogout}>
              Sim
            </button>
            <button className="logout-confirm-no" onClick={() => setConfirming(false)}>
              Não
            </button>
          </div>
        ) : (
          <button className="logout-btn" onClick={() => setConfirming(true)}>
            <SignOut size={15} weight="bold" />
            <span>Sair</span>
          </button>
        )}

        <Link to={ctaTo}>
          <button className="submit-btn">
            <Plus size={20} weight="bold" />
            <span>{ctaLabel}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
