import { createBrowserRouter } from 'react-router-dom'
import App from './components/App'
import Home from './pages/Home'
import Obras from './pages/Obras'
import NotFound from './pages/NotFound'
import { NovaObra } from './pages/NovaObra'
import { ObraDashboard } from './pages/ObraDashboard'

export const router = createBrowserRouter([
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

