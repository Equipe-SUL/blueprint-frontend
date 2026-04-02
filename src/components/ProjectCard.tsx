import React from "react";
import {
  Fire,
  Lightning,
  Wall,
  Drop,
  Shield,
} from "phosphor-react";
import type { Projeto } from "../services/apiService";

type ProjectCardProps = {
  projeto: Projeto;
  onClick?: () => void;
};

const formatTipo = (tipo: string) => {
  return tipo
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTipoMeta = (tipo: string) => {
  switch (tipo) {
    case "eletrica":
      return {
        icon: <Lightning size={12} weight="bold" />,
        className: "tipo-eletrica",
      };
    case "hidraulica":
      return {
        icon: <Drop size={12} weight="bold" />,
        className: "tipo-hidraulica",
      };
    case "alvenaria":
      return {
        icon: <Wall size={12} weight="bold" />,
        className: "tipo-alvenaria",
      };
    case "spda":
      return {
        icon: <Shield size={12} weight="bold" />,
        className: "tipo-spda",
      };
    case "combate_a_incendio":
      return {
        icon: <Fire size={12} weight="bold" />,
        className: "tipo-combate_a_incendio",
      };
    default:
      return {
        icon: <Shield size={12} weight="bold" />,
        className: "tipo-default",
      };
  }
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
          <span
            key={`${projeto.id}-${tipo}-${i}`}
            className={`tipo-badge ${getTipoMeta(tipo).className}`}
          >
            {getTipoMeta(tipo).icon}
            {formatTipo(tipo)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;
