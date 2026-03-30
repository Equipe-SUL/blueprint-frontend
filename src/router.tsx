import { createBrowserRouter } from 'react-router-dom'
import App from './components/App'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { NovaObra } from './pages/NovaObra'

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
        path: '/nova-obra', 
        element: <NovaObra />,
      },
    ],
  },
])

