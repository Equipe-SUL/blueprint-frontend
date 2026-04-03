type NovoMaterialForm = {
  descricao_original: string
  unidade: string
  quantidade: string
  preco_unitario: string
}

type AddMaterialModalProps = {
  isOpen: boolean
  salvandoMaterial: boolean
  addMaterialError: string | null
  novoMaterial: NovoMaterialForm
  onChangeNovoMaterial: (field: keyof NovoMaterialForm, value: string) => void
  onClose: () => void
  onSave: () => void
}

export default function AddMaterialModal({
  isOpen,
  salvandoMaterial,
  addMaterialError,
  novoMaterial,
  onChangeNovoMaterial,
  onClose,
  onSave,
}: AddMaterialModalProps) {
  if (!isOpen) return null

  return (
    <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Adicionar material">
      <div className="obra-modal-card">
        <h3>Adicionar material</h3>
        <p>Preencha os dados do novo item para incluir na lista de materiais.</p>

        {addMaterialError && (
          <div className="obra-form-alert" role="alert">
            {addMaterialError}
          </div>
        )}

        <div className="obra-form-grid">
          <label className="obra-form-field">
            <span>Descrição</span>
            <input
              type="text"
              value={novoMaterial.descricao_original}
              onChange={(e) => onChangeNovoMaterial('descricao_original', e.target.value)}
              placeholder="Ex: Tubo PVC 100mm"
            />
          </label>

          <label className="obra-form-field">
            <span>Unidade</span>
            <input
              type="text"
              value={novoMaterial.unidade}
              onChange={(e) => onChangeNovoMaterial('unidade', e.target.value)}
              placeholder="Ex: m, un, kg"
            />
          </label>

          <label className="obra-form-field">
            <span>Quantidade</span>
            <input
              type="text"
              value={novoMaterial.quantidade}
              onChange={(e) => onChangeNovoMaterial('quantidade', e.target.value)}
              placeholder="Ex: 12.5"
            />
          </label>

          <label className="obra-form-field">
            <span>Preço unitário</span>
            <input
              type="text"
              value={novoMaterial.preco_unitario}
              onChange={(e) => onChangeNovoMaterial('preco_unitario', e.target.value)}
              placeholder="Ex: 35.90"
            />
          </label>
        </div>

        <div className="obra-modal-actions">
          <button
            type="button"
            className="obra-modal-btn obra-modal-btn--ghost"
            onClick={onClose}
            disabled={salvandoMaterial}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="obra-modal-btn"
            onClick={onSave}
            disabled={salvandoMaterial}
          >
            {salvandoMaterial ? 'Salvando...' : 'Salvar material'}
          </button>
        </div>
      </div>
    </div>
  )
}
