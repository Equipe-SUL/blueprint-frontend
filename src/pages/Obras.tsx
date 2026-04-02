import { useState } from "react";
import Footer from "../components/Footer";
import ProjectList from "../components/ListaObras";
import HomeHero from "../components/home/HomeHero";
import ObrasSectionHeader from "../components/home/ObrasSectionHeader";
import ObrasToolbar from "../components/home/ObrasToolbar";
import Logo from "../components/Logo";
import type { TipoProjeto } from "../services/apiService";
import "../styles/Home.css";
import "../styles/globals.css";

export default function Obras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoProjeto | "">("");

  return (
    <>
      <div className="home-page">
        <HomeHero
          title={<Logo colorBluePart="#ffffff" colorPrintPart="#1e90ff" />}
          subtitle="Sua plataforma para cadastro e documentação de obras."
        />

        <ObrasSectionHeader title="Obras Registradas" />

        <ObrasToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          tipoFilter={tipoFilter}
          onTipoFilterChange={setTipoFilter}
          ctaLabel="Cadastrar Obra"
          ctaTo="/nova-obra"
        />

        <ProjectList searchTerm={searchTerm} tipoFilter={tipoFilter} />
      </div>
      <Footer />
    </>
  );
}
