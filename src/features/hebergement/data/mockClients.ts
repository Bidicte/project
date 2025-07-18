// ===== src/data/mockClients.ts =====
// ===== src/data/mockClients.ts =====
import type { Client } from '../types/client';

export const mockClients: Client[] = [
  {
    id: 1,
    nom: 'Paul',
    prenom: 'De la gloire',
    email: 'Paul@gmail.com',
    telephone: '000000000',
    pays: 'Côte d\'ivoire',
    adresse: 'Abidjan, Angré',
    type: 'regulier',
    statut: 'actif',
    dateCreation: '2024-01-15',
    derniereConnexion: '2024-07-03'
  },
  {
    id: 2,
    nom: 'Marie',
    prenom: 'Kouassi',
    email: 'marie.kouassi@gmail.com',
    telephone: '07 08 09 10 11',
    pays: 'Côte d\'ivoire',
    adresse: 'Abidjan, Cocody',
    type: 'business',
    statut: 'actif',
    dateCreation: '2024-02-20',
    derniereConnexion: '2024-07-02'
  },
  {
    id: 3,
    nom: 'Koffi',
    prenom: 'Jean Baptiste',
    email: 'koffi.jb@yahoo.fr',
    telephone: '05 06 07 08 09',
    pays: 'Côte d\'ivoire',
    adresse: 'Yamoussoukro, Centre',
    type: 'regulier',
    statut: 'inactif',
    dateCreation: '2024-03-10',
    derniereConnexion: '2024-06-15'
  }
];