import { Link } from "react-router-dom";
import { Plus, MagnifyingGlass, FunnelSimple } from "phosphor-react";
import type { TipoProjeto } from "../../services/apiService";

type ObrasToolbarProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  tipoFilter: TipoProjeto | "";
  onTipoFilterChange: (value: TipoProjeto | "") => void;
  ctaLabel: string;
  ctaTo: string;
};

export default function ObrasToolbar({
  searchTerm,
  onSearchTermChange,
  tipoFilter,
  onTipoFilterChange,
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

      <div className="obras-filter-wrap">
        <FunnelSimple size={18} weight="bold" className="obras-field-icon" />
        <select
          value={tipoFilter}
          onChange={(e) => onTipoFilterChange(e.target.value as TipoProjeto | "")}
          className="obras-filter-select"
          aria-label="Filtrar por tipo de obra"
        >
          <option value="alvenaria">Alvenaria</option>
        </select>
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
