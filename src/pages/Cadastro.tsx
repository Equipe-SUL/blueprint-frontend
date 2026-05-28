import React, { useState } from 'react';
import '../styles/Cadastro.css';
import CadastroForm from '../components/cadastro/CadastroForm';
import LoginForm from '../components/cadastro/LoginForm';
import Logo from '../components/Logo';

const Cadastro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cadastro' | 'login'>('cadastro');

  return (
    <div className="cadastro-root">
      {/* header */}
    <article id='artbug'>
      <header className="header-section2">
          <div className="logo-group">
            <Logo colorBluePart="#ffffff" colorPrintPart="#1e90ff" fontSize='2.5rem' />
          </div>
          <div className="sub-header-line">
            <span className="blue-divider"></span>
            <span>EXÉRCITO BRASILEIRO</span>
          </div>
        </header>

      {/* telas */}
      <div className="cad-tabs">
          <button className={`cad-tab ${activeTab === 'cadastro' ? 'active' : ''}`}
              onClick={() => setActiveTab('cadastro')} >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="tab-icon">
              <path d="M8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 8c3.315 0 6 1.343 6 3v1H2v-1c0-1.657 2.685-3 6-3z" fill="currentColor"/>
            </svg>
            Cadastro de Usuário
          </button>
            <button
              className={`cad-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="tab-icon">
              <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Login
          </button>
        </div>
        {activeTab === 'cadastro' && (
            <div className="cad-card-wrap">
                <CadastroForm onSuccess={() => setActiveTab('login')} />
            </div>
          )}

        {activeTab === 'login' && (
            <div className="cad-card-wrap">
              <LoginForm />
            </div>
          )}

        </article>
    </div>
  );
  
};

export default Cadastro;