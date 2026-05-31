import { useEffect, useMemo, useState } from 'react'
import { Trash, SelectionAll } from 'phosphor-react'
import { deleteArquivoUpload, getArquivosUpload } from '../../services/apiService'
import ProcessarArquivoModal from './ProcessarArquivoModal'
import DeleteArquivoModal from './DeleteArquivoModal'

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
    refreshKey?: number
}

export default function ArquivosList({ projetoId, pesquisa, refreshKey }: ArquivosListProps) {
    const [arquivos, setArquivos] = useState<ArquivoItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [arquivoSelecionadoId, setArquivoSelecionadoId] = useState<number | null>(null)
    const [arquivoSelecionadoNome, setArquivoSelecionadoNome] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const [arquivoSelecionado, setArquivoSelecionado] = useState<ArquivoItem | null>(null)

    useEffect(() => {
        async function carregar() {
            if (!projetoId) return
            setLoading(true)
            setError(null)
            try {
                const dados = await getArquivosUpload(projetoId)
                setArquivos(dados as ArquivoItem[])
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Erro ao carregar arquivos.'
                setError(msg)
                setArquivos([])
            } finally {
                setLoading(false)
            }
        }

        carregar()
    }, [projetoId, refreshKey])

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

    async function handleOpenDeleteModal(arquivo: ArquivoItem) {
        setDeleteError(null)
        setArquivoSelecionadoId(arquivo.id)
        setArquivoSelecionadoNome(arquivo.nome_original)
        setIsDeleteModalOpen(true)
    }

    function handleCloseDeleteModal() {
        if (isDeleting) return
        setIsDeleteModalOpen(false)
        setArquivoSelecionadoId(null)
        setArquivoSelecionadoNome('')
        setDeleteError(null)
    }

    async function handleConfirmDeleteArquivo() {
        if (!arquivoSelecionadoId) return
        setIsDeleting(true)
        setDeleteError(null)
        try {
            await deleteArquivoUpload(projetoId, arquivoSelecionadoId)
            setIsDeleteModalOpen(false)
            setArquivos((prev) => prev.filter((a) => a.id !== arquivoSelecionadoId))
            setArquivoSelecionadoId(null)
            setArquivoSelecionadoNome('')
            setDeleteError(null)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Falha ao excluir arquivo.'
            setDeleteError(msg)
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return <p className="obra-dashboard-feedback">Carregando arquivos...</p>
    }

    if (error) {
        return <p className="obra-dashboard-feedback">{error}</p>
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
                        <div className="arquivo-card-head">
                            <div className="arquivo-card-title-wrap">
                                <SelectionAll size={20} weight="bold" className="arquivo-card-icon" />
                                <h3 className="arquivo-card-title">{arquivo.nome_original}</h3>
                            </div>
                            <button
                                type="button"
                                className="icon-btn arquivo-delete-btn"
                                aria-label={`Excluir ${arquivo.nome_original}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenDeleteModal(arquivo)
                                }}
                            >
                                <Trash size={20} weight="bold" />
                            </button>
                        </div>
                        <div className="arquivo-card-meta">
                            <span className={`status-badge status-badge--${arquivo.status_processamento}`}>
                                {arquivo.status_processamento}
                            </span>
                            <span className="arquivo-card-size">{arquivo.tamanho_mb ?? '-'} MB</span>
                            <span className="arquivo-card-date">
                                {new Date(arquivo.enviado_em).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </article>
                ))}
            </div>

            <ProcessarArquivoModal
                isOpen={!!arquivoSelecionado}
                projetoId={projetoId}
                arquivo={arquivoSelecionado}
                onClose={() => setArquivoSelecionado(null)}
            />

            <DeleteArquivoModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDeleteArquivo}
                arquivoNome={arquivoSelecionadoNome}
                isDeleting={isDeleting}
                errorMessage={deleteError}
            />
        </>
    )
}
