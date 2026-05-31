import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../../services/apiService'
import { ArrowsDownUp, FunnelSimple, ArrowClockwise } from 'phosphor-react'
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

type SortOption = '' | 'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc'

type MateriaisListProps = {
    projetoId: number
    pesquisa: string
    externalRefreshKey?: number
}

export default function MateriaisList({ projetoId, pesquisa, externalRefreshKey = 0 }: MateriaisListProps) {
    const [itens, setItens] = useState<MaterialItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)
    const [sort, setSort] = useState<SortOption>('')
    const [unidadeFilter, setUnidadeFilter] = useState('')

    useEffect(() => {
        async function carregarItens() {
            if (!projetoId) return

            setLoading(true)
            setError(null)

            try {
                const token = localStorage.getItem('access_token')
                const response = await fetch(`${API_BASE}/api/projetos/${projetoId}/itens/`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })

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
    }, [projetoId, reloadKey, externalRefreshKey])

    const unidades = useMemo(() => {
        const set = new Set<string>()
        for (const item of itens) {
            if (item.unidade) set.add(item.unidade)
        }
        return Array.from(set).sort()
    }, [itens])

    const parseNumero = (valor: string | number | undefined) => {
        if (valor === undefined) return 0
        if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0
        const normalizado = valor.replace(/\s/g, '').replace(',', '.')
        const parsed = Number.parseFloat(normalizado)
        return Number.isFinite(parsed) ? parsed : 0
    }

    const itensFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLowerCase()

        let resultado = itens.filter((item) => {
            if (unidadeFilter && item.unidade !== unidadeFilter) return false

            if (!termo) return true

            const descricaoItem = item.descricao_original ?? item.descricao ?? ''
            const texto = [
                descricaoItem,
                item.unidade,
                item.origem,
                item.status_mapeamento,
            ].join(' ').toLowerCase()

            return texto.includes(termo)
        })

        resultado = [...resultado]

        switch (sort) {
            case 'alpha-asc':
                resultado.sort((a, b) => {
                    const da = (a.descricao_original ?? a.descricao ?? '').toLowerCase()
                    const db = (b.descricao_original ?? b.descricao ?? '').toLowerCase()
                    return da.localeCompare(db)
                })
                break
            case 'alpha-desc':
                resultado.sort((a, b) => {
                    const da = (a.descricao_original ?? a.descricao ?? '').toLowerCase()
                    const db = (b.descricao_original ?? b.descricao ?? '').toLowerCase()
                    return db.localeCompare(da)
                })
                break
            case 'price-asc':
                resultado.sort((a, b) => parseNumero(a.preco_unitario) - parseNumero(b.preco_unitario))
                break
            case 'price-desc':
                resultado.sort((a, b) => parseNumero(b.preco_unitario) - parseNumero(a.preco_unitario))
                break
        }

        return resultado
    }, [itens, pesquisa, sort, unidadeFilter])

    const precoTotalMateriais = useMemo(() => {
        return itensFiltrados.reduce((acc, item) => {
            const quantidade = parseNumero(item.quantidade)
            const precoUnitario = parseNumero(item.preco_unitario)
            return acc + (quantidade * precoUnitario)
        }, 0)
    }, [itensFiltrados])

    const precoTotalFormatado = useMemo(
        () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoTotalMateriais),
        [precoTotalMateriais]
    )

    function handleReload() {
        setReloadKey((prev) => prev + 1)
    }

    function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSort(e.target.value as SortOption)
    }

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

    return (
        <>
            <div className="materiais-toolbar">
                <div className="materiais-toolbar-left">
                    <div className="materiais-filter-group">
                        <ArrowsDownUp size={16} weight="bold" />
                        <select
                            className="materiais-select"
                            value={sort}
                            onChange={handleSortChange}
                        >
                            <option value="">Sem ordenação</option>
                            <option value="alpha-asc">A → Z</option>
                            <option value="alpha-desc">Z → A</option>
                            <option value="price-asc">Menor preço</option>
                            <option value="price-desc">Maior preço</option>
                        </select>
                    </div>

                    {unidades.length > 0 && (
                        <div className="materiais-filter-group">
                            <FunnelSimple size={16} weight="bold" />
                            <select
                                className="materiais-select"
                                value={unidadeFilter}
                                onChange={(e) => setUnidadeFilter(e.target.value)}
                            >
                                <option value="">Todas unidades</option>
                                {unidades.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="materiais-reload-btn"
                    onClick={handleReload}
                    title="Recarregar lista"
                >
                    <ArrowClockwise size={18} weight="bold" />
                </button>
            </div>

            {itensFiltrados.length === 0 ? (
                <p className="obra-dashboard-feedback">Nenhum material encontrado.</p>
            ) : (
                <>
                    <div className="materiais-table-wrap">
                        <table className="materiais-table">
                            <thead className="materiais-table-head">
                                <tr>
                                    <th>Descrição</th>
                                    <th>Quantidade</th>
                                    <th>Unidade</th>
                                    <th>Preço Unitário</th>
                                    <th>Origem</th>
                                </tr>
                            </thead>
                            <tbody className="materiais-table-body">
                                {itensFiltrados.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.descricao_original ?? item.descricao}</td>
                                        <td>{item.quantidade}</td>
                                        <td>{item.unidade}</td>
                                        <td>{item.preco_unitario}</td>
                                        <td>{item.origem}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="materiais-total-wrap">
                        <span className="materiais-total-label">Preço total de materiais:</span>
                        <strong className="materiais-total-value">{precoTotalFormatado}</strong>
                    </div>
                </>
            )}
        </>
    )
}
