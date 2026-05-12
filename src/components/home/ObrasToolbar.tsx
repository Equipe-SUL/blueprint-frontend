import { Link } from "react-router-dom";
import { Plus, MagnifyingGlass } from "phosphor-react";

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

      <Link to={ctaTo}>
        <button className="submit-btn">
          <Plus size={20} weight="bold" />
          <span>{ctaLabel}</span>
        </button>
      </Link>
    </div>
  );
}
