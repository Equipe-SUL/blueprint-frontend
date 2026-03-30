import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-content">
      <h2>Blueprint</h2>
      <p>template inicial...</p>
      
      {/* O Link funciona como um <a>, mas não recarrega a página */}
      <Link to="/nova-obra">
        <button className="btn-navegacao">Ir para Nova Obra</button>
      </Link>
    </div>
  )
}