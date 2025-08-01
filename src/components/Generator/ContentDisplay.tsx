import React, { useState } from 'react';
import { Download, Copy, CheckCircle2, FileText, Presentation, FileQuestion } from 'lucide-react';
import { generateDocx, generatePptx, generatePdf } from '../../utils/documentGenerators';

interface ContentDisplayProps {
  title: string;
  content: string | null;
  type: 'guion' | 'presentacion' | 'ejercicios';
  isLoading: boolean;
  format: string;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ title, content, type, isLoading, format }) => {
  const [copied, setCopied] = React.useState(false);
  const [showPreview, setShowPreview] = useState(type === 'guion' || type === 'presentacion');

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!content) return;
    
    const filename = title.toLowerCase().replace(/\s+/g, '-');
    
    try {
      switch (format) {
        case 'docx':
          await generateDocx(content, filename);
          break;
        case 'pptx':
          await generatePptx(content, filename);
          break;
        case 'pdf':
          await generatePdf(content, filename);
          break;
        default:
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document. Please try again.');
    }
  };

  const formatTextWithBold = (text: string) => {
    // Dividir el texto por los asteriscos dobles
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remover los asteriscos y aplicar negrita
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-gray-900">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  const renderScriptPreview = () => {
    if (!content) return null;

    // Dividir por secciones usando headers de markdown (# ## ###) o líneas que parecen títulos
    const sections = content.split(/(?=^#{1,3}\s+|\n\s*\n(?=[A-ZÁÉÍÓÚÑ][^.\n]*:?\s*$))/gm).filter(section => section.trim());
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          const lines = section.split('\n');
          let title = lines[0];
          let sectionContent = lines.slice(1);
          
          // Si es un header de markdown, limpiar los #
          if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '');
          }
          
          // Filtrar líneas vacías al inicio del contenido
          while (sectionContent.length > 0 && !sectionContent[0].trim()) {
            sectionContent = sectionContent.slice(1);
          }
          
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-indigo-600 mb-3">
                {formatTextWithBold(title)}
              </h3>
              <div className="prose prose-indigo max-w-none">
                {sectionContent.map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  
                  // Líneas vacías
                  if (!trimmedLine) {
                    return <div key={lineIndex} className="h-2"></div>;
                  }
                  
                  // Headers secundarios (##, ###)
                  if (trimmedLine.match(/^#{2,3}\s+/)) {
                    return (
                      <h4 key={lineIndex} className="text-md font-semibold text-gray-800 mt-4 mb-2">
                        {formatTextWithBold(trimmedLine.replace(/^#+\s*/, ''))}
                      </h4>
                    );
                  }
                  
                  // Listas con - o *
                  if (trimmedLine.match(/^[-*]\s+/)) {
                    return (
                      <div key={lineIndex} className="flex items-start mb-2">
                        <p className="text-gray-700 leading-relaxed">
                          {formatTextWithBold(trimmedLine.replace(/^[-*]\s+/, ''))}
                        </p>
                      </div>
                    );
                  }
                  
                  // Listas numeradas
                  if (trimmedLine.match(/^\d+\.\s+/)) {
                    const number = trimmedLine.match(/^(\d+)\./)?.[1];
                    return (
                      <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-indigo-600 mr-2 mt-1 font-medium">{number}.</span>
                        <p className="text-gray-700 leading-relaxed">
                          {formatTextWithBold(trimmedLine.replace(/^\d+\.\s+/, ''))}
                        </p>
                      </div>
                    );
                  }
                  
                  // Texto normal
                  return (
                    <p key={lineIndex} className="text-gray-700 leading-relaxed mb-2">
                      {formatTextWithBold(trimmedLine)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPresentationPreview = () => {
    if (!content) return null;

    // Dividir por diapositivas usando headers o patrones de diapositiva
    const slides = content.split(/(?=^#{1,2}\s+|\n\s*(?:Diapositiva|Slide)\s*\d+|\n\s*\n(?=[A-ZÁÉÍÓÚÑ][^.\n]*:?\s*$))/gm).filter(slide => slide.trim());
    
    return (
      <div className="space-y-4">
        {slides.map((slide, index) => {
          const lines = slide.split('\n').filter(line => line !== undefined);
          let title = lines[0];
          let slideContent = lines.slice(1);
          
          // Limpiar headers de markdown
          if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '');
          }
          
          // Remover "Diapositiva X:" del título si existe
          title = title.replace(/^(?:Diapositiva|Slide)\s*\d+:?\s*/i, '');
          
          // Filtrar líneas vacías al inicio
          while (slideContent.length > 0 && !slideContent[0].trim()) {
            slideContent = slideContent.slice(1);
          }
          
          return (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center mb-3">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium mr-2">
                  Diapositiva {index + 1}
                </span>
                <h3 className="font-bold text-lg text-gray-800">
                  {formatTextWithBold(title)}
                </h3>
              </div>
              
              <div className="space-y-2">
                {slideContent.map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  
                  if (!trimmedLine) {
                    return <div key={lineIndex} className="h-1"></div>;
                  }
                  
                  // Headers secundarios
                  if (trimmedLine.match(/^#{2,3}\s+/)) {
                    return (
                      <h4 key={lineIndex} className="font-semibold text-md text-gray-800 mt-3 mb-1">
                        {formatTextWithBold(trimmedLine.replace(/^#+\s*/, ''))}
                      </h4>
                    );
                  }
                  
                  // Listas
                  if (trimmedLine.match(/^[-*]\s+/)) {
                    return (
                      <div key={lineIndex} className="flex items-start">
                        <p className="text-sm text-gray-700">
                          {formatTextWithBold(trimmedLine.replace(/^[-*]\s+/, ''))}
                        </p>
                      </div>
                    );
                  }
                  
                  // Listas numeradas
                  if (trimmedLine.match(/^\d+\.\s+/)) {
                    const number = trimmedLine.match(/^(\d+)\./)?.[1];
                    return (
                      <div key={lineIndex} className="flex items-start">
                        <span className="text-purple-600 mr-2 mt-1 font-medium text-sm">{number}.</span>
                        <p className="text-sm text-gray-700">
                          {formatTextWithBold(trimmedLine.replace(/^\d+\.\s+/, ''))}
                        </p>
                      </div>
                    );
                  }
                  
                  // Texto normal
                  return (
                    <p key={lineIndex} className="text-sm text-gray-700">
                      {formatTextWithBold(trimmedLine)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResourceLinks = () => {
    if (!content || type !== 'ejercicios') return null;

    const lines = content.split('\n');
    const links: { text: string; url: string }[] = [];

    lines.forEach(line => {
      if (line.startsWith('*')) {
        const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          const [, , url] = linkMatch;
          links.push({ text: `Contenido ${links.length + 1}`, url });
        }
      }
    });

    return (
      <div className="space-y-4">
        <div className="prose prose-indigo max-w-none">
          <h3 className="text-lg font-semibold mb-4">Recursos Educativos Complementarios</h3>
          <p className="text-sm text-amber-600 mb-4">
            Nota: Algunos enlaces pueden estar desactualizados o no disponibles.
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  let icon;
  let bgColor;
  
  switch (type) {
    case 'guion':
      icon = <FileText className="h-6 w-6 text-blue-600" />;
      bgColor = 'bg-blue-50 border-blue-200';
      break;
    case 'presentacion':
      icon = <Presentation className="h-6 w-6 text-purple-600" />;
      bgColor = 'bg-purple-50 border-purple-200';
      break;
    case 'ejercicios':
      icon = <FileQuestion className="h-6 w-6 text-amber-600" />;
      bgColor = 'bg-amber-50 border-amber-200';
      break;
  }

  return (
    <div className={`rounded-xl border shadow-sm p-6 h-full flex flex-col ${bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="rounded-full bg-white p-2">
            {icon}
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-800">{title}</h3>
        </div>
        {(type === 'presentacion' || type === 'guion') && content && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`text-sm ${type === 'guion' ? 'text-blue-600 hover:text-blue-800' : 'text-purple-600 hover:text-purple-800'}`}
          >
            {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ) : content ? (
        <>
          <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg p-4 mb-4 text-sm text-gray-700">
            {type === 'presentacion' && showPreview ? (
              renderPresentationPreview()
            ) : type === 'guion' && showPreview ? (
              renderScriptPreview()
            ) : type === 'ejercicios' ? (
              renderResourceLinks()
            ) : (
              <div className="whitespace-pre-line">
                {content.split('\n').map((line, index) => (
                  <div key={index}>
                    {formatTextWithBold(line)}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleCopy} 
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {copied ? <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
            
            <button 
              onClick={handleDownload} 
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <Download className="mr-1 h-4 w-4" />
              Descargar
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex justify-center items-center text-gray-500 text-sm">
          El contenido generado aparecerá aquí...
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;