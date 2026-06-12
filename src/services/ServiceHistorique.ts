/**
 * Ce service gère l'historique d'écoute de l'utilisateur pendant la session.
 * Il stocke en mémoire les dernières chansons jouées (maximum 20).
 * Les doublons sont automatiquement retirés pour ne garder que l'écoute la plus récente.
 */
import type {Chanson} from '../types';

// Tableau en mémoire qui conserve l'historique d'écoute pendant la session
let historiqueDeEcoute: Chanson[] = [];

// Nombre maximum de chansons conservées dans l'historique
const TAILLE_MAX_HISTORIQUE = 20;

/**
 * Ajoute une chanson au début de l'historique d'écoute.
 * Si la chanson existe déjà dans l'historique, elle est d'abord retirée
 * pour éviter les doublons, puis replacée en tête de liste.
 * L'historique ne dépasse jamais TAILLE_MAX_HISTORIQUE éléments.
 */
export const ajouterAHistorique = (chanson: Chanson): void => {
  // Retirer la chanson si elle existe déjà (éviter les doublons)
  historiqueDeEcoute = historiqueDeEcoute.filter(
    element => element.id !== chanson.id,
  );

  // Ajouter la chanson au début de l'historique (la plus récente en premier)
  historiqueDeEcoute.unshift(chanson);

  // Limiter la taille de l'historique au maximum autorisé
  if (historiqueDeEcoute.length > TAILLE_MAX_HISTORIQUE) {
    historiqueDeEcoute = historiqueDeEcoute.slice(0, TAILLE_MAX_HISTORIQUE);
  }
};

/**
 * Retourne une copie de l'historique d'écoute actuel.
 * La chanson la plus récemment écoutée est en première position.
 */
export const recupererHistorique = (): Chanson[] => {
  return [...historiqueDeEcoute];
};

/**
 * Vide entièrement l'historique d'écoute.
 */
export const viderHistorique = (): void => {
  historiqueDeEcoute = [];
};
