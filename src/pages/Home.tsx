import { Link } from 'react-router-dom';
import ProjectList from "../components/ListaObras";
import Footer from "../components/Footer";
import '../styles/Home.css';
import '../styles/globals.css';


export default function Home() {
  return (
    <>
    <div className='home-page'>
      <div className='header-section'>
        <h1>Blueprint</h1>
        <p>Sua plataforma para cadastro e documentação de obras.</p>
      </div>
      <Link to="/nova-obra">
      </Link>
      <div className="list-title">
        <div className="title-left">
          <span className="blue-divider"></span>
          <h2>Obras registradas</h2>
        </div>
        <Link to="/nova-obra">
          <button className="submit-btn">Criar Obra</button>
        </Link>
      </div>
      <ProjectList />
    </div>
    <Footer />
    </>
  )
}