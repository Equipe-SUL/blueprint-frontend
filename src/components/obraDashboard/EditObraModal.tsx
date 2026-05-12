type EditObraForm = {
  nome_obra: string
  cidade_obra: string
  estado_obra: string
  desc_obra: string
}

type EditObraModalProps = {
  isOpen: boolean
  salvandoObra: boolean
  editObraError: string | null
  obraEditando: EditObraForm
  onChangeObraEditando: (field: keyof EditObraForm, value: string) => void
  onClose: () => void
  onSave: () => void
}

export default function EditObraModal({
  isOpen,
  salvandoObra,
  editObraError,
  obraEditando,
  onChangeObraEditando,
  onClose,
  onSave,
}: EditObraModalProps) {
  if (!isOpen) return null

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
  ]

  return (
    <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Editar obra">
      <div className="obra-modal-card">
        <h3>Editar obra</h3>
        <p>Atualize os dados da obra conforme necessário.</p>

        {editObraError && (
          <div className="obra-form-alert" role="alert">
            {editObraError}
          </div>
        )}

        <div className="obra-form-grid">
          <label className="obra-form-field">
            <span>Nome da obra</span>
            <input
              type="text"
              value={obraEditando.nome_obra}
              onChange={(e) => onChangeObraEditando('nome_obra', e.target.value)}
              placeholder="Ex: Terraplanagem setor norte"
              disabled={salvandoObra}
            />
          </label>

          <label className="obra-form-field">
            <span>Cidade</span>
            <input
              type="text"
              value={obraEditando.cidade_obra}
              onChange={(e) => onChangeObraEditando('cidade_obra', e.target.value)}
              placeholder="Ex: São Paulo"
              disabled={salvandoObra}
            />
          </label>

          <label className="obra-form-field">
            <span>Estado (UF)</span>
            <select
              value={obraEditando.estado_obra}
              onChange={(e) => onChangeObraEditando('estado_obra', e.target.value)}
              disabled={salvandoObra}
            >
              <option value="">Selecione...</option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>

          <label className="obra-form-field">
            <span>Descrição</span>
            <input
              type="text"
              value={obraEditando.desc_obra}
              onChange={(e) => onChangeObraEditando('desc_obra', e.target.value)}
              placeholder="Ex: Obra de terraplanagem"
              disabled={salvandoObra}
            />
          </label>
        </div>

        <div className="obra-modal-actions">
          <button
            type="button"
            className="obra-modal-btn obra-modal-btn--ghost"
            onClick={onClose}
            disabled={salvandoObra}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="obra-modal-btn"
            onClick={onSave}
            disabled={salvandoObra}
          >
            {salvandoObra ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
