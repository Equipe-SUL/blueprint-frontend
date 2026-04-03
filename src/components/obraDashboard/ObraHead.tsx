import { DotsThreeVertical } from "phosphor-react";
import TipoBadge from "../TipoBadge";

type ProjetoResumo = {
    id: number
    nome_obra: string
    cidade_obra: string
    estado_obra: string
    desc_obra: string
    tipo_projeto: string[]
}

type ObraHeadProps = {
    projeto: ProjetoResumo | null
    onMenuClick: () => void
}

export default function ObraHead({ projeto, onMenuClick }: ObraHeadProps) {
    return (
        <header className="obra-head">
            {/* Informações da Obra */}
            <div className="obra-head-info">
                <h1 className="obra-head-title">{projeto?.nome_obra ?? 'Obra sem nome'}</h1>
                <p className="obra-head-location">
                    {projeto?.cidade_obra}, {projeto?.estado_obra}
                </p>
                <p className="obra-head-description">
                    {projeto?.desc_obra}
                </p>
                <ul className="obra-head-tags">
                    {projeto?.tipo_projeto.map((tipo, index) => (
                        <li key={`${tipo}-${index}`}>
                            <TipoBadge tipo={tipo} />
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Botão de Ações */}
            <div className="obra-head-actions">
                <button className="obra-head-menu-btn" onClick={onMenuClick} aria-label="Ações da obra">
                    <DotsThreeVertical size={20} />
                </button>
            </div>
        </header>
    )
}