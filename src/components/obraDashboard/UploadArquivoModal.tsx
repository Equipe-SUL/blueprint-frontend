import { useState } from 'react'
import { uploadArquivoDXF } from '../../services/apiService'

type UploadArquivoModalProps = {
    isOpen: boolean
    projetoId: number
    onClose: () => void
    onUploaded: () => void
}

export default function UploadArquivoModal({
    isOpen,
    projetoId,
    onClose,
    onUploaded,
}: UploadArquivoModalProps) {
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files || [])
        const maxSize = 15 * 1024 * 1024
        const validFiles: File[] = []

        for (const file of selectedFiles) {
            const extension = file.name.split('.').pop()?.toLowerCase()
            if (extension !== 'dxf') {
                setError(`O arquivo ${file.name} não é um DXF!`)
                continue
            }
            if (file.size > maxSize) {
                setError(`O arquivo ${file.name} ultrapassa o limite de 15MB!`)
                continue
            }
            validFiles.push(file)
        }

        if (validFiles.length > 0) {
            setError(null)
        }

        setFiles((prev) => [...prev, ...validFiles])
    }

    function handleRemoveFile(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    function handleClose() {
        if (uploading) return
        setFiles([])
        setError(null)
        onClose()
    }

    async function handleUpload() {
        if (files.length === 0) return

        setUploading(true)
        setError(null)

        try {
            for (const file of files) {
                await uploadArquivoDXF(projetoId, file)
            }

            setFiles([])
            onUploaded()
            onClose()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Falha ao enviar arquivo.'
            setError(msg)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Associar planta">
            <div className="obra-modal-card">
                <h3>Associar Planta (DXF)</h3>
                <p>Envie arquivos DXF para associar a esta obra.</p>

                {error && (
                    <div className="obra-form-alert" role="alert">
                        {error}
                    </div>
                )}

                <div className="upload-modal-box">
                    <input
                        type="file"
                        id="upload-modal-input"
                        hidden
                        multiple
                        accept=".dxf"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="upload-modal-input" className="upload-modal-label">
                        <div className="upload-modal-icon">↑</div>
                        <strong>
                            {files.length > 0
                                ? `${files.length} arquivo(s) selecionado(s)`
                                : 'Clique para selecionar DXFs'}
                        </strong>
                        <span className="upload-modal-help">
                            Apenas .dxf | Máx 15MB por arquivo
                        </span>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="upload-modal-file-list">
                        {files.map((f, i) => (
                            <div key={i} className="upload-modal-file-item">
                                <span className="upload-modal-file-name">{f.name}</span>
                                <button
                                    type="button"
                                    className="upload-modal-file-remove"
                                    onClick={() => handleRemoveFile(i)}
                                    disabled={uploading}
                                    aria-label={`Remover ${f.name}`}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="obra-modal-actions">
                    <button
                        type="button"
                        className="obra-modal-btn obra-modal-btn--ghost"
                        onClick={handleClose}
                        disabled={uploading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="obra-modal-btn"
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                    >
                        {uploading ? 'Enviando...' : 'Enviar arquivo(s)'}
                    </button>
                </div>
            </div>
        </div>
    )
}
