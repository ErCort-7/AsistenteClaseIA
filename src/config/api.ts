// API configuration for development and production
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  GUION_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/guion',
  
  PRESENTACION_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/presentacion',
  
  ENLACES_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/enlaces',
  
  ALUMNO_GUIA_ENDPOINT: 'https://educacion-ia-438857114479.us-central1.run.app/alumnoguia'
};

// API utility functions
export const makeApiRequest = async (url: string, body: any, timeout: number = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La solicitud ha tardado demasiado tiempo. Por favor, intente nuevamente.');
    }
    throw error;
  }
};

export const handleApiError = (error: any, context: string): string => {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return `Servicio temporalmente no disponible. El servidor de ${context} no está respondiendo. Por favor, intente más tarde.`;
    }
    if (error.message.includes('timeout') || error.message.includes('tardado demasiado')) {
      return `Tiempo de espera agotado para ${context}. El servidor está tardando más de lo esperado. Por favor, intente nuevamente.`;
    }
    return `Error en ${context}: ${error.message}`;
  }
  
  return `Error desconocido en ${context}. Por favor, intente nuevamente.`;
};