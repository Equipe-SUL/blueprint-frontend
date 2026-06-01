import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import '../styles/App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Outlet />
    </div>
  )
}

export default App
