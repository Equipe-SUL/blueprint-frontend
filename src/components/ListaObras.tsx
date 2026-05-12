import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjetos } from "../services/apiService";
import type { Projeto } from "../services/apiService";
import ProjectCard from "./ProjectCard.tsx";
import DashboardLoader from "./obraDashboard/DashboardLoader";
import "../styles/ListaObras.css";

type ProjectListProps = {
  searchTerm?: string;
};

const ProjectList: React.FC<ProjectListProps> = ({
  searchTerm = "",
}) => {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarProjetos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjetos();
      setProjetos(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao carregar projetos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function carregarProjetosComGuard() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProjetos();
        if (!cancelled) {
          setProjetos(data);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao carregar projetos";
        if (!cancelled) {
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    carregarProjetosComGuard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="project-container list-loading-wrapper">
        <DashboardLoader message="Carregando obras..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-container list-error-wrapper">
        <div className="list-error-box">
          <h3>Falha ao carregar obras</h3>
          <p>{error}</p>
          <button className="list-retry-btn" onClick={carregarProjetos}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const searchNormalized = searchTerm.trim().toLowerCase();
  const projetosFiltrados = projetos.filter((proj) => {
    const tiposProjeto = Array.isArray(proj.tipo_projeto) ? proj.tipo_projeto : [];
    if (!searchNormalized) return true;

    const textoBase = [
      proj.nome_obra,
      proj.cidade_obra,
      proj.estado_obra,
      proj.desc_obra,
      tiposProjeto.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return textoBase.includes(searchNormalized);
  });

  const temFiltroAtivo = Boolean(searchNormalized);

  return (
    <div className="project-container">
      {projetosFiltrados.length === 0 ? (
        <div className="placeholder">
          <p>
            {temFiltroAtivo
              ? "Nenhuma obra encontrada para os filtros informados."
              : "Nenhum projeto cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="project-scroll">
          {projetosFiltrados.map((proj) => (
            <ProjectCard
              key={proj.id}
              projeto={proj}
              onClick={() => navigate(`/obras/${proj.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;