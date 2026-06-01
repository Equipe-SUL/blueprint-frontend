import { useState } from 'react'
import { X } from 'phosphor-react'

type EditItemData = {
    id: number
    descricao_original: string
    unidade: string
    quantidade: string
    preco_unitario: string
    origem: string
}

type EditItemModalProps = {
    item: EditItemData
    onClose: () => void
    onSave: (id: number, payload: Record<string, unknown>) => Promise<void>
}

export default function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
    const isSinapi = item.origem === 'sinapi'

    const [descricao, setDescricao] = useState(item.descricao_original)
    const [unidade, setUnidade] = useState(item.unidade)
    const [quantidade, setQuantidade] = useState(item.quantidade)
    const [preco, setPreco] = useState(item.preco_unitario)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSave() {
        setError(null)
        setSaving(true)

        try {
            const payload: Record<string, unknown> = {}

            if (isSinapi) {
                if (!quantidade.trim()) {
                    throw new Error('Quantidade é obrigatória.')
                }
                payload.quantidade = Number.parseFloat(quantidade.replace(',', '.'))
                if (!Number.isFinite(payload.quantidade)) {
                    throw new Error('Quantidade inválida.')
                }
            } else {
                if (!descricao.trim()) throw new Error('Descrição é obrigatória.')
                if (!unidade.trim()) throw new Error('Unidade é obrigatória.')
                if (!quantidade.trim()) throw new Error('Quantidade é obrigatória.')

                payload.descricao_original = descricao.trim()
                payload.unidade = unidade.trim()

                const qtd = Number.parseFloat(quantidade.replace(',', '.'))
                if (!Number.isFinite(qtd)) throw new Error('Quantidade inválida.')
                payload.quantidade = qtd

                const precoVal = preco.trim()
                    ? Number.parseFloat(preco.replace(',', '.'))
                    : 0
                if (!Number.isFinite(precoVal)) throw new Error('Preço inválido.')
                payload.preco_unitario = precoVal
            }

            await onSave(item.id, payload)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Editar material">
            <div className="obra-modal-card">
                <div className="edit-item-header">
                    <h3>Editar Material</h3>
                    <button className="edit-item-close" onClick={onClose} aria-label="Fechar">
                        <X size={20} weight="bold" />
                    </button>
                </div>

                {error && (
                    <div className="obra-form-alert" role="alert">{error}</div>
                )}

                <div className="edit-item-body">
                    <div className="edit-item-field">
                        <label>Descrição</label>
                        <input
                            type="text"
                            className="cad-input"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            disabled={isSinapi}
                        />
                        {isSinapi && <span className="edit-item-hint">Apenas quantidade pode ser editada para itens SINAPI.</span>}
                    </div>

                    <div className="edit-item-row">
                        <div className="edit-item-field">
                            <label>Unidade</label>
                            <input
                                type="text"
                                className="cad-input"
                                value={unidade}
                                onChange={(e) => setUnidade(e.target.value)}
                                disabled={isSinapi}
                            />
                        </div>
                        <div className="edit-item-field">
                            <label>Quantidade</label>
                            <input
                                type="text"
                                className="cad-input"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="edit-item-field">
                        <label>Preço Unitário</label>
                        <input
                            type="text"
                            className="cad-input"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                            disabled={isSinapi}
                        />
                    </div>
                </div>

                <div className="obra-modal-actions">
                    <button
                        type="button"
                        className="obra-modal-btn obra-modal-btn--ghost"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="obra-modal-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
