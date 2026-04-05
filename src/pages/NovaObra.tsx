import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProjeto, uploadArquivoDXF, type TipoProjeto } from '../services/apiService'
import '../styles/NovaObra.css';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

export function NovaObra() {
  const [step, setStep] = useState(1); 
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const tipoProjetoOptions: Array<{ value: TipoProjeto; label: string }> = [
    { value: 'hidraulica', label: 'Hidraulica' },
    { value: 'eletrica', label: 'Elétrica' },
    { value: 'alvenaria', label: 'Alvenaria' },
    { value: 'spda', label: 'SPDA' },
    { value: 'combate_a_incendio', label: 'Combate a incêndio' },
  ];

  const [dadosObra, setDadosObra] = useState({
    nome_obra: '',
    cidade_obra: '',
    estado_obra: '',
    desc_obra: '',
    tipo_projeto: [] as TipoProjeto[],
  });

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoProjeto | ''>('');

  const adicionarTipo = (tipo: TipoProjeto) => {
    setDadosObra((prev) => {
      if (prev.tipo_projeto.includes(tipo)) return prev;
      return { ...prev, tipo_projeto: [...prev.tipo_projeto, tipo] };
    });
  };

  const removerTipo = (tipo: TipoProjeto) => {
    setDadosObra((prev) => ({
      ...prev,
      tipo_projeto: prev.tipo_projeto.filter((t) => t !== tipo),
    }));
  };

  const tiposSelecionadosTexto = dadosObra.tipo_projeto
    .map((tipo) => tipoProjetoOptions.find((o) => o.value === tipo)?.label ?? tipo)
    .join(', ');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const maxSize = 15 * 1024 * 1024; 
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'dxf') {
        alert(`O arquivo ${file.name} não é um DXF!`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`O arquivo ${file.name} ultrapassa o limite de 15MB!`);
        continue;
      }
      validFiles.push(file);
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      const obra = await createProjeto({
        nome_obra: dadosObra.nome_obra,
        cidade_obra: dadosObra.cidade_obra,
        estado_obra: dadosObra.estado_obra,
        desc_obra: dadosObra.desc_obra,
        tipo_projeto: dadosObra.tipo_projeto,
      });

      for (const file of files) {
        await uploadArquivoDXF(obra.id, file);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="nova-obra-page">
      <div className="container-form">
        <header className="header-section">
          <div className="logo-group">
            <div className="logo-sq"><img src="/upload.png" alt="Logo Icon" /></div>
            <div className="logo-txt">
              <h1><Logo colorBluePart="#ffffff" colorPrintPart="#1e90ff" /></h1>
              <p id='pobras'>Sistema de Gestão de Obras</p>
            </div>
          </div>
          <div className="sub-header-line">
            <span className="blue-divider"></span>
            <span>EXÉRCITO BRASILEIRO</span>
          </div>
        </header>

        <main className="obra-card">
          {loading && (
            <div className="card-content-centered">
              <div className="loader">
                {[...Array(7)].map((_, i) => <div key={i} className="loader-square"></div>)}
              </div>
              <p className="loading-text">Processando cadastro...</p>
            </div>
          )}

          {success && (
            <div className="card-content-centered success-view">
              <div className="status-icon-box success-bg">
                <svg viewBox="0 0 512 512"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.248-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.248 16.379 6.248 22.628 0z"/></svg>
              </div>
              <h3>Obra Cadastrada!</h3>
              <p>Os arquivos DXF e os dados foram enviados com sucesso.</p>
              <button className="submit-btn back-btn" onClick={() => navigate('/')}>Voltar para o Início</button>
            </div>
          )}

          {error && (
            <div className="card-content-centered error-view">
              <div className="status-icon-box error-bg">
                <svg viewBox="0 0 512 512"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v152c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V140c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16zm0 216v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16z"/></svg>
              </div>
              <h3>Falha no envio</h3>
              <button className="submit-btn retry-btn" onClick={() => {setError(false); setStep(1);}}>Tentar Novamente</button>
            </div>
          )}

          {!loading && !success && !error && (
            <>
              {step === 1 ? (
                /* DADOS BÁSICOS */
                <div className="form-step">
                  <div className="card-top">
                    <h2>Dados da Obra</h2>
                    <p>Passo 1 de 2</p>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (dadosObra.tipo_projeto.length === 0) {
                      alert('Selecione pelo menos um tipo de obra.');
                      return;
                    }
                    setStep(2);
                  }}>
                    <div className="form-field">
                      <label>Nome da Obra *</label>
                      <input type="text" placeholder="Nome identificador" required value={dadosObra.nome_obra} onChange={(e) => setDadosObra({...dadosObra, nome_obra: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>Cidade *</label>
                      <input type="text" placeholder="Cidade da obra" required value={dadosObra.cidade_obra} onChange={(e) => setDadosObra({...dadosObra, cidade_obra: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>Estado (UF) *</label>
                      <select required aria-label="Estado (UF)" value={dadosObra.estado_obra} onChange={(e) => setDadosObra({...dadosObra, estado_obra: e.target.value})}>
                        <option value="">Selecione...</option>
                        {["SP", "RJ", "MG", "ES", "PR", "SC", "RS", "MT", "MS", "GO", "DF", "RO", "AC", "AP", "AM", "RR", "PA", "TO", "BA", "MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE" ].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Descrição Breve *</label>
                      <input type="text" placeholder="Ex: Terraplanagem setor norte" required value={dadosObra.desc_obra} onChange={(e) => setDadosObra({...dadosObra, desc_obra: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>Tipo de Obra *</label>
                      <select
                        aria-label="Tipo de Obra"
                        value={tipoSelecionado}
                        onChange={(e) => {
                          const value = e.target.value as TipoProjeto | '';
                          if (!value) return;
                          adicionarTipo(value);
                          setTipoSelecionado('');
                        }}
                      >
                        <option value="">Selecione o tipo...</option>
                        {tipoProjetoOptions.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {dadosObra.tipo_projeto.length > 0 && (
                        <div className="tipo-chips">
                          {dadosObra.tipo_projeto.map((tipo) => {
                            const label = tipoProjetoOptions.find((o) => o.value === tipo)?.label ?? tipo;
                            return (
                              <span key={tipo} className="tipo-chip">
                                {label}
                                <button
                                  type="button"
                                  className="tipo-chip-remove"
                                  aria-label={`Remover tipo ${label}`}
                                  onClick={() => removerTipo(tipo)}
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <button type="submit" className="submit-btn">Próxima Etapa</button>
                  </form>
                </div>
              ) : (
                /* ARQUIVOS DXF */
                <div className="form-step">
                  <div className="card-top">
                    <h2>Arquivos DXF</h2>
                    <p>Passo 2 de 2</p>
                  </div>
                  <p className="step-warning">
                    Envie somente arquivos DXF dos tipos de obra selecionados: {tiposSelecionadosTexto}
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div className="form-field">
                      <label>Plantas e Projetos (DXF) *</label>
                      <div className="upload-box">
                        <input 
                          type="file" 
                          id="file-upload" 
                          hidden 
                          multiple 
                          accept=".dxf" 
                          onChange={handleFileChange} 
                        />
                        <label id='labelupload' htmlFor="file-upload" className="upload-label">
                          <div className="upload-icon">↑</div>
                          <strong>{files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : "Clique para selecionar DXFs"}</strong>
                          <span className="upload-help">Apenas .dxf | Máx 15MB por arquivo</span>
                        </label>
                      </div>
                      {files.length > 0 && (
                        <div className="file-list">
                          {files.map((f, i) => <div key={i} className="file-item">📄 {f.name}</div>)}
                        </div>
                      )}
                    </div>
                    <div className="actions-row">
                      <button type="button" className="submit-btn retry-btn" onClick={() => setStep(1)}>Voltar</button>
                      <button type="submit" className="submit-btn" disabled={files.length === 0}>Finalizar Cadastro</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
    <Footer />
    </>
  );
}