/**
 * Service de gestion du Mode Hors-ligne et des Téléchargements.
 * Permet de simuler le téléchargement de musiques pour une écoute locale
 * et de basculer l'application en mode hors-ligne.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type {Chanson} from '../types';

const CLE_TELECHARGEMENTS_IDS = 'telechargements';
const CLE_TELECHARGEMENTS_CHANSONS = 'telechargements_chansons';

// Liste en mémoire des IDs de chansons téléchargées
let idsChansonsTelechargees: string[] = [];
let chansonsTelechargeesParId: Record<string, Chanson> = {};

// Charger les téléchargements au démarrage
AsyncStorage.getItem(CLE_TELECHARGEMENTS_IDS).then(data => {
  if (data) idsChansonsTelechargees = JSON.parse(data);
});
AsyncStorage.getItem(CLE_TELECHARGEMENTS_CHANSONS).then(data => {
  if (data) chansonsTelechargeesParId = JSON.parse(data);
});

// État du mode hors-ligne
let modeHorsLigneActif = false;

// Écouteur réseau pour basculer automatiquement
NetInfo.addEventListener(state => {
  if (state.isConnected === false) {
    activerModeHorsLigne(true);
  }
});

/**
 * Télécharge virtuellement une chanson en l'ajoutant à la liste locale.
 */
const sauvegarderEtatTelechargements = async () => {
  await AsyncStorage.multiSet([
    [CLE_TELECHARGEMENTS_IDS, JSON.stringify(idsChansonsTelechargees)],
    [CLE_TELECHARGEMENTS_CHANSONS, JSON.stringify(chansonsTelechargeesParId)],
  ]);
};

export const telechargerChanson = async (
  chanson: string | Chanson,
): Promise<void> => {
  const chansonId = typeof chanson === 'string' ? chanson : chanson.id;
  return new Promise(resolve => {
    // Simulation d'un temps de téléchargement de 1.5 seconde
    setTimeout(async () => {
      if (!idsChansonsTelechargees.includes(chansonId)) {
        idsChansonsTelechargees = [...idsChansonsTelechargees, chansonId];
      }
      if (typeof chanson !== 'string') {
        chansonsTelechargeesParId[chansonId] = chanson;
      }
      await sauvegarderEtatTelechargements();
      resolve();
    }, 1500);
  });
};

/**
 * Supprime une chanson de la liste des téléchargements.
 */
export const supprimerChansonTelechargee = async (
  chansonId: string,
): Promise<void> => {
  idsChansonsTelechargees = idsChansonsTelechargees.filter(
    id => id !== chansonId,
  );
  delete chansonsTelechargeesParId[chansonId];
  await sauvegarderEtatTelechargements();
  return Promise.resolve();
};

/**
 * Vérifie si une chanson est téléchargée localement.
 */
export const estChansonTelechargee = (chansonId: string): boolean => {
  return idsChansonsTelechargees.includes(chansonId);
};

// Liste d'abonnés pour notifier les changements d'état
const auditeurs: Array<(actif: boolean) => void> = [];

/**
 * Active ou désactive le mode hors-ligne global de l'application.
 */
export const activerModeHorsLigne = (actif: boolean): void => {
  modeHorsLigneActif = actif;
  auditeurs.forEach(listener => listener(actif));
};

/**
 * Permet de s'abonner aux changements du mode hors-ligne.
 */
export const sAbonnerAuModeHorsLigne = (listener: (actif: boolean) => void) => {
  auditeurs.push(listener);
  return () => {
    const index = auditeurs.indexOf(listener);
    if (index > -1) auditeurs.splice(index, 1);
  };
};

/**
 * Retourne l'état actuel du mode hors-ligne.
 */
export const obtenirModeHorsLigne = (): boolean => {
  return modeHorsLigneActif;
};

/**
 * Récupère tous les identifiants des chansons téléchargées.
 */
export const recupererTousLesTelechargements = (): string[] => {
  return [...idsChansonsTelechargees];
};

/**
 * Retourne les chansons téléchargées avec leurs métadonnées (cache local).
 */
export const recupererChansonsTelechargees = (): Chanson[] => {
  return Object.values(chansonsTelechargeesParId);
};
