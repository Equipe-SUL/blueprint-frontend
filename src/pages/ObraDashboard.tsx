import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MagnifyingGlass } from 'phosphor-react'
import ObraHead from '../components/obraDashboard/ObraHead'
import ObraTabs from '../components/obraDashboard/ObraTabs'
import MateriaisList from '../components/obraDashboard/MateriaisList'
import ArquivosList from '../components/obraDashboard/ArquivosList'
import { getProjetoById } from '../services/apiService'
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
    const [projeto, setProjeto] = useState<ProjetoResumo | null>(null)
    const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('materiais')
    const [pesquisa, setPesquisa] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadProjetoKey, setReloadProjetoKey] = useState(0)

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

    return (
        <div className="obra-dashboard-page">
            <div className="obra-dashboard-container">
                <ObraHead
                    projeto={projeto}
                    loading={loading}
                    errorMessage={error}
                    onRetry={() => setReloadProjetoKey((prev) => prev + 1)}
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
        </div>
    )
} 