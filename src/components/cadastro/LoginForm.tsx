import React, { useState } from 'react';
import '../../styles/Cadastro.css';

const LoginForm: React.FC = () => {
  const [showSenha, setShowSenha] = useState(false);
  const [form, setForm] = useState({
    email: '',
    senha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

    return (
        <div className="log-card">
            <div className="cad-card-header">
                <div>
                    <h2 className="cad-card-title">Login</h2>
                    <p className="cad-card-sub">Acesse o sistema com suas credenciais</p>
                </div>
                    <div className="cad-seguro-badge">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1L2 3v3.5C2 9.538 3.985 12.07 6.5 13 9.015 12.07 11 9.538 11 6.5V3L6.5 1z" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
                        <path d="M4.5 6.5l1.5 1.5 2.5-2.5" stroke="rgb(30, 144, 255)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Seguro
                    </div>
            </div>
            {/* formulário de login aqui */}

            <form className="cad-form" onSubmit={handleSubmit} autoComplete="off">
                    {/* email */}
                    <div className="cad-field full">
                      <label className="cad-label">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                          <circle cx="7" cy="4.5" r="2.5" stroke="rgb(30, 144, 255)" strokeWidth="1.3"/>
                          <path d="M2 12c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="rgb(30, 144, 255)" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        Email <span className="req">*</span>
                      </label>
                      <input
                        className="cad-input"
                        type="text"
                        name="credenciais"
                        placeholder="Ex: seuemail@eb.mil.br"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

            {/* senha */}                                        
            <div className="cad-field full">
                      <label className="cad-label">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                          <rect x="1.5" y="6" width="11" height="7" rx="1" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
                          <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="rgb(30, 144, 255)" strokeWidth="1.3"/>
                        </svg>
                        Senha <span className="req">*</span>
                      </label>
                      <div className="cad-input-wrap">
                        <input
                          className="cad-input"
                          type={showSenha ? 'text' : 'password'}
                          name="senha"
                          placeholder="Sua senha"
                          value={form.senha}
                          onChange={handleChange}
                        />
                        <button type="button" className="eye-btn" onClick={() => setShowSenha(v => !v)}>
                          {showSenha ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="#888" strokeWidth="1.3"/>
                              <circle cx="8" cy="8" r="2" stroke="#888" strokeWidth="1.3"/>
                              <line x1="3" y1="3" x2="13" y2="13" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="#888" strokeWidth="1.3"/>
                              <circle cx="8" cy="8" r="2" stroke="#888" strokeWidth="1.3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="cad-security-box">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="security-icon">
                        <path d="M8 1.5L3 4v4c0 3.314 2.239 6.42 5 7.5C10.761 14.42 13 11.314 13 8V4L8 1.5z" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
                        <path d="M5.5 8l2 2 3-3" stroke="rgb(30, 144, 255)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        <p className="security-title">Segurança e Privacidade</p>
                        <p className="security-text">
                          Seus dados são protegidos com criptografia de ponta a ponta. Todas as informações são armazenadas de acordo com as normas de segurança do Exército Brasileiro.
                        </p>
                      </div>
                    </div>
                    
                    <button type="submit" className="cad-submit-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="5.5" r="2.5" stroke="white" strokeWidth="1.4"/>
                        <path d="M3 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Entrar
                    </button>
            </form>
        </div>
    );
};

export default LoginForm;