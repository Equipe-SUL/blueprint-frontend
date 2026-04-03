type DeleteObraModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteObraModal({ isOpen, onClose, onConfirm }: DeleteObraModalProps) {
  if (!isOpen) return null

  return (
    <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Confirmar exclusão de obra">
      <div className="obra-modal-card">
        <h3>Excluir obra</h3>
        <p>Tem certeza que deseja excluir esta obra? Essa ação não pode ser desfeita.</p>
        <div className="obra-modal-actions">
          <button type="button" className="obra-modal-btn obra-modal-btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="obra-modal-btn obra-modal-btn--danger" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
