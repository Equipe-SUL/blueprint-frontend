import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SignOut } from 'phosphor-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo from './Logo'
import '../styles/Navbar.css'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function handleLogout() {
        setOpen(false)
        addToast('Você saiu do sistema.', 'info')
        logout()
        navigate('/login')
    }

    function getInitials(): string {
        if (!user?.first_name) return '?'
        const parts = user.first_name.trim().split(/\s+/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return parts[0][0].toUpperCase()
    }

    return (
        <nav className="navbar-root">
            <Link to="/obras" className="navbar-logo-link">
                <Logo colorBluePart="#ffffff" colorPrintPart="#3b82f6" fontSize="1.5rem" />
            </Link>

            <div className="navbar-right" ref={ref}>
                <button
                    className="navbar-avatar-btn"
                    onClick={() => setOpen((prev) => !prev)}
                    title={user?.first_name || 'Usuário'}
                >
                    <span className="navbar-avatar">{getInitials()}</span>
                </button>

                {open && (
                    <div className="navbar-dropdown">
                        <div className="navbar-dropdown-info">
                            <span className="navbar-dropdown-name">{user?.first_name || 'Usuário'}</span>
                            <span className="navbar-dropdown-email">{user?.email || ''}</span>
                        </div>
                        <hr className="navbar-dropdown-divider" />
                        <button className="navbar-dropdown-item" onClick={handleLogout}>
                            <SignOut size={16} weight="bold" />
                            <span>Sair</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}
