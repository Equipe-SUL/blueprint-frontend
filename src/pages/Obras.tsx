import { useState } from "react";
import ProjectList from "../components/ListaObras";
import ObrasSectionHeader from "../components/home/ObrasSectionHeader";
import ObrasToolbar from "../components/home/ObrasToolbar";
import StatsCards from "../components/home/StatsCards";
import "../styles/Home.css";
import "../styles/globals.css";

export default function Obras() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div className="home-page" style={{ paddingTop: '24px' }}>
        <ObrasSectionHeader title="Painel de Obras" />

        <StatsCards />

        <ObrasToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          ctaLabel="Cadastrar Obra"
          ctaTo="/nova-obra"
        />

        <ProjectList searchTerm={searchTerm} />
      </div>
    </>
  );
}
