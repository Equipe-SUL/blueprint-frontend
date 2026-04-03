import React from "react";
import type { Projeto } from "../services/apiService";
import TipoBadge from "./TipoBadge";

type ProjectCardProps = {
  projeto: Projeto;
  onClick?: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ projeto, onClick }) => {
  return (
    <div className="project-card" onClick={onClick}>
      <h3>{projeto.nome_obra}</h3>

      <p className="location">
        {projeto.cidade_obra} - {projeto.estado_obra}
      </p>

      <p className="descricao">{projeto.desc_obra}</p>

      <div className="tipo-container">
        {projeto.tipo_projeto.map((tipo, i) => (
          <TipoBadge key={`${projeto.id}-${tipo}-${i}`} tipo={tipo} />
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;
