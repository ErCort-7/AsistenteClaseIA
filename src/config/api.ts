// API configuration for development and production
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  GUION_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/guion',
  
  PRESENTACION_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/presentacion',
  
  ENLACES_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/enlaces',
  
  ALUMNO_GUIA_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/alumnoguia'
};

// API utility functions
export const makeApiRequest = async (url: string, body: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const handleApiError = (error: any, context: string): string => {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return `Servicio temporalmente no disponible. El servidor de ${context} no está respondiendo. Por favor, intente más tarde.`;
    }
    return `Error en ${context}: ${error.message}`;
  }
  
  return `Error desconocido en ${context}. Por favor, intente nuevamente.`;
};