const DEFAULT_API_BASE = 'http://127.0.0.1:8000'

export const API_BASE: string =
    import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE

export type TipoProjeto =
    | 'eletrica'
    | 'hidraulica'
    | 'alvenaria'
    | 'spda'
    | 'combate_a_incendio'

export type ProjetoCreatePayload = {
    nome_obra: string
    cidade_obra: string
    estado_obra: string
    desc_obra: string
    taxa_bdi?: number
}

export type Projeto = ProjetoCreatePayload & {
    id: number
    tipo_projeto?: TipoProjeto[]
    created_at?: string
}

export type ItemProjetoCreatePayload = {
    descricao_original: string
    unidade: string
    quantidade: number | string
    preco_unitario?: number | string
}

// Leitura de Erro no body Backend
async function readErrorBody(response: Response): Promise<string> {
    const contentType = response.headers.get('Content-Type') || ''

    try {
        if (contentType.includes('application/json')) {
            const data = await response.json()
            return typeof data.detail === 'string' ? data.detail : JSON.stringify(data)
        }
        return await response.text()
    } catch {
        return `${response.status} ${response.statusText}`
    }
}

// Função para chamadas API
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, options)

    if (!response.ok) {
        throw new Error(await readErrorBody(response))
    }

    // Some successful endpoints (e.g. DELETE) return 204 with no body.
    if (response.status === 204) {
        return undefined as T
    }

    const contentType = response.headers.get('Content-Type') || ''
    if (!contentType.includes('application/json')) {
        return undefined as T
    }

    return response.json() as T
}

// Checar se o servidor está ativo
export async function pingServer(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/server/`)
    if (!res.ok) throw new Error(await readErrorBody(res))

    const text = await res.text()
    return text.toLowerCase().includes("ativo")
}

// Criar novo projeto
export async function createProjeto(payload: ProjetoCreatePayload): Promise<Projeto> {
    return apiRequest<Projeto>('/api/projetos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

// Listar projetos existentes
export async function getProjetos(): Promise<Projeto[]> {
    return apiRequest<Projeto[]>('/api/projetos/')
}

// Obter um projeto específico
export async function getProjetoById(id: number): Promise<Projeto> {
    return apiRequest<Projeto>(`/api/projetos/${id}/`)
}

// Atualizar um projeto existente
export async function updateProjeto(id: number, payload: Partial<ProjetoCreatePayload>): Promise<Projeto> {
    return apiRequest<Projeto>(`/api/projetos/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

// Deletar um projeto
export async function deleteProjeto(id: number): Promise<void> {
    await apiRequest(`/api/projetos/${id}/`, { method: 'DELETE' })
}

export async function deleteArquivoUpload(projetoId: number, arquivoId: number): Promise<void> {
    await apiRequest(`/api/projetos/${projetoId}/upload/${arquivoId}/`, { method: 'DELETE' })
}

export async function getArquivosUpload(projetoId: number): Promise<unknown[]> {
    // Endpoint definido no back-end: GET /api/projetos/<projeto_id>/upload/
    return apiRequest(`/api/projetos/${projetoId}/upload/`)
}


export async function createItemProjeto(
    projetoId: number,
    payload: ItemProjetoCreatePayload
): Promise<unknown> {
    return apiRequest(`/api/projetos/${projetoId}/itens/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

// Upload de arquivo DXF para um projeto específico
export async function uploadArquivoDXF(projetoId: number, file: File): Promise<unknown> {
    const formData = new FormData()
    formData.append('arquivo', file)

    const res = await fetch(`${API_BASE}/api/projetos/${projetoId}/upload/`, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) {
        throw new Error(await readErrorBody(res))
    }

    return await res.json()
}
