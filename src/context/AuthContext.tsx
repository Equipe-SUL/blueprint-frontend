import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE } from '../services/apiService'

type UserInfo = {
    id: number
    first_name: string
    email: string
    username: string
}

interface AuthContextType {
    isAuthenticated: boolean
    user: UserInfo | null
    login: (access: string, refresh: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('access_token')
    })
    const [user, setUser] = useState<UserInfo | null>(null)

    useEffect(() => {
        if (!isAuthenticated) return

        async function fetchUser() {
            const token = localStorage.getItem('access_token')
            if (!token) return

            try {
                const res = await fetch(`${API_BASE}/api/users/me/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                } else {
                    setIsAuthenticated(false)
                }
            } catch {
                setIsAuthenticated(false)
            }
        }

        fetchUser()
    }, [isAuthenticated])

    const login = (access: string, refresh: string) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
