import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../../services/apiService'
import DashboardLoader from './DashboardLoader'
import DashboardError from './DashboardError'

type MaterialItem = {
    id: number
    descricao_original?: string
    descricao?: string
    unidade: string
    quantidade: string
    preco_unitario: string
    origem: string
    status_mapeamento: string
}

type ItensResponse = {
    message: string
    data: MaterialItem[]
}

type MateriaisListProps = {
    projetoId: number
    pesquisa: string
}

export default function MateriaisList({ projetoId, pesquisa }: MateriaisListProps) {
    const [itens, setItens] = useState<MaterialItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        async function carregarItens() {
            if (!projetoId) return

            setLoading(true)
            setError(null)

            try {
                const response = await fetch(`${API_BASE}/api/projetos/${projetoId}/itens/`)

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Erro ${response.status}: ${errorText}`)
                }

                const data: ItensResponse = await response.json()
                setItens(Array.isArray(data.data) ? data.data : [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar materiais')
            } finally {
                setLoading(false)
            }
        }

        carregarItens()
    }, [projetoId, reloadKey])

    const itensFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLowerCase()

        if (!termo) return itens

        return itens.filter((item) => {
        const descricaoItem = item.descricao_original ?? item.descricao ?? ''
        const texto = [
            descricaoItem,
            item.unidade,
            item.origem,
            item.status_mapeamento,
        ]
            .join(' ')
            .toLowerCase()

        return texto.includes(termo)
        })
    }, [itens, pesquisa])

    if (loading) {
        return <DashboardLoader message="Carregando materiais..." />
    }

    if (error) {
        return (
            <DashboardError
                title="Falha ao carregar materiais"
                message={error}
                onRetry={() => setReloadKey((prev) => prev + 1)}
            />
        )
    }

    if (itensFiltrados.length === 0) {
        return <p className="obra-dashboard-feedback">Nenhum material encontrado.</p>
    }

    return (
        <div className="materiais-table-wrap">
            <table className="materiais-table">
            <thead className="materiais-table-head">
                <tr>
                    <th>ID</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Origem</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody className="materiais-table-body">
                {itensFiltrados.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.descricao_original ?? item.descricao}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.unidade}</td>
                        <td>{item.origem}</td>
                        <td>{item.status_mapeamento}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    )
}

