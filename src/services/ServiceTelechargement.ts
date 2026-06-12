/**
 * Service de gestion du Mode Hors-ligne et des Téléchargements.
 * Permet de simuler le téléchargement de musiques pour une écoute locale
 * et de basculer l'application en mode hors-ligne.
 */

// Liste en mémoire des IDs de chansons téléchargées
let idsChansonsTelechargees: string[] = [];

// État du mode hors-ligne
let modeHorsLigneActif = false;

/**
 * Télécharge virtuellement une chanson en l'ajoutant à la liste locale.
 */
export const telechargerChanson = async (chansonId: string): Promise<void> => {
  return new Promise(resolve => {
    // Simulation d'un temps de téléchargement de 1.5 seconde
    setTimeout(() => {
      if (!idsChansonsTelechargees.includes(chansonId)) {
        idsChansonsTelechargees = [...idsChansonsTelechargees, chansonId];
      }
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
  return Promise.resolve();
};

/**
 * Vérifie si une chanson est téléchargée localement.
 */
export const estChansonTelechargee = (chansonId: string): boolean => {
  return idsChansonsTelechargees.includes(chansonId);
};

/**
 * Active ou désactive le mode hors-ligne global de l'application.
 */
export const activerModeHorsLigne = (actif: boolean): void => {
  modeHorsLigneActif = actif;
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
