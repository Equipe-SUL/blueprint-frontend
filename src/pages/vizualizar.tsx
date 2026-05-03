import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/vizualizar.css';

export default function Vizualizar() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [fileName, setFileName] = useState<string>('documento');
  const [zoom, setZoom] = useState<number>(1);

  const handleSelecionarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);
      setZoom(1);

      if (file.type === 'application/pdf') {
        setFileType('pdf');
      } else if (file.type.startsWith('image/')) {
        setFileType('image');
      } else {
        alert('Formato não suportado. Envie um PDF ou Imagem.');
        setFileUrl(null);
        setFileType(null);
      }
    }
  };

  const handleZoomIn = () => setZoom((prev) => prev + 0.1);
  const handleZoomOut = () => setZoom((prev) => (prev > 0.5 ? prev - 0.1 : prev));

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVoltar = () => {
    if (fileUrl) {

      navigate(-1); 
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="vizualizar-page">
      <header className="navbar">
        <div className="logo">
          <span className="logo-text">Blue</span>
          <span className="logo-accent">print</span>
        </div>
        <button className="btn-top" onClick={handleVoltar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Voltar
        </button>
      </header>

      <main className="container">
        {/* Input Oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="application/pdf, image/*"
        />

        {/* Renderização Condicional: Tela de Upload vs Visualizador */}
        {!fileUrl ? (
          <div className="upload-area">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            <h1>Nenhum documento carregado</h1>
            <p>Clique no botão abaixo para carregar um arquivo PDF ou Imagem</p>
            <button className="btn-main" onClick={handleSelecionarClick}>
              Selecionar Arquivo
            </button>
          </div>
        ) : (
          <div id="viewerContainer">
            <div id="documentWrapper" style={{ transform: `scale(${zoom})` }}>
              {fileType === 'pdf' && (
                <iframe
                  id="pdfViewer"
                  src={`${fileUrl}#toolbar=0`}
                  title="Visualizador de PDF"
                  frameBorder="0"
                  style={{ width: '80vw', height: '80vh', borderRadius: '8px' }}
                />
              )}
              {fileType === 'image' && (
                <img
                  id="imgViewer"
                  src={fileUrl}
                  alt="Visualizador de Imagem"
                  style={{ maxWidth: '90%', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Toolbar Flutuante só aparece se tiver arquivo carregado */}
      {fileUrl && (
        <div className="toolbar">
          <div className="zoom-controls">
            <button title="Diminuir Zoom" onClick={handleZoomOut}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
            <span id="zoomPercent">{Math.round(zoom * 100)}%</span>
            <button title="Aumentar Zoom" onClick={handleZoomIn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                <line x1="11" x2="11" y1="8" y2="14" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
          </div>

          <div className="divider"></div>

          <button className="btn-download" title="Baixar Arquivo" onClick={handleDownload}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download
          </button>
        </div>
      )}
    </div>
  );
}