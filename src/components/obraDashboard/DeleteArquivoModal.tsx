import { X } from 'phosphor-react'

type DeleteArquivoModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    arquivoNome: string
    isDeleting: boolean
    errorMessage?: string | null
}

export default function DeleteArquivoModal({
    isOpen,
    onClose,
    onConfirm,
    arquivoNome,
    isDeleting,
    errorMessage,
}: DeleteArquivoModalProps) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Excluir arquivo</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
                        <X size={20} weight="bold" />
                    </button>
                </div>

                <p className="modal-body">
                    Tem certeza que deseja excluir <strong>{arquivoNome}</strong>? Essa ação não pode ser desfeita.
                </p>

                {errorMessage ? <p className="modal-error">{errorMessage}</p> : null}
                {!errorMessage && isDeleting ? <p className="modal-error">Excluindo...</p> : null}


                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose} disabled={isDeleting}>
                        Cancelar
                    </button>
                    <button type="button" className="submit-btn" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    )
}

