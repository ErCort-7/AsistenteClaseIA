import React, { useState, useEffect } from 'react';
import TopicForm from '../components/Generator/TopicForm';
import ContentDisplay from '../components/Generator/ContentDisplay';
import { API_CONFIG, makeApiRequest, handleApiError } from '../config/api';

interface GeneratorProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'generate' | 'student-dashboard' | 'student-guide') => void;
}

const formatPrompt = (
  tema: string,
  materia: string,
  gradoAcademico: string,
  duracion: string,
  tipoClase: 'teorica' | 'practica'
) => {
  // Convertir el grado académico al formato esperado
  const nivelEducativo = gradoAcademico.replace('-', 'º de ');
  
  return `Tema: ${tema}
Nivel: ${nivelEducativo}
Tipo de clase: ${tipoClase === 'teorica' ? 'Teórica' : 'Práctica'}
Duración: ${duracion} minutos

Ejemplo: genera un guion de clase completo para una clase ${tipoClase === 'teorica' ? 'teórica' : 'práctica'} sobre ${tema}, adaptado al nivel de ${nivelEducativo}.

El guion debe incluir definiciones detalladas, contenidos desarrollados y explicaciones claras y adecuadas para ese nivel.

Además, debe contener la estructura completa de la clase, incluyendo objetivos, desarrollo de contenidos, ejemplos, actividades y cierre.

El contenido debe estar pensado para cubrir el tiempo de duración especificada (${duracion} minutos),

y las actividades deben ser empáticas al tipo de clase (${tipoClase === 'teorica' ? 'teórica' : 'práctica'}), con un enfoque pedagógico que facilite la comprensión del tema.`;
};

const Generator: React.FC<GeneratorProps> = ({ onNavigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{
    guion: string | null;
    presentacion: string | null;
    ejercicios: string | null;
  }>({
    guion: null,
    presentacion: null,
    ejercicios: null,
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
      const prompt = formatPrompt(tema, materia, gradoAcademico, duracion, tipoClase);
      
      // Generate content sequentially to avoid overwhelming the server
      const guionContent = await generateContent(
        API_CONFIG.GUION_ENDPOINT, 
        prompt, 
        'generación de guión'
      );
      
      setGeneratedContent(prev => ({ ...prev, guion: guionContent }));

      const presentacionContent = await generateContent(
        API_CONFIG.PRESENTACION_ENDPOINT, 
        prompt, 
        'generación de presentación'
      );
      
      setGeneratedContent(prev => ({ ...prev, presentacion: presentacionContent }));

      const enlacesContent = await generateContent(
        API_CONFIG.ENLACES_ENDPOINT, 
        `Tema: ${tema}`, 
        'generación de recursos complementarios'
      );
      
      const formattedEnlacesContent = enlacesContent.startsWith('Error') 
        ? enlacesContent 
        : `RECURSOS EDUCATIVOS COMPLEMENTARIOS\n\nEnlaces recomendados para profundizar en el tema:\n\n${enlacesContent}`;
      
      setGeneratedContent(prev => ({ ...prev, ejercicios: formattedEnlacesContent }));

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

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Crear Contenido</h1>
        
        <div className="mb-8">
          <TopicForm onGenerate={handleGenerate} isLoading={isGenerating} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContentDisplay
            title="Guión de Clase"
            content={generatedContent.guion}
            type="guion"
            format="docx"
            isLoading={isGenerating}
          />
          
          <ContentDisplay
            title="Presentación"
            content={generatedContent.presentacion}
            type="presentacion"
            format="pptx"
            isLoading={isGenerating}
          />
          
          <ContentDisplay
            title="Material Complementario"
            content={generatedContent.ejercicios}
            type="ejercicios"
            format="pdf"
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default Generator;