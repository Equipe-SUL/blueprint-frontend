import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import '../../styles/Cadastro.css';

type CadastroFormProps = {
  onSuccess?: () => void
}

function extractErrors(data: unknown): string[] {
  if (!data || typeof data !== 'object') return ['Erro desconhecido do servidor.']
  const errs: string[] = []
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      errs.push(...value.filter((v): v is string => typeof v === 'string'))
    } else if (typeof value === 'string') {
      errs.push(value)
    }
  }
  return errs.length ? errs : ['Erro desconhecido do servidor.']
}

const patentes = [
  'Soldado', 'Cabo', 'Terceiro-Sargento', 'Segundo-Sargento', 'Primeiro-Sargento',
  'Subtenente', 'Segundo-Tenente', 'Primeiro-Tenente', 'Capitão',
  'Major', 'Tenente-Coronel', 'Coronel', 'General-de-Brigada',
  'General-de-Divisão', 'General-de-Exército',
];

const unidades = [
  '6° Batalhão de Infantaria Leve do Exército', 'Comando da 12 Brigada de Infantaria Leve Aeromovel',
];

const CadastroForm: React.FC<CadastroFormProps> = ({ onSuccess }) => {
  const { addToast } = useToast()
  const [showSenha, setShowSenha] = useState(false);
  const [showRepetir, setShowRepetir] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    matricula: '',
    patente: '',
    unidade: '',
    senha: '',
    repetirSenha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormErrors([])

    // Validação básica: verificar se as senhas coincidem
    if (form.senha !== form.repetirSenha) {
      setFormErrors(["As senhas não coincidem!"])
      return
    }

    // Preparar o objeto para enviar ao Django (convertendo 'nome' para 'first_name')
    const payload = {
      first_name: form.nome,
      email: form.email,
      telefone: form.telefone,
      matricula: form.matricula,
      patente: form.patente,
      unidade: form.unidade,
      senha: form.senha
    };

    try {
      // Disparar os dados para a nossa API
      const response = await fetch('http://127.0.0.1:8000/api/users/cadastro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Tratar a resposta do backend
      if (response.ok) {
        setFormErrors([])
        addToast('Conta criada com sucesso!', 'success')
        setShowSuccessModal(true)
        
      } else {
        const errorData = await response.json();
        setFormErrors(extractErrors(errorData));
      }
      
    } catch (error) {
      setFormErrors(["Erro ao conectar com o servidor. O backend está rodando?"]);
    }
  };

  return (
    <>
      {showSuccessModal && (
        <div className="cad-modal-overlay" onClick={() => { setShowSuccessModal(false); onSuccess?.() }}>
          <div className="cad-modal-card" onClick={e => e.stopPropagation()}>
            <div className="cad-modal-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#22c55e" strokeWidth="3"/>
                <path d="M16 24l6 6 10-10" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Conta criada com sucesso!</h3>
            <p>Você já pode fazer login no sistema Blueprint com suas credenciais.</p>
            <div className="cad-modal-actions">
              <button
                className="cad-submit-btn"
                onClick={() => { setShowSuccessModal(false); onSuccess?.() }}
                style={{marginTop: 0}}
              >
                Ir para Login
              </button>
            </div>
          </div>
        </div>
      )}
    <div className="cad-card-wrap">
      <div className="cad-card">
        <div className="cad-card-header">
          <div>
            <h2 className="cad-card-title">Cadastro de Usuário</h2>
            <p className="cad-card-sub">Preencha os dados para criar uma nova conta no sistema</p>
          </div>
          <div className="cad-seguro-badge">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L2 3v3.5C2 9.538 3.985 12.07 6.5 13 9.015 12.07 11 9.538 11 6.5V3L6.5 1z" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
              <path d="M4.5 6.5l1.5 1.5 2.5-2.5" stroke="rgb(30, 144, 255)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Seguro
          </div>
        </div>

        <form className="cad-form" onSubmit={handleSubmit} autoComplete="off">
          {/* nome completo */}
          <div className="cad-field full">
            <label className="cad-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                <circle cx="7" cy="4.5" r="2.5" stroke="rgb(30, 144, 255)" strokeWidth="1.3"/>
                <path d="M2 12c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="rgb(30, 144, 255)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Nome Completo <span className="req">*</span>
            </label>
            <input
              className="cad-input"
              type="text"
              name="nome"
              placeholder="Ex: João Silva Santos"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          {/*email + telefone */}
          <div className="cad-row">
            <div className="cad-field">
              <label className="cad-label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                  <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
                  <path d="M1 4.5l6 4 6-4" stroke="rgb(30, 144, 255)" strokeWidth="1.3"/>
                </svg>
                Email <span className="req">*</span>
              </label>
              <input
                className="cad-input"
                type="email"
                name="email"
                placeholder="seuemail@eb.mil.br"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="cad-field">
              <label className="cad-label">Telefone <span className="req">*</span></label>
              <input
                className="cad-input"
                type="tel"
                name="telefone"
                placeholder="(12) 98765-4321"
                value={form.telefone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* matrícula + patente */}
          <div className="cad-row">
            <div className="cad-field">
              <label className="cad-label">Matrícula <span className="req">*</span></label>
              <input
                className="cad-input"
                type="text"
                name="matricula"
                placeholder="Ex: 123456789"
                value={form.matricula}
                onChange={handleChange}
                required
              />
            </div>
            <div className="cad-field">
              <label className="cad-label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                  <path d="M7 1l1.545 3.09L12 4.636l-2.5 2.455.59 3.454L7 8.91l-3.09 1.635.59-3.454L2 4.636l3.455-.546L7 1z" stroke="rgb(30, 144, 255)" strokeWidth="1.2" fill="none"/>
                </svg>
                Patente <span className="req">*</span>
              </label>
              <div className="cad-select-wrap">
                <select className="cad-select" name="patente" value={form.patente} onChange={handleChange} required>
                  <option value="">Selecione a patente</option>
                  {patentes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <svg className="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5l3 3 3-3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* unidade */}
          <div className="cad-field full">
            <label className="cad-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                <rect x="1.5" y="4" width="11" height="8.5" rx="1" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
                <path d="M4.5 4V3a2.5 2.5 0 0 1 5 0v1" stroke="rgb(30, 144, 255)" strokeWidth="1.3"/>
              </svg>
              Unidade <span className="req">*</span>
            </label>
            <div className="cad-select-wrap">
              <select className="cad-select" name="unidade" value={form.unidade} onChange={handleChange} required>
                <option value="">Selecione a unidade</option>
                {unidades.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <svg className="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5l3 3 3-3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* erros do backend */}
          {formErrors.length > 0 && (
            <div className="cad-error-box">
              {formErrors.map((msg, i) => (
                <div key={i} className="cad-error-row">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{flexShrink: 0}}>
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="#e05252" strokeWidth="1.3"/>
                    <path d="M7.5 4.5v3.5" stroke="#e05252" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="7.5" cy="10.5" r="0.7" fill="#e05252"/>
                  </svg>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

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
                placeholder="Mínimo 8 caracteres"
                value={form.senha}
                onChange={handleChange}
                required
                minLength={8}
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

          {/* repetir senha */}
          <div className="cad-field full">
            <label className="cad-label">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="field-icon">
                <rect x="1.5" y="6" width="11" height="7" rx="1" stroke="rgb(30, 144, 255)" strokeWidth="1.3" fill="none"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="rgb(30, 144, 255)" strokeWidth="1.3"/>
              </svg>
              Repetir Senha <span className="req">*</span>
            </label>
            <div className="cad-input-wrap">
              <input
                className="cad-input"
                type={showRepetir ? 'text' : 'password'}
                name="repetirSenha"
                placeholder="Digite a senha novamente"
                value={form.repetirSenha}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button type="button" className="eye-btn" onClick={() => setShowRepetir(v => !v)}>
                {showRepetir ? (
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

          {/* segurança e privacidade */}
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
            Criar Conta no Sistema
          </button>
        </form>

        <p className="cad-footer-note">
          Ao criar uma conta, você concorda com os nossos <a href="#" className="cad-link">termos de uso</a> do sistema Blueprint
        </p>
      </div>
    </div>
    </>          
  );
};

export default CadastroForm;