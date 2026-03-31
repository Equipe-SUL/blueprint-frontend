import React, { useEffect, useState } from "react";
import { getProjetos } from "../services/apiService";
import type { Projeto } from "../services/apiService";
import "../styles/ListaObras.css";


const ProjectList: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const formatTipo = (tipo: string) => {
  return tipo
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

useEffect(() => {
  setProjetos([
    {
      id: 1,
      nome_obra: "Obra X",
      cidade_obra: "São Paulo",
      estado_obra: "SP",
      desc_obra: "Esse projeto consiste em canos de esgoto.",
      tipo_projeto: ["hidraulica", "alvenaria"],
    },
        {
      id: 2,
      nome_obra: "Obra Y",
      cidade_obra: "Rio de Janeiro",
      estado_obra: "RJ",
      desc_obra: "Esse projeto consiste em canos de esgoto.",
      tipo_projeto: ["alvenaria"],
    },
            {
      id: 2,
      nome_obra: "Obra Y",
      cidade_obra: "Rio de Janeiro",
      estado_obra: "RJ",
      desc_obra: "Esse projeto consiste em canos de esgoto.",
      tipo_projeto: ["alvenaria"],
    },
            {
      id: 2,
      nome_obra: "Obra Y",
      cidade_obra: "Rio de Janeiro",
      estado_obra: "RJ",
      desc_obra: "Esse projeto consiste em canos de esgoto.",
      tipo_projeto: ["alvenaria"],
    },
  ]);
  setLoading(false);
}, []);

  if (loading) {
    return <div className="placeholder">Carregando projetos...</div>;
  }

  if (error) {
    return <div className="placeholder">Nenhum projeto carregado</div>;
  }

  return (
    <div className="project-container">
      {projetos.length === 0 ? (
        <div className="placeholder">
          <p>Nenhum projeto cadastrado ainda.</p>
        </div>
      ) : (
        <div className="project-scroll">
          {projetos.map((proj) => (
            <div
              key={proj.id}
              className="project-card"
              onClick={() => console.log("Clicou:", proj.id)}
            >
              <h3>{proj.nome_obra}</h3>

              <p className="location">
                {proj.cidade_obra} - {proj.estado_obra}
              </p>

              <p className="descricao">
                {proj.desc_obra}
              </p>

            <div className="tipo-container">
            {proj.tipo_projeto.map((tipo, i) => (
                <span key={i} className="tipo-badge">
                {formatTipo(tipo)}
                </span>
            ))}
            </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;