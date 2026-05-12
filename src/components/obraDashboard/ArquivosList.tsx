import { useMemo } from 'react'

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

export default function ArquivosList({ pesquisa }: ArquivosListProps) {
    const arquivos: ArquivoItem[] = []

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
