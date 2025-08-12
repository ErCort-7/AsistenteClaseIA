import React, { useState } from 'react';
import { Download, Copy, CheckCircle2, BookOpen, FileText, Eye, EyeOff } from 'lucide-react';
import { generateStudyGuidePdf } from '../../utils/studyGuideGenerator';

interface StudyGuideDisplayProps {
  title: string;
  content: string | null;
  isLoading: boolean;
}

const StudyGuideDisplay: React.FC<StudyGuideDisplayProps> = ({ title, content, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!content) return;
    
    const filename = title.toLowerCase().replace(/\s+/g, '-').replace('guía-de-estudio:', '').trim();
    
    try {
      await generateStudyGuidePdf(content, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generando el PDF. Por favor, intenta nuevamente.');
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

  const parseStudyGuide = () => {
    if (!content) return null;

    // Procesar todo el contenido como un solo bloque continuo
    const lines = content.split('\n');
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="prose prose-lg max-w-none">
          {lines.map((line, index) => {
            const cleanLine = line.trim();
            
            // Líneas vacías - agregar espacio
            if (!cleanLine) {
              return <div key={index} className="h-4"></div>;
            }
            
            // Limpiar símbolos de markdown y numeración
            let processedLine = cleanLine
              .replace(/^#+\s*/, '') // Quitar # de headers
              .replace(/^\d+\.\s*/, '') // Quitar numeración
              .replace(/^[-*•]\s*/, '') // Quitar viñetas
              .replace(/\*\*(.*?)\*\*/g, '$1'); // Quitar asteriscos de negritas
            
            // Si la línea parece ser un título (corta y sin puntos al final)
            if (processedLine.length < 80 && !processedLine.endsWith('.') && !processedLine.includes(':')) {
              return (
                <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-4 first:mt-0">
                  {processedLine}
                </h3>
              );
            }
            
            // Si contiene dos puntos, podría ser una definición
            if (processedLine.includes(':') && processedLine.length < 150) {
              const [label, ...rest] = processedLine.split(':');
              return (
                <div key={index} className="mb-3">
                  <span className="font-semibold text-indigo-700">{label.trim()}:</span>
                  <span className="text-gray-700 ml-1">{rest.join(':').trim()}</span>
                </div>
              );
            }
            
            // Texto normal
            return (
              <p key={index} className="text-gray-700 leading-relaxed mb-3">
                {processedLine}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-2">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="ml-3 text-xl font-bold text-white">{title}</h2>
          </div>
          {content && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-3 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors duration-200"
            >
              {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">Generando tu guía de estudio personalizada...</p>
            <p className="mt-2 text-sm text-gray-500">Esto puede tomar unos momentos</p>
          </div>
        ) : content ? (
          <>
            {showPreview ? (
              <div className="mb-6">
                {parseStudyGuide()}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-h-96 overflow-auto">
                <div className="whitespace-pre-line text-sm text-gray-700 font-mono">
                  {content.split('\n').map((line, index) => (
                    <div key={index}>
                      {formatTextWithBold(line)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button 
                onClick={handleCopy} 
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
              >
                {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? '¡Copiado!' : 'Copiar Texto'}
              </button>
              
              <button 
                onClick={handleDownload} 
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar como PDF
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tu guía de estudio aparecerá aquí</h3>
            <p className="text-gray-500">Completa el formulario y genera tu material de estudio personalizado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGuideDisplay;