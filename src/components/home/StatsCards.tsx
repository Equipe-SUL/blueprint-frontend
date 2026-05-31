import { useEffect, useState } from 'react'
import { API_BASE } from '../../services/apiService'
import { Buildings, File, Cube } from 'phosphor-react'

type Stats = {
    total_obras: number
    total_arquivos: number
    total_materiais: number
}

export default function StatsCards() {
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        async function fetchStats() {
            const token = localStorage.getItem('access_token')
            try {
                const res = await fetch(`${API_BASE}/api/dashboard/stats/`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                })
                if (res.ok) {
                    setStats(await res.json())
                }
            } catch {
                // silently fail
            }
        }
        fetchStats()
    }, [])

    const cards = [
        { icon: Buildings, label: 'Obras', value: stats?.total_obras ?? 0, color: '#3b82f6' },
        { icon: File, label: 'Arquivos', value: stats?.total_arquivos ?? 0, color: '#10b981' },
        { icon: Cube, label: 'Materiais', value: stats?.total_materiais ?? 0, color: '#f59e0b' },
    ]

    return (
        <div className="stats-cards">
            {cards.map((c) => (
                <div key={c.label} className="stats-card">
                    <div className="stats-card-icon" style={{ background: `${c.color}1a`, color: c.color }}>
                        <c.icon size={24} weight="bold" />
                    </div>
                    <div className="stats-card-info">
                        <span className="stats-card-value">{c.value}</span>
                        <span className="stats-card-label">{c.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
