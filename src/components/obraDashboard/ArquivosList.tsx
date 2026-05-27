import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../services/apiService'
import ProcessarArquivoModal from './ProcessarArquivoModal'

type ArquivoItem = {
    id: number
    nome_original: string
    status_processamento: string
    tamanho_mb: string | null
    enviado_em: string
}

type ArquivosListProps = {
    projetoId: number
    pesquisa: string
}

export default function ArquivosList({ projetoId, pesquisa }: ArquivosListProps) {
    const [arquivos, setArquivos] = useState<ArquivoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [arquivoSelecionado, setArquivoSelecionado] = useState<ArquivoItem | null>(null)

    useEffect(() => {
        async function fetchArquivos() {
            setLoading(true)
            setError(null)
            try {
                const data = await apiRequest<ArquivoItem[]>(
                    `/api/projetos/${projetoId}/upload/`
                )
                setArquivos(Array.isArray(data) ? data : [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar arquivos')
            } finally {
                setLoading(false)
            }
        }

        if (projetoId) {
            fetchArquivos()
        }
    }, [projetoId])

    const arquivosFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLowerCase()
        if (!termo) return arquivos

        return arquivos.filter((arquivo) => {
            const texto = [
                arquivo.nome_original,
                arquivo.status_processamento,
                arquivo.tamanho_mb ?? '',
            ]
                .join(' ')
                .toLowerCase()

            return texto.includes(termo)
        })
    }, [arquivos, pesquisa])

    if (loading) {
        return <p className="obra-dashboard-feedback">Carregando arquivos…</p>
    }

    if (error) {
        return <p className="obra-dashboard-feedback">Erro: {error}</p>
    }

    if (arquivosFiltrados.length === 0) {
        return <p className="obra-dashboard-feedback">Nenhum arquivo encontrado.</p>
    }

    return (
        <>
            <div className="arquivos-grid">
                {arquivosFiltrados.map((arquivo) => (
                    <article
                        className="arquivo-card arquivo-card--clickable"
                        key={arquivo.id}
                        onClick={() => setArquivoSelecionado(arquivo)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setArquivoSelecionado(arquivo)
                            }
                        }}
                    >
                        <h3 className="arquivo-card-title">{arquivo.nome_original}</h3>
                        <p className="arquivo-card-line">Status: {arquivo.status_processamento}</p>
                        <p className="arquivo-card-line">Tamanho: {arquivo.tamanho_mb ?? '-'} MB</p>
                        <p className="arquivo-card-line">Enviado em: {new Date(arquivo.enviado_em).toLocaleString('pt-BR')}</p>
                    </article>
                ))}
            </div>

            <ProcessarArquivoModal
                isOpen={!!arquivoSelecionado}
                projetoId={projetoId}
                arquivo={arquivoSelecionado}
                onClose={() => setArquivoSelecionado(null)}
            />
        </>
    )
}
