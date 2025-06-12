import React, { useState, useEffect } from 'react';
import TopicForm from '../components/Generator/TopicForm';
import ContentDisplay from '../components/Generator/ContentDisplay';
import { API_CONFIG } from '../config/api';

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
      
      // Fetch all content in parallel
      const [guionResponse, presentacionResponse, enlacesResponse] = await Promise.all([
        fetch(API_CONFIG.GUION_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }),
        fetch(API_CONFIG.PRESENTACION_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }),
        fetch(API_CONFIG.ENLACES_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: `Tema: ${tema}` }),
        })
      ]);

      // Handle each response independently
      let guionContent = null;
      let presentacionContent = null;
      let ejerciciosContent = null;

      // Process Guion response
      if (guionResponse.ok) {
        try {
          const guionData = await guionResponse.json();
          if (guionData.response) {
            guionContent = guionData.response;
          } else {
            guionContent = 'Error: Respuesta del servidor incompleta para el guión.';
          }
        } catch (error) {
          console.error('Error parsing guion response:', error);
          guionContent = 'Error: No se pudo procesar la respuesta del guión.';
        }
      } else {
        console.error('Guion Response Status:', guionResponse.status);
        try {
          const errorData = await guionResponse.text();
          console.error('Guion Response Error:', errorData);
        } catch (parseError) {
          console.error('Error parsing guion error response:', parseError);
        }
        guionContent = `Error: No se pudo generar el guión (${guionResponse.status}). Por favor, intente nuevamente.`;
      }

      // Process Presentacion response
      if (presentacionResponse.ok) {
        try {
          const presentacionData = await presentacionResponse.json();
          if (presentacionData.response) {
            presentacionContent = presentacionData.response;
          } else {
            presentacionContent = 'Error: Respuesta del servidor incompleta para la presentación.';
          }
        } catch (error) {
          console.error('Error parsing presentacion response:', error);
          presentacionContent = 'Error: No se pudo procesar la respuesta de la presentación.';
        }
      } else {
        console.error('Presentacion Response Status:', presentacionResponse.status);
        try {
          const errorData = await presentacionResponse.text();
          console.error('Presentacion Response Error:', errorData);
        } catch (parseError) {
          console.error('Error parsing presentacion error response:', parseError);
        }
        presentacionContent = `Error: No se pudo generar la presentación (${presentacionResponse.status}). Por favor, intente nuevamente.`;
      }

      // Process Enlaces response
      if (enlacesResponse.ok) {
        try {
          const enlacesData = await enlacesResponse.json();
          if (enlacesData.response) {
            ejerciciosContent = `RECURSOS EDUCATIVOS COMPLEMENTARIOS\n\nEnlaces recomendados para profundizar en el tema:\n\n${enlacesData.response}`;
          } else {
            ejerciciosContent = 'Error: Respuesta del servidor incompleta para los recursos complementarios.';
          }
        } catch (error) {
          console.error('Error parsing enlaces response:', error);
          ejerciciosContent = 'Error: No se pudo procesar la respuesta de los recursos complementarios.';
        }
      } else {
        console.error('Enlaces Response Status:', enlacesResponse.status);
        try {
          const errorData = await enlacesResponse.text();
          console.error('Enlaces Response Error:', errorData);
        } catch (parseError) {
          console.error('Error parsing enlaces error response:', parseError);
        }
        ejerciciosContent = `Error: No se pudieron generar los recursos complementarios (${enlacesResponse.status}). Este servicio podría estar temporalmente no disponible.`;
      }
      
      setGeneratedContent({
        guion: guionContent,
        presentacion: presentacionContent,
        ejercicios: ejerciciosContent,
      });
    } catch (error) {
      console.error('Error completo al generar contenido:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al generar el contenido';
        
      setGeneratedContent({
        guion: `Error de conexión: ${errorMessage}. Por favor, verifique su conexión a internet e intente nuevamente.`,
        presentacion: `Error de conexión: ${errorMessage}. Por favor, verifique su conexión a internet e intente nuevamente.`,
        ejercicios: `Error de conexión: ${errorMessage}. Por favor, verifique su conexión a internet e intente nuevamente.`,
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