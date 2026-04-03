import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MagnifyingGlass } from 'phosphor-react'
import ObraHead from '../components/obraDashboard/ObraHead'
import ObraTabs from '../components/obraDashboard/ObraTabs'
import MateriaisList from '../components/obraDashboard/MateriaisList'
import ArquivosList from '../components/obraDashboard/ArquivosList'
import { deleteProjeto, getProjetoById } from '../services/apiService'
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
    const [infoModalMessage, setInfoModalMessage] = useState('')

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
                    onAcaoClick={() => console.log(`Ação da aba: ${abaAtiva}`)}
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
        </div>
    )
} 