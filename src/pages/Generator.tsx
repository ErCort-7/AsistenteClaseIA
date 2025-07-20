import React, { useState, useEffect } from 'react';
import TopicForm from '../components/Generator/TopicForm';
import { FileText, Presentation, Link, BookOpen } from 'lucide-react';
import { API_CONFIG, makeApiRequest, handleApiError } from '../config/api';
import { generateDocx, generatePptx, generatePdf } from '../utils/documentGenerators';

interface GeneratorProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'generate' | 'student-dashboard' | 'student-guide') => void;
}

type TabType = 'guion' | 'presentacion' | 'complementario';

const formatPrompt = (
  tema: string,
  materia: string,
  gradoAcademico: string,
  duracion: string,
  tipoClase: 'teorica' | 'practica'
) => {
  // Convertir el grado académico al formato esperado por la API
  const nivelEducativo = gradoAcademico.includes('-') 
    ? gradoAcademico.replace('-', 'º de ').replace(/(\d+)º de (.+)/, '$2')
    : gradoAcademico;
  
  // Convertir materia al formato legible
  const materiaFormateada = materia.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
  
  // Convertir tipo de clase
  const tipoClaseFormateado = tipoClase === 'teorica' ? 'Teórica' : 'Práctica';
  
  return `Tema: ${tema}\nNivel: ${nivelEducativo}\nTipo de clase: ${tipoClaseFormateado}\nDuración: ${duracion} minutos\nMateria: ${materiaFormateada}`;
};

const Generator: React.FC<GeneratorProps> = ({ onNavigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('guion');
  const [currentTopic, setCurrentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{
    guion: string | null;
    presentacion: string | null;
    ejercicios: string | null;
  }>({
    guion: null,
    presentacion: null,
    ejercicios: null
  });

  useEffect(() => {
    const handleExampleGeneration = (event: CustomEvent) => {
      const { tema, materia, gradoAcademico, duracion, tipoClase } = event.detail;
      handleGenerate(tema, materia, gradoAcademico, duracion, tipoClase);
    };

    document.addEventListener('generateExample', handleExampleGeneration as EventListener);

    return () => {
      document.removeEventListener('generateExample', handleExampleGeneration as EventListener);
    };
  }, []);

  const generateContent = async (endpoint: string, prompt: any, contentType: string) => {
    try {
      const response = await makeApiRequest(endpoint, { prompt });

      if (!response.ok) {
        const statusText = response.statusText || 'Error del servidor';
        throw new Error(`Error ${response.status}: ${statusText}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Respuesta del servidor incompleta');
      }

      return data.response;
    } catch (error) {
      return handleApiError(error, contentType);
    }
  };

  const handleGenerate = async (
    tema: string,
    materia: string,
    gradoAcademico: string,
    duracion: string,
    tipoClase: 'teorica' | 'practica'
  ) => {
    setIsGenerating(true);
    setCurrentTopic(tema);
    setGeneratedContent({
      guion: null,
      presentacion: null,
      ejercicios: null,
    });

    try {
      const basePrompt = formatPrompt(tema, materia, gradoAcademico, duracion, tipoClase);
      
      // Generate content sequentially to avoid overwhelming the server
      const guionContent = await generateContent(
        API_CONFIG.GUION_ENDPOINT, 
        basePrompt, 
        'generación de guión'
      );
      
      setGeneratedContent(prev => ({ ...prev, guion: guionContent }));

      const presentacionContent = await generateContent(
        API_CONFIG.PRESENTACION_ENDPOINT, 
        basePrompt, 
        'generación de presentación'
      );
      
      setGeneratedContent(prev => ({ ...prev, presentacion: presentacionContent }));

      // Para enlaces solo enviamos el tema
      const enlacesContent = await generateContent(
        API_CONFIG.ENLACES_ENDPOINT, 
        `Tema: ${tema}`,
        'generación de recursos complementarios'
      );
      
      setGeneratedContent(prev => ({ ...prev, ejercicios: enlacesContent }));

    } catch (error) {
      console.error('Error completo al generar contenido:', error);
      
      const errorMessage = handleApiError(error, 'generación de contenido');
        
      setGeneratedContent({
        guion: errorMessage,
        presentacion: errorMessage,
        ejercicios: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
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
    const content = generatedContent.guion;
    if (!content) return null;

    const sections = content.split(/(?=^#{1,3}\s+|\n\s*\n(?=[A-ZÁÉÍÓÚÑ][^.\n]*:?\s*$))/gm).filter(section => section.trim());
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          const lines = section.split('\n');
          let title = lines[0];
          let sectionContent = lines.slice(1);
          
          if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '');
          }
          
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
                  
                  if (!trimmedLine) {
                    return <div key={lineIndex} className="h-2"></div>;
                  }
                  
                  if (trimmedLine.match(/^#{2,3}\s+/)) {
                    return (
                      <h4 key={lineIndex} className="text-md font-semibold text-gray-800 mt-4 mb-2">
                        {formatTextWithBold(trimmedLine.replace(/^#+\s*/, ''))}
                      </h4>
                    );
                  }
                  
                  if (trimmedLine.match(/^[-*]\s+/)) {
                    return (
                      <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-indigo-600 mr-2 mt-1">•</span>
                        <p className="text-gray-700 leading-relaxed">
                          {formatTextWithBold(trimmedLine.replace(/^[-*]\s+/, ''))}
                        </p>
                      </div>
                    );
                  }
                  
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
    const content = generatedContent.presentacion;
    if (!content) return null;

    const slides = content.split(/(?=^#{1,2}\s+|\n\s*(?:Diapositiva|Slide)\s*\d+|\n\s*\n(?=[A-ZÁÉÍÓÚÑ][^.\n]*:?\s*$))/gm).filter(slide => slide.trim());
    
    return (
      <div className="space-y-4">
        {slides.map((slide, index) => {
          const lines = slide.split('\n').filter(line => line !== undefined);
          let title = lines[0];
          let slideContent = lines.slice(1);
          
          if (title.startsWith('#')) {
            title = title.replace(/^#+\s*/, '');
          }
          
          title = title.replace(/^(?:Diapositiva|Slide)\s*\d+:?\s*/i, '');
          
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
                  
                  if (trimmedLine.match(/^#{2,3}\s+/)) {
                    return (
                      <h4 key={lineIndex} className="font-semibold text-md text-gray-800 mt-3 mb-1">
                        {formatTextWithBold(trimmedLine.replace(/^#+\s*/, ''))}
                      </h4>
                    );
                  }
                  
                  if (trimmedLine.match(/^[-*]\s+/)) {
                    return (
                      <div key={lineIndex} className="flex items-start">
                        <span className="text-purple-600 mr-2 mt-1">•</span>
                        <p className="text-sm text-gray-700">
                          {formatTextWithBold(trimmedLine.replace(/^[-*]\s+/, ''))}
                        </p>
                      </div>
                    );
                  }
                  
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
    const content = generatedContent.ejercicios;
    if (!content) return null;

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

  const handleDownload = async (type: TabType) => {
    let content = '';
    let filename = '';
    
    switch (type) {
      case 'guion':
        content = generatedContent.guion || '';
        filename = `guion-${currentTopic.toLowerCase().replace(/\s+/g, '-')}`;
        await generateDocx(content, filename);
        break;
      case 'presentacion':
        content = generatedContent.presentacion || '';
        filename = `presentacion-${currentTopic.toLowerCase().replace(/\s+/g, '-')}`;
        await generatePptx(content, filename);
        break;
      case 'complementario':
        content = generatedContent.ejercicios || '';
        filename = `recursos-${currentTopic.toLowerCase().replace(/\s+/g, '-')}`;
        await generatePdf(content, filename);
        break;
    }
  };

  const handleCopy = (type: TabType) => {
    let content = '';
    
    switch (type) {
      case 'guion':
        content = generatedContent.guion || '';
        break;
      case 'presentacion':
        content = generatedContent.presentacion || '';
        break;
      case 'complementario':
        content = generatedContent.ejercicios || '';
        break;
    }
    
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'guion':
        return renderScriptPreview();
      case 'presentacion':
        return renderPresentationPreview();
      case 'complementario':
        return renderResourceLinks();
      default:
        return null;
    }
  };

  const getTabData = (type: TabType) => {
    switch (type) {
      case 'guion':
        return {
          content: generatedContent.guion,
          icon: <FileText className="h-5 w-5" />,
          title: 'Guión de la Clase',
          color: 'blue'
        };
      case 'presentacion':
        return {
          content: generatedContent.presentacion,
          icon: <Presentation className="h-5 w-5" />,
          title: 'Presentaciones',
          color: 'purple'
        };
      case 'complementario':
        return {
          content: generatedContent.ejercicios,
          icon: <Link className="h-5 w-5" />,
          title: 'Contenido Complementario',
          color: 'amber'
        };
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Crear Contenido</h1>
        
        <div className="mb-8">
          <TopicForm onGenerate={handleGenerate} isLoading={isGenerating} />
        </div>
        
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex" role="tablist">
              {(['guion', 'presentacion', 'complementario'] as TabType[]).map((tab) => {
                const tabData = getTabData(tab);
                const isActive = activeTab === tab;
                const hasContent = tabData.content !== null;
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                      isActive
                        ? `border-${tabData.color}-500 text-${tabData.color}-600 bg-${tabData.color}-50`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <div className={`mr-2 ${isActive ? `text-${tabData.color}-600` : 'text-gray-400'}`}>
                      {tabData.icon}
                    </div>
                    {tabData.title}
                    {hasContent && (
                      <div className={`ml-2 w-2 h-2 rounded-full ${
                        isActive ? `bg-${tabData.color}-500` : 'bg-green-500'
                      }`}></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" />
                </div>
                <p className="mt-4 text-gray-600 font-medium">Generando contenido educativo...</p>
                <p className="mt-2 text-sm text-gray-500">Esto puede tomar unos momentos</p>
              </div>
            ) : getTabData(activeTab).content ? (
              <>
                <div className="mb-6">
                  {getTabContent()}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleCopy(activeTab)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar Texto
                  </button>
                  
                  <button 
                    onClick={() => handleDownload(activeTab)}
                    className={`flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg ${
                      activeTab === 'guion' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                        : activeTab === 'presentacion'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                    }`}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar {
                      activeTab === 'guion' ? 'DOCX' :
                      activeTab === 'presentacion' ? 'PPTX' : 'PDF'
                    }
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {getTabData(activeTab).icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {getTabData(activeTab).title}
                </h3>
                <p className="text-gray-500">
                  El contenido aparecerá aquí una vez que completes el formulario y generes el material educativo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;