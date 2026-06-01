import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './components/App'
import Home from './pages/Home'
import Obras from './pages/Obras'
import NotFound from './pages/NotFound'
import { NovaObra } from './pages/NovaObra'
import { ObraDashboard } from './pages/ObraDashboard'
import Cadastro from './pages/Cadastro'
import PrivateRoute from './components/PrivateRoute'  // <- novo

export const router = createBrowserRouter([
  {
    // Redirecionar /cadastro antigo para /login
    path: '/cadastro',
    element: <Navigate to="/login" replace />,
  },
  {
    // Rota pública
    path: '/login',
    element: <Cadastro />,
  },
  {
    // App inteiro protegido: qualquer filho redireciona para /login sem login
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/obras',
        element: <Obras />,
      },
      {
        path: '/nova-obra',
        element: <NovaObra />,
      },
      {
        path: '/obras/:id',
        element: <ObraDashboard />,
      },
    ],
  },
])
