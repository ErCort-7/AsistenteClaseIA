import React, { useState, useEffect } from 'react';
import StudentForm from '../components/Student/StudentForm';
import StudyGuideDisplay from '../components/Student/StudyGuideDisplay';
import { API_CONFIG, makeApiRequest, handleApiError } from '../config/api';

interface StudentGuideProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'generate' | 'student-dashboard' | 'student-guide') => void;
}

const formatStudentPrompt = (
  tema: string,
  materia: string,
  gradoAcademico: string,
  duracion: string,
  tipoEstudio: 'repaso' | 'examen' | 'comprension'
) => {
  // Convertir el grado académico al formato esperado por la API
  const nivelEducativo = gradoAcademico.includes('-') 
    ? gradoAcademico.replace('-', 'º de ').replace(/(\d+)º de (.+)/, '$2')
    : gradoAcademico;
  
  // Convertir materia al formato legible
  const materiaFormateada = materia.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
  
  // Convertir tipo de estudio
  const tipoEstudioFormateado = tipoEstudio === 'repaso' ? 'Repaso' : 
                               tipoEstudio === 'examen' ? 'Examen' : 'Teórica';
  
  return `Tema: ${tema}\nNivel: ${nivelEducativo}\nTipo de clase: ${tipoEstudioFormateado}\nMateria: ${materiaFormateada}`;
};

const StudentGuide: React.FC<StudentGuideProps> = ({ onNavigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [generatedGuide, setGeneratedGuide] = useState<string | null>(null);

  useEffect(() => {
    const handleExampleGeneration = (event: CustomEvent) => {
      const { tema, materia, gradoAcademico, duracion, tipoEstudio } = event.detail;
      handleGenerate(tema, materia, gradoAcademico, duracion, tipoEstudio);
    };

    document.addEventListener('generateStudentExample', handleExampleGeneration as EventListener);

    return () => {
      document.removeEventListener('generateStudentExample', handleExampleGeneration as EventListener);
    };
  }, []);

  const handleGenerate = async (
    tema: string,
    materia: string,
    gradoAcademico: string,
    duracion: string,
    tipoEstudio: 'repaso' | 'examen' | 'comprension'
  ) => {
    setIsGenerating(true);
    setCurrentTopic(tema);
    setGeneratedGuide(null);

    try {
      const prompt = formatStudentPrompt(tema, materia, gradoAcademico, duracion, tipoEstudio);
      
      // Usar el nuevo endpoint específico para guías de estudiante
      const response = await makeApiRequest(API_CONFIG.ALUMNO_GUIA_ENDPOINT, { prompt });

      if (!response.ok) {
        const statusText = response.statusText || 'Error del servidor';
        throw new Error(`Error ${response.status}: ${statusText}`);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error('Respuesta del servidor incompleta o inválida');
      }
      
      setGeneratedGuide(data.response);
    } catch (error) {
      console.error('Error completo al generar guía de estudio:', error);
      
      const errorMessage = handleApiError(error, 'generación de guía de estudio');
      setGeneratedGuide(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guías de Estudio Personalizadas</h1>
          <p className="text-lg text-gray-600">Genera material de estudio adaptado a tu nivel y necesidades</p>
        </div>
        
        <div className="mb-8">
          <StudentForm onGenerate={handleGenerate} isLoading={isGenerating} />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <StudyGuideDisplay
            title={currentTopic ? `Guía de Estudio: ${currentTopic}` : 'Guía de Estudio'}
            content={generatedGuide}
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentGuide;