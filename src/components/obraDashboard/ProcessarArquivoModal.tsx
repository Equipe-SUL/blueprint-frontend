import { useState } from 'react'
import { FileText, CurrencyDollar } from 'phosphor-react'
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

type TipoDocumento = 'memorial' | 'orcamento'

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

async function fetchProcessar(url: string): Promise<Response> {
    const response = await fetch(url, { method: 'POST', headers: getHeaders() })

    if (response.status === 401) {
        const refreshed = await tryRefresh()
        if (refreshed) {
            return await fetch(url, { method: 'POST', headers: getHeaders() })
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
    }
    return response
}

function getTitulo(tipo: TipoDocumento): string {
    return tipo === 'memorial' ? 'Memorial Descritivo' : 'Orçamento SINAPI'
}

function getNomeArquivo(tipo: TipoDocumento, nomeOriginal: string): string {
    const base = nomeOriginal.replace(/\.dxf$/i, '')
    return tipo === 'memorial'
        ? `Memorial_${base}.pdf`
        : `Orcamento_${base}.xlsx`
}

export default function ProcessarArquivoModal({
    isOpen,
    projetoId,
    arquivo,
    onClose,
}: ProcessarArquivoModalProps) {
    const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('memorial')
    const [processando, setProcessando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [pdfNome, setPdfNome] = useState('')

    async function handleProcessar() {
        if (!arquivo) return

        setProcessando(true)
        setErro(null)
        setPdfUrl(null)

        const endpoint = tipoDocumento === 'memorial'
            ? `${API_BASE}/api/projetos/${projetoId}/processar/${arquivo.id}/`
            : `${API_BASE}/api/projetos/${projetoId}/gerar-orcamento/${arquivo.id}/`

        try {
            const response = await fetchProcessar(endpoint)

            if (!response.ok) {
                const msg = await readError(response)
                throw new Error(msg)
            }

            if (tipoDocumento === 'orcamento') {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = getNomeArquivo('orcamento', arquivo.nome_original)
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
                onClose()
                return
            }

            const data = await response.json()
            const memorialId = data.memorial_db_id

            if (!memorialId) {
                throw new Error('Resposta inválida do servidor.')
            }

            const pdfResponse = await fetch(
                `${API_BASE}/api/projetos/${projetoId}/memorial/${memorialId}/pdf/`,
                { headers: getHeaders() }
            )

            if (pdfResponse.ok) {
                const blob = await pdfResponse.blob()
                const blobUrl = window.URL.createObjectURL(blob)
                setPdfUrl(blobUrl)
                setPdfNome(getNomeArquivo('memorial', arquivo.nome_original))
            } else {
                throw new Error('Memorial gerado, mas o PDF não pôde ser carregado.')
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

        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl)
            setPdfUrl(null)
            setPdfNome('')
        }

        setErro(null)
        setTipoDocumento('memorial')
        onClose()
    }

    if (!isOpen) return null

    // ─── Estado 2: PDF Viewer ─────────────────────────────────────────
    if (pdfUrl) {
        return (
            <div className="obra-modal-overlay pdf-viewer-overlay" role="dialog" aria-modal="true" aria-label={getTitulo(tipoDocumento)}>
                <div className="pdf-viewer-modal">
                    <div className="pdf-viewer-header">
                        <div className="pdf-viewer-title-wrap">
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="pdf-viewer-icon">
                                <path d="M4 1.5h5l4 4V13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13V3A1.5 1.5 0 0 1 4 1.5z" stroke="#3b82f6" strokeWidth="1.3" fill="none" />
                                <path d="M9 1.5V5.5h4" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h3>{getTitulo(tipoDocumento)}</h3>
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

                    <div className="pdf-viewer-body">
                        <iframe
                            src={`${pdfUrl}#toolbar=1&navpanes=0`}
                            title={getTitulo(tipoDocumento)}
                            className="pdf-viewer-iframe"
                        />
                    </div>
                </div>
            </div>
        )
    }

    // ─── Estado 1: Antes de processar ──────────────────────────────────
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

                {/* Seletor de tipo de documento */}
                <div className="processar-tipo-selector">
                    <div
                        className={`processar-tipo-option${tipoDocumento === 'memorial' ? ' processar-tipo-option--active' : ''}`}
                        onClick={() => !processando && setTipoDocumento('memorial')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setTipoDocumento('memorial') }}
                    >
                        <FileText size={20} weight="bold" />
                        Memorial Descritivo
                    </div>
                    <div
                        className={`processar-tipo-option${tipoDocumento === 'orcamento' ? ' processar-tipo-option--active' : ''}`}
                        onClick={() => !processando && setTipoDocumento('orcamento')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setTipoDocumento('orcamento') }}
                    >
                        <CurrencyDollar size={20} weight="bold" />
                        Orçamento SINAPI
                    </div>
                </div>

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
                                {tipoDocumento === 'memorial' ? 'Gerar Memorial Descritivo' : 'Gerar Orçamento SINAPI'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
