export interface ProductConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  basePath: string;
  thumbnail: string;
  features: string[];
  requiredSubscription: string;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'hebergement',
    name: 'CHK WEBSERVICE',
    description: 'Gestion complète pour complexes hôteliers',
    icon: 'hotel',
    color: '#1976D2',
    basePath: '/hebergement',
    thumbnail: '/images/chk-thumbnail.png',
    features: ['Hébergement', 'Gestion de stock', 'Caisse'],
    requiredSubscription: 'chk_premium'
  },
  {
    id: 'erp-enterprise',
    name: 'ERP Enterprise',
    description: 'Solution ERP complète pour grandes entreprises',
    icon: 'business',
    color: '#388E3C',
    basePath: '/erp',
    thumbnail: '/images/erp-thumbnail.png',
    features: ['Comptabilité', 'RH', 'CRM', 'Supply Chain'],
    requiredSubscription: 'erp_professional'
  },
  // ... autres produits
];