import { createBrowserRouter } from 'react-router-dom'
import App from './components/App'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      // Adicione mais rotas aqui
    ],
  },
])
