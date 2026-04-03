import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MagnifyingGlass } from 'phosphor-react'
import ObraHead from '../components/obraDashboard/ObraHead'
import ObraTabs from '../components/obraDashboard/ObraTabs'
import MateriaisList from '../components/obraDashboard/MateriaisList'
import ArquivosList from '../components/obraDashboard/ArquivosList'
import AddMaterialModal from '../components/obraDashboard/AddMaterialModal'
import DeleteObraModal from '../components/obraDashboard/DeleteObraModal'
import InfoModal from '../components/obraDashboard/InfoModal'
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

    function handleChangeNovoMaterial(field: keyof typeof novoMaterial, value: string) {
        setNovoMaterial((prev) => ({ ...prev, [field]: value }))
    }

    function fecharAdicionarMaterial() {
        setIsAddMaterialModalOpen(false)
        setAddMaterialError(null)
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

            <DeleteObraModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteObra}
            />

            <InfoModal
                isOpen={isInfoModalOpen}
                message={infoModalMessage}
                onClose={() => setIsInfoModalOpen(false)}
            />

            <AddMaterialModal
                isOpen={isAddMaterialModalOpen}
                salvandoMaterial={salvandoMaterial}
                addMaterialError={addMaterialError}
                novoMaterial={novoMaterial}
                onChangeNovoMaterial={handleChangeNovoMaterial}
                onClose={fecharAdicionarMaterial}
                onSave={handleSalvarMaterial}
            />
        </div>
    )
} 