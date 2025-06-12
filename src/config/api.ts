// API configuration for development and production
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  GUION_ENDPOINT: isDevelopment 
    ? '/api/minedaiagente/guion'
    : 'https://minedaiagente-127465468754.europe-west1.run.app/guion',
  
  PRESENTACION_ENDPOINT: isDevelopment 
    ? '/api/minedaiagente/presentacion'
    : 'https://minedaiagente-127465468754.europe-west1.run.app/presentacion',
  
  ENLACES_ENDPOINT: isDevelopment 
    ? '/api/minedaiagente/enlaces'
    : 'https://minedaiagente-127465468754.europe-west1.run.app/enlaces'
};