import { useEffect, useMemo, useState } from 'react'
import { API_BASE, exportarMateriais, updateItemProjeto, deleteItemProjeto, tryRefreshToken, forceLogout } from '../../services/apiService'
import { ArrowsDownUp, FunnelSimple, ArrowClockwise, DownloadSimple, DotsThreeVertical, PencilSimple, Trash } from 'phosphor-react'
import DashboardLoader from './DashboardLoader'
import DashboardError from './DashboardError'
import EditItemModal from './EditItemModal'

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
    const [exporting, setExporting] = useState(false)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const [editingItem, setEditingItem] = useState<MaterialItem | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as HTMLElement
            if (target.closest('.materiais-actions-btn') || target.closest('.materiais-actions-menu')) {
                return
            }
            setOpenMenuId(null)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        async function carregarItens() {
            if (!projetoId) return

            setLoading(true)
            setError(null)

            async function fetchItens(headers: Record<string, string>) {
                return fetch(`${API_BASE}/api/projetos/${projetoId}/itens/`, { headers })
            }

            try {
                const token = localStorage.getItem('access_token')
                const authHeaders: Record<string, string> = token
                    ? { 'Authorization': `Bearer ${token}` }
                    : {}

                let response = await fetchItens(authHeaders)

                if (response.status === 401) {
                    const refreshed = await tryRefreshToken()
                    if (refreshed) {
                        const newToken = localStorage.getItem('access_token')
                        response = await fetchItens(newToken
                            ? { 'Authorization': `Bearer ${newToken}` }
                            : {})
                    } else {
                        forceLogout()
                        throw new Error('Sessão expirada. Faça login novamente.')
                    }
                }

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

    async function handleExportar() {
        setExporting(true)
        try {
            await exportarMateriais(projetoId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao exportar')
        } finally {
            setExporting(false)
        }
    }

    function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSort(e.target.value as SortOption)
    }

    function toggleMenu(id: number) {
        setOpenMenuId((prev) => (prev === id ? null : id))
    }

    function handleEdit(item: MaterialItem) {
        setOpenMenuId(null)
        setEditingItem(item)
    }

    function handleDelete(item: MaterialItem) {
        setOpenMenuId(null)
        setDeletingId(item.id)
    }

    async function confirmDelete() {
        if (deletingId === null) return
        try {
            await deleteItemProjeto(projetoId, deletingId)
            setDeletingId(null)
            handleReload()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir')
            setDeletingId(null)
        }
    }

    async function handleSaveEdit(id: number, payload: Record<string, unknown>) {
        await updateItemProjeto(projetoId, id, payload)
        handleReload()
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

                <div className="materiais-toolbar-right">
                    <button
                        type="button"
                        className="materiais-reload-btn"
                        onClick={handleExportar}
                        disabled={exporting || itens.length === 0}
                        title="Exportar planilha"
                    >
                        <DownloadSimple size={18} weight="bold" />
                    </button>
                    <button
                        type="button"
                        className="materiais-reload-btn"
                        onClick={handleReload}
                        title="Recarregar lista"
                    >
                        <ArrowClockwise size={18} weight="bold" />
                    </button>
                </div>
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
                                    <th style={{ width: 48 }}></th>
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
                                        <td className="materiais-actions-cell">
                                            <div className="materiais-actions-wrapper">
                                                <button
                                                    className="materiais-actions-btn"
                                                    onClick={() => toggleMenu(item.id)}
                                                    aria-label="Ações"
                                                >
                                                    <DotsThreeVertical size={18} weight="bold" />
                                                </button>
                                                {openMenuId === item.id && (
                                                    <div className="materiais-actions-menu">
                                                        <button
                                                            className="materiais-actions-menu-item"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <PencilSimple size={16} weight="bold" />
                                                            <span>Editar</span>
                                                        </button>
                                                        <button
                                                            className="materiais-actions-menu-item materiais-actions-menu-item--danger"
                                                            onClick={() => handleDelete(item)}
                                                        >
                                                            <Trash size={16} weight="bold" />
                                                            <span>Excluir</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
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

            {editingItem && (
                <EditItemModal
                    item={{
                        id: editingItem.id,
                        descricao_original: editingItem.descricao_original ?? editingItem.descricao ?? '',
                        unidade: editingItem.unidade,
                        quantidade: editingItem.quantidade,
                        preco_unitario: editingItem.preco_unitario,
                        origem: editingItem.origem,
                    }}
                    onClose={() => setEditingItem(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {deletingId !== null && (
                <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Excluir material">
                    <div className="obra-modal-card" style={{ maxWidth: 400 }}>
                        <h3>Excluir Material</h3>
                        <p style={{ color: '#b3bbcd', margin: '12px 0' }}>
                            Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
                        </p>
                        <div className="obra-modal-actions">
                            <button
                                type="button"
                                className="obra-modal-btn obra-modal-btn--ghost"
                                onClick={() => setDeletingId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="obra-modal-btn"
                                style={{ background: '#c0392b' }}
                                onClick={confirmDelete}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
