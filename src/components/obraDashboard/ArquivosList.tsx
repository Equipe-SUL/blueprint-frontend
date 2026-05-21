import { useEffect, useMemo, useState } from 'react'
import { Trash } from 'phosphor-react'
import { deleteArquivoUpload, getArquivosUpload } from '../../services/apiService'
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
}

export default function ArquivosList({ projetoId, pesquisa }: ArquivosListProps) {
    const [arquivos, setArquivos] = useState<ArquivoItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [arquivoSelecionadoId, setArquivoSelecionadoId] = useState<number | null>(null)
    const [arquivoSelecionadoNome, setArquivoSelecionadoNome] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

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
            // CA.3: atualizar listagem sem reload (sem refetch necessário)
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
        <div className="arquivos-grid">
            {arquivosFiltrados.map((arquivo) => (
                <article className="arquivo-card" key={arquivo.id}>
                    <div className="arquivo-card-head">
                        <h3 className="arquivo-card-title">{arquivo.nome_original}</h3>
                        <button
                            type="button"
                            className="icon-btn arquivo-delete-btn"
                            aria-label={`Excluir ${arquivo.nome_original}`}
                            onClick={() => handleOpenDeleteModal(arquivo)}
                        >
                            <Trash size={20} weight="bold" />
                        </button>
                    </div>
                    <p className="arquivo-card-line">Status: {arquivo.status_processamento}</p>
                    <p className="arquivo-card-line">Tamanho: {arquivo.tamanho_mb ?? '-'} MB</p>
                    <p className="arquivo-card-line">Enviado em: {new Date(arquivo.enviado_em).toLocaleString('pt-BR')}</p>
                </article>
            ))}

            <DeleteArquivoModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDeleteArquivo}
                arquivoNome={arquivoSelecionadoNome}
                isDeleting={isDeleting}
                errorMessage={deleteError}
            />
        </div>
    )
}

