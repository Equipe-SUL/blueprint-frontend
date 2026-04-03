import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MagnifyingGlass } from 'phosphor-react'
import ObraHead from '../components/obraDashboard/ObraHead'
import ObraTabs from '../components/obraDashboard/ObraTabs'
import MateriaisList from '../components/obraDashboard/MateriaisList'
import ArquivosList from '../components/obraDashboard/ArquivosList'
import { createItemProjeto, deleteProjeto, getProjetoById } from '../services/apiService'
import '../styles/ObraDashboard.css'

type AbaAtiva = 'materiais' | 'arquivos'

type ProjetoResumo = {
    id: number
    nome_obra: string
    cidade_obra: string
    estado_obra: string
    desc_obra: string
    tipo_projeto: string[]
}

export function ObraDashboard() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [projeto, setProjeto] = useState<ProjetoResumo | null>(null)
    const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('materiais')
    const [pesquisa, setPesquisa] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadProjetoKey, setReloadProjetoKey] = useState(0)
    const [refreshMateriaisKey, setRefreshMateriaisKey] = useState(0)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [infoModalMessage, setInfoModalMessage] = useState('')
    const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false)
    const [salvandoMaterial, setSalvandoMaterial] = useState(false)
    const [addMaterialError, setAddMaterialError] = useState<string | null>(null)
    const [novoMaterial, setNovoMaterial] = useState({
        descricao_original: '',
        unidade: '',
        quantidade: '',
        preco_unitario: '',
    })

    useEffect(() => {
        async function carregarProjeto() {
            if (!id) return

            setLoading(true)
            setError(null)

            try {
                const data = await getProjetoById(Number(id))
                setProjeto(data as ProjetoResumo)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar obra')
            } finally {
                setLoading(false)
            }
        }

        carregarProjeto()
    }, [id, reloadProjetoKey])

    const acaoLabel = abaAtiva === 'materiais' ? 'Adicionar material' : 'Associar planta'

    function handleDeleteObra() {
        setIsDeleteModalOpen(true)
    }

    async function confirmDeleteObra() {
        if (!id) return

        try {
            await deleteProjeto(Number(id))
            setIsDeleteModalOpen(false)
            navigate('/obras')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Falha ao excluir obra.'
            setIsDeleteModalOpen(false)
            setInfoModalMessage(`Erro ao excluir obra: ${msg}`)
            setIsInfoModalOpen(true)
        }
    }

    function handleEditObra() {
        setInfoModalMessage('Funcionalidade em construção.')
        setIsInfoModalOpen(true)
    }

    function abrirAdicionarMaterial() {
        setNovoMaterial({
            descricao_original: '',
            unidade: '',
            quantidade: '',
            preco_unitario: '',
        })
        setAddMaterialError(null)
        setIsAddMaterialModalOpen(true)
    }

    async function handleSalvarMaterial() {
        if (!id) return

        setAddMaterialError(null)

        if (!novoMaterial.descricao_original.trim() || !novoMaterial.unidade.trim() || !novoMaterial.quantidade.trim()) {
            setAddMaterialError('Preencha descrição, unidade e quantidade para adicionar o material.')
            return
        }

        const quantidade = Number.parseFloat(novoMaterial.quantidade.replace(',', '.'))
        const precoUnitario = novoMaterial.preco_unitario.trim()
            ? Number.parseFloat(novoMaterial.preco_unitario.replace(',', '.'))
            : 0

        if (!Number.isFinite(quantidade)) {
            setAddMaterialError('Quantidade inválida. Informe um número válido.')
            return
        }

        if (!Number.isFinite(precoUnitario)) {
            setAddMaterialError('Preço unitário inválido. Informe um número válido.')
            return
        }

        setSalvandoMaterial(true)
        try {
            await createItemProjeto(Number(id), {
                descricao_original: novoMaterial.descricao_original.trim(),
                unidade: novoMaterial.unidade.trim(),
                quantidade,
                preco_unitario: precoUnitario,
            })

            setIsAddMaterialModalOpen(false)
            setRefreshMateriaisKey((prev) => prev + 1)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Falha ao adicionar material.'
            setAddMaterialError(`Erro ao adicionar material: ${msg}`)
        } finally {
            setSalvandoMaterial(false)
        }
    }

    function handleAcaoAbaAtual() {
        if (abaAtiva === 'materiais') {
            abrirAdicionarMaterial()
            return
        }

        setInfoModalMessage('Funcionalidade de associar planta em construção.')
        setIsInfoModalOpen(true)
    }

    return (
        <div className="obra-dashboard-page">
            <div className="obra-dashboard-container">
                <ObraHead
                    projeto={projeto}
                    loading={loading}
                    errorMessage={error}
                    onRetry={() => setReloadProjetoKey((prev) => prev + 1)}
                    onEditObra={handleEditObra}
                    onDeleteObra={handleDeleteObra}
                    onMenuClick={() => console.log('Abrir menu de ações da obra')}
                />

                <ObraTabs
                    abaAtiva={abaAtiva}
                    onChange={setAbaAtiva}
                    acaoLabel={acaoLabel}
                    onAcaoClick={handleAcaoAbaAtual}
                />

                <section className="obra-dashboard-content">
                    {!error && (
                        <div className="obra-dashboard-search-wrap">
                            <MagnifyingGlass size={18} weight="bold" className="obra-dashboard-search-icon" />
                            <input
                                type="text"
                                className="obra-dashboard-search-input"
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                placeholder="Pesquisar na aba atual"
                            />
                        </div>
                    )}

                    {!error && (
                        <div className={abaAtiva === 'materiais' ? '' : 'obra-dashboard-panel-hidden'}>
                            <MateriaisList
                                projetoId={Number(id)}
                                pesquisa={pesquisa}
                                externalRefreshKey={refreshMateriaisKey}
                            />
                        </div>
                    )}

                    {!error && (
                        <div className={abaAtiva === 'arquivos' ? '' : 'obra-dashboard-panel-hidden'}>
                            <ArquivosList
                                projetoId={Number(id)}
                                pesquisa={pesquisa}
                            />
                        </div>
                    )}
                </section>
            </div>

            {isDeleteModalOpen && (
                <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Confirmar exclusão de obra">
                    <div className="obra-modal-card">
                        <h3>Excluir obra</h3>
                        <p>Tem certeza que deseja excluir esta obra? Essa ação não pode ser desfeita.</p>
                        <div className="obra-modal-actions">
                            <button
                                type="button"
                                className="obra-modal-btn obra-modal-btn--ghost"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="obra-modal-btn obra-modal-btn--danger"
                                onClick={confirmDeleteObra}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isInfoModalOpen && (
                <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Aviso">
                    <div className="obra-modal-card">
                        <h3>Aviso</h3>
                        <p>{infoModalMessage}</p>
                        <div className="obra-modal-actions">
                            <button
                                type="button"
                                className="obra-modal-btn"
                                onClick={() => setIsInfoModalOpen(false)}
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddMaterialModalOpen && (
                <div className="obra-modal-overlay" role="dialog" aria-modal="true" aria-label="Adicionar material">
                    <div className="obra-modal-card">
                        <h3>Adicionar material</h3>
                        <p>Preencha os dados do novo item para incluir na lista de materiais.</p>

                        {addMaterialError && (
                            <div className="obra-form-alert" role="alert">
                                {addMaterialError}
                            </div>
                        )}

                        <div className="obra-form-grid">
                            <label className="obra-form-field">
                                <span>Descrição</span>
                                <input
                                    type="text"
                                    value={novoMaterial.descricao_original}
                                    onChange={(e) => setNovoMaterial((prev) => ({ ...prev, descricao_original: e.target.value }))}
                                    placeholder="Ex: Tubo PVC 100mm"
                                />
                            </label>

                            <label className="obra-form-field">
                                <span>Unidade</span>
                                <input
                                    type="text"
                                    value={novoMaterial.unidade}
                                    onChange={(e) => setNovoMaterial((prev) => ({ ...prev, unidade: e.target.value }))}
                                    placeholder="Ex: m, un, kg"
                                />
                            </label>

                            <label className="obra-form-field">
                                <span>Quantidade</span>
                                <input
                                    type="text"
                                    value={novoMaterial.quantidade}
                                    onChange={(e) => setNovoMaterial((prev) => ({ ...prev, quantidade: e.target.value }))}
                                    placeholder="Ex: 12.5"
                                />
                            </label>

                            <label className="obra-form-field">
                                <span>Preço unitário</span>
                                <input
                                    type="text"
                                    value={novoMaterial.preco_unitario}
                                    onChange={(e) => setNovoMaterial((prev) => ({ ...prev, preco_unitario: e.target.value }))}
                                    placeholder="Ex: 35.90"
                                />
                            </label>
                        </div>

                        <div className="obra-modal-actions">
                            <button
                                type="button"
                                className="obra-modal-btn obra-modal-btn--ghost"
                                onClick={() => {
                                    setIsAddMaterialModalOpen(false)
                                    setAddMaterialError(null)
                                }}
                                disabled={salvandoMaterial}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="obra-modal-btn"
                                onClick={handleSalvarMaterial}
                                disabled={salvandoMaterial}
                            >
                                {salvandoMaterial ? 'Salvando...' : 'Salvar material'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 