import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../../services/apiService'
import DashboardLoader from './DashboardLoader'

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

    useEffect(() => {
        async function carregarArquivos() {
            if (!projetoId) return

            setLoading(true)
            setError(null)

            try {
                const response = await fetch(`${API_BASE}/api/projetos/${projetoId}/upload/`)

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Erro ${response.status}: ${errorText}`)
                }

                const data: ArquivoItem[] = await response.json()
                setArquivos(Array.isArray(data) ? data : [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar arquivos')
            } finally {
                setLoading(false)
            }
        }

        carregarArquivos()
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
        return <DashboardLoader message="Carregando arquivos..." />
    }

    if (error) {
        return <p className="obra-dashboard-feedback obra-dashboard-feedback--error">Erro: {error}</p>
    }

    if (arquivosFiltrados.length === 0) {
        return <p className="obra-dashboard-feedback">Nenhum arquivo encontrado.</p>
    }

    return (
        <div className="arquivos-grid">
            {arquivosFiltrados.map((arquivo) => (
                <article className="arquivo-card" key={arquivo.id}>
                    <h3 className="arquivo-card-title">{arquivo.nome_original}</h3>
                    <p className="arquivo-card-line">Status: {arquivo.status_processamento}</p>
                    <p className="arquivo-card-line">Tamanho: {arquivo.tamanho_mb ?? '-'} MB</p>
                    <p className="arquivo-card-line">Enviado em: {new Date(arquivo.enviado_em).toLocaleString('pt-BR')}</p>
                </article>
            ))}
        </div>
    )
}
