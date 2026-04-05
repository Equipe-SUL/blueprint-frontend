import { Plus } from "phosphor-react"
type AbaAtiva = 'materiais' | 'arquivos'

type ObraTabsProps = {
    abaAtiva: AbaAtiva
    onChange: (aba: AbaAtiva) => void
    acaoLabel: string
    onAcaoClick: () => void
}

export default function ObraTabs({ 
    abaAtiva, 
    onChange, 
    acaoLabel, 
    onAcaoClick 
}: ObraTabsProps) { 
    return (
        <div className="obra-tabs">
            <div className="obra-tabs-switch">
                <button
                    type="button"
                    className={abaAtiva === 'materiais' ? 'active' : ''}
                    onClick={() => onChange('materiais')}
                    aria-current={abaAtiva === 'materiais' ? 'page' : undefined}
                >
                    Materiais
                </button>
                <button
                    type="button"
                    className={abaAtiva === 'arquivos' ? 'active' : ''}
                    onClick={() => onChange('arquivos')}
                    aria-current={abaAtiva === 'arquivos' ? 'page' : undefined}
                >
                    Arquivos
                </button>
            </div>
            <div className="obra-tabs-action-wrap">
                <button type="button" className="submit-btn obra-tabs-action" onClick={onAcaoClick}>
                    <Plus size={20} weight="bold" />
                    {acaoLabel}
                </button>
            </div>
        </div>
    )
}