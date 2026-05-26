import { createBrowserRouter } from 'react-router-dom'
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
    // Rota pública
    path: '/cadastro',
    element: <Cadastro />,
  },
  {
    // App inteiro protegido: qualquer filho redireciona para /cadastro sem login
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
