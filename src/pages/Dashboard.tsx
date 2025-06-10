import React from 'react';
import HistoryCard from '../components/Dashboard/HistoryCard';
import StatisticsCard from '../components/Dashboard/StatisticsCard';
import { useNavigate } from '../hooks/useNavigate';
import { Users, GraduationCap, BookOpen, FileText } from 'lucide-react';

const EXAMPLE_CLASSES = [
  {
    id: '1',
    topic: 'Proceso de Fotosíntesis',
    subject: 'Ciencias Naturales',
    gradeLevel: '2º de Secundaria',
    date: '2025-04-01T10:30:00Z',
  },
  {
    id: '2',
    topic: 'Segunda Guerra Mundial: Causas y Efectos',
    subject: 'Historia',
    gradeLevel: '3º de Bachillerato',
    date: '2025-03-28T14:15:00Z',
  },
  {
    id: '3',
    topic: 'Introducción a las Fracciones',
    subject: 'Matemáticas',
    gradeLevel: '4º de Primaria',
    date: '2025-03-25T09:00:00Z',
  },
];

const Dashboard: React.FC = () => {
  const { navigateTo } = useNavigate();
  
  const handleSelectItem = (id: string) => {
    const selectedClass = EXAMPLE_CLASSES.find(item => item.id === id);
    if (selectedClass) {
      navigateTo('/generate');
      // Simulate clicking the generate button with the example class data
      const event = new CustomEvent('generateExample', {
        detail: {
          tema: selectedClass.topic,
          materia: selectedClass.subject.toLowerCase(),
          gradoAcademico: selectedClass.gradeLevel.toLowerCase().replace('º de ', '-'),
          duracion: '60',
          tipoClase: 'teorica'
        }
      });
      document.dispatchEvent(event);
    }
  };
  
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a <span className="text-[#1a365d]">EduAsistent</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tu plataforma integral para crear contenido educativo de calidad
          </p>
          
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div 
              onClick={() => navigateTo('/dashboard')}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">Para Docentes</h3>
              <p className="text-blue-700 mb-4">
                Crea guiones de clase, presentaciones y material complementario
              </p>
              <div className="flex justify-center space-x-4 text-sm text-blue-600">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Guiones
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Presentaciones
                </span>
              </div>
            </div>
            
            <div 
              onClick={() => navigateTo('/student-dashboard')}
              className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-3">Para Estudiantes</h3>
              <p className="text-purple-700 mb-4">
                Genera guías de estudio personalizadas para mejorar tu aprendizaje
              </p>
              <div className="flex justify-center space-x-4 text-sm text-purple-600">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Guías PDF
                </span>
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Personalizadas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Dashboard Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Panel de Docentes</h2>
            <button 
              onClick={() => navigateTo('/generate')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
            >
              Crear Nuevo Contenido
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HistoryCard items={EXAMPLE_CLASSES} onSelectItem={handleSelectItem} />
            </div>
            
            <div>
              <StatisticsCard totalClasses={12} totalPresentations={8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;