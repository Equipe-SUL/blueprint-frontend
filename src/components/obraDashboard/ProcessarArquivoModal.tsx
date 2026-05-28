import { useState } from 'react'
import { API_BASE } from '../../services/apiService'

type ArquivoResumo = {
    id: number
    nome_original: string
}

type ProcessarArquivoModalProps = {
    isOpen: boolean
    projetoId: number
    arquivo: ArquivoResumo | null
    onClose: () => void
}

function getHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token')
    if (!token) return {}
    return { 'Authorization': `Bearer ${token}` }
}

async function tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    try {
        const res = await fetch(`${API_BASE}/api/users/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        })
        if (!res.ok) return false
        const data = await res.json()
        if (data.access) {
            localStorage.setItem('access_token', data.access)
            return true
        }
        return false
    } catch {
        return false
    }
}

async function readError(response: Response): Promise<string> {
    const contentType = response.headers.get('Content-Type') || ''
    let msg = `Erro ${response.status}`
    try {
        if (contentType.includes('application/json')) {
            const data = await response.json()
            msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data)
        } else {
            msg = await response.text() || msg
        }
    } catch { /* keep default */ }
    return msg
}

// Faz o POST com refresh automático de token
async function fetchProcessar(url: string): Promise<Response> {
    const response = await fetch(url, { method: 'POST', headers: getHeaders() })

    if (response.status === 401) {
        const refreshed = await tryRefresh()
        if (refreshed) {
            return await fetch(url, { method: 'POST', headers: getHeaders() })
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/cadastro'
        throw new Error('Sessão expirada. Faça login novamente.')
    }

    return response
}

export default function ProcessarArquivoModal({
    isOpen,
    projetoId,
    arquivo,
    onClose,
}: ProcessarArquivoModalProps) {
    const [processando, setProcessando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    // Estado do PDF viewer
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [pdfNome, setPdfNome] = useState<string>('')

    if (!isOpen || !arquivo) return null

    async function handleProcessar() {
        setErro(null)
        setProcessando(true)

        try {
            const response = await fetchProcessar(
                `${API_BASE}/api/projetos/${projetoId}/processar/${arquivo!.id}/`
            )

            if (!response.ok) {
                throw new Error(await readError(response))
            }

            // A resposta é JSON com os dados do processamento
            const data = await response.json()

            if (!data.sucesso) {
                throw new Error(data.erro || 'Falha ao processar arquivo.')
            }

            // Montar URL do PDF usando o novo endpoint
            const memorialId = data.memorial_db_id
            if (memorialId) {
                const url = `${API_BASE}/api/projetos/${projetoId}/memorial/${memorialId}/pdf/`

                // Buscar o PDF como blob para exibir no iframe (inclui auth)
                const pdfResponse = await fetch(url, { headers: getHeaders() })
                if (pdfResponse.ok) {
                    const blob = await pdfResponse.blob()
                    const blobUrl = window.URL.createObjectURL(blob)
                    const nomeArquivo = `memorial_descritivo_${arquivo!.nome_original.replace(/\.[^.]+$/, '')}.pdf`
                    setPdfUrl(blobUrl)
                    setPdfNome(nomeArquivo)
                } else {
                    // Fallback: mostrar mensagem de sucesso sem preview
                    throw new Error('Memorial gerado com sucesso, mas o PDF não pôde ser carregado para exibição.')
                }
            } else {
                throw new Error('Memorial gerado, mas sem ID para recuperar o PDF.')
            }
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Falha ao processar arquivo.')
        } finally {
            setProcessando(false)
        }
    }

    function handleDownload() {
        if (!pdfUrl) return
        const a = document.createElement('a')
        a.href = pdfUrl
        a.download = pdfNome
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    function handleClose() {
        if (processando) return

        // Limpar blob URL ao fechar
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl)
            setPdfUrl(null)
            setPdfNome('')
        }

        setErro(null)
        onClose()
    }

    // ─── Estado 2: PDF Viewer (modal expandido) ─────────────────────────
    if (pdfUrl) {
        return (
            <div className="obra-modal-overlay pdf-viewer-overlay" role="dialog" aria-modal="true" aria-label="Visualizar Memorial Descritivo">
                <div className="pdf-viewer-modal">
                    {/* Header do viewer */}
                    <div className="pdf-viewer-header">
                        <div className="pdf-viewer-title-wrap">
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="pdf-viewer-icon">
                                <path d="M4 1.5h5l4 4V13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13V3A1.5 1.5 0 0 1 4 1.5z" stroke="#3b82f6" strokeWidth="1.3" fill="none" />
                                <path d="M9 1.5V5.5h4" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h3>Memorial Descritivo</h3>
                            <span className="pdf-viewer-filename">{pdfNome}</span>
                        </div>

                        <div className="pdf-viewer-actions">
                            <button
                                type="button"
                                className="pdf-viewer-btn pdf-viewer-btn--download"
                                onClick={handleDownload}
                                title="Baixar PDF"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                                Download
                            </button>
                            <button
                                type="button"
                                className="pdf-viewer-btn pdf-viewer-btn--close"
                                onClick={handleClose}
                                title="Fechar"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* PDF iframe */}
                    <div className="pdf-viewer-body">
                        <iframe
                            src={`${pdfUrl}#toolbar=1&navpanes=0`}
                            title="Memorial Descritivo PDF"
                            className="pdf-viewer-iframe"
                        />
                    </div>
                </div>
            </div>
        )
    }

    // ─── Estado 1: Antes de processar (modal padrão) ────────────────────
    return (
        <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Processar arquivo">
            <div className="obra-modal-card">
                <h3>Processar Arquivo</h3>
                <p className="processar-arquivo-nome">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="processar-arquivo-icon">
                        <path d="M4 1.5h5l4 4V13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13V3A1.5 1.5 0 0 1 4 1.5z" stroke="#3b82f6" strokeWidth="1.3" fill="none" />
                        <path d="M9 1.5V5.5h4" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {arquivo.nome_original}
                </p>

                {erro && (
                    <div className="obra-form-alert" role="alert">
                        {erro}
                    </div>
                )}

                <div className="obra-modal-actions">
                    <button
                        type="button"
                        className="obra-modal-btn obra-modal-btn--ghost"
                        onClick={handleClose}
                        disabled={processando}
                    >
                        Fechar
                    </button>
                    <button
                        type="button"
                        className={`obra-modal-btn ${processando ? 'obra-modal-btn--loading' : ''}`}
                        onClick={handleProcessar}
                        disabled={processando}
                    >
                        {processando ? (
                            <>
                                <span className="btn-spinner" />
                                Processando…
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Gerar Memorial Descritivo
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
