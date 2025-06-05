import React from 'react';
import { Sparkles, Menu, X, HelpCircle } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';
import { useNavigate } from '../hooks/useNavigate';

const Header: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useNavigation();
  const { navigateTo } = useNavigate();
  const [showHelpMenu, setShowHelpMenu] = React.useState(false);

  const helpItems = [
    { title: 'Guía de Creación', description: 'Aprende a crear contenido efectivo' },
    { title: 'Preguntas Frecuentes', description: 'Resolvemos tus dudas comunes' },
    { title: 'Contacto', description: 'Escríbenos a support@eduasistent.com' }
  ];

  const handleLogoClick = () => {
    navigateTo('/');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={handleLogoClick}
          >
            <Sparkles className="h-8 w-8 text-[#1a365d]" />
            <span className="ml-2 text-xl font-semibold text-[#1a365d]">EduAsistent</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#" 
              onClick={handleHomeClick}
              className="text-gray-700 hover:text-[#1a365d] px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Inicio
            </a>
            <div className="relative">
              <button
                onClick={() => setShowHelpMenu(!showHelpMenu)}
                className="text-gray-700 hover:text-[#1a365d] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
              >
                Ayuda <HelpCircle className="ml-1 h-4 w-4" />
              </button>
              
              {showHelpMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
                  {helpItems.map((item, index) => (
                    <a
                      key={index}
                      href="#"
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>
          
          <button 
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a 
              href="#" 
              onClick={handleHomeClick}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-[#1a365d]/10 hover:text-[#1a365d] transition-colors duration-200"
            >
              Inicio
            </a>
            {helpItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="block px-3 py-2 rounded-md"
              >
                <div className="text-base font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;