import { createBrowserRouter } from 'react-router-dom'
import App from './components/App'
import Home from './pages/Home'
import Obras from './pages/Obras'
import NotFound from './pages/NotFound'
import { NovaObra } from './pages/NovaObra'
import { ObraDashboard } from './pages/ObraDashboard'
import Cadastro from './pages/Cadastro' // sem chaves

export const router = createBrowserRouter([
  {
    // Rota pública de cadastro (fora do App para não herdar menus/layouts internos)
    path: '/cadastro',
    element: <Cadastro />,
  },
  {
    element: <App />,
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
      }
    ],
  },
])