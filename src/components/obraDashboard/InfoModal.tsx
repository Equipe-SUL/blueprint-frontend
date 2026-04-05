type InfoModalProps = {
  isOpen: boolean
  message: string
  onClose: () => void
}

export default function InfoModal({ isOpen, message, onClose }: InfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Aviso">
      <div className="obra-modal-card">
        <h3>Aviso</h3>
        <p>{message}</p>
        <div className="obra-modal-actions">
          <button type="button" className="obra-modal-btn" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}
