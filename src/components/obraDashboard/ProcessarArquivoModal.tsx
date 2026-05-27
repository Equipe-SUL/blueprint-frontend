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
        const res = await fetch(`${API_BASE}/api/token/refresh/`, {
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

            // Resposta é um PDF — download automático
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url

            // Tentar extrair nome do arquivo do header Content-Disposition
            const disposition = response.headers.get('Content-Disposition')
            let nomeArquivo = `memorial_${arquivo!.nome_original.replace(/\.[^.]+$/, '')}.pdf`
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/)
                if (match?.[1]) {
                    nomeArquivo = match[1]
                }
            }

            a.download = nomeArquivo
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            // Fechar modal após download bem-sucedido
            onClose()
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Falha ao processar arquivo.')
        } finally {
            setProcessando(false)
        }
    }

    function handleClose() {
        if (processando) return
        setErro(null)
        onClose()
    }

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
