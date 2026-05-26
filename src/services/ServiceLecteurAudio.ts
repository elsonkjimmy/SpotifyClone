/**
 * Ce service gère toute la logique du lecteur audio (Lecture, Pause, Suivant).
 * Il utilise la bibliothèque react-native-track-player.
 */
import TrackPlayer, { Capability, Event, State } from 'react-native-track-player';
import { Share } from 'react-native';

let estDejaInitialise = false;
let modeAleatoireActif = false;
let modeRepetitionActif = false;

// Fonction pour configurer le lecteur au démarrage de l'application
export const initialiserLeLecteurAudio = async () => {
  if (estDejaInitialise) return;

  try {
    await TrackPlayer.setupPlayer();
    
    // Configuration des capacités (ce que le lecteur peut faire)
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    
    estDejaInitialise = true;
  } catch (erreur) {
    console.log('Erreur lors de l\'initialisation du lecteur:', erreur);
  }
};

// Fonction pour ajouter une liste de musiques et commencer la lecture
export const chargerEtJouerUneListeDeMusiques = async (listeDeMusiques: any[]) => {
  await TrackPlayer.reset();
  await TrackPlayer.add(listeDeMusiques);
  await TrackPlayer.play();
};

// Fonction pour mettre en pause ou reprendre la lecture
export const basculerLecturePause = async () => {
  const etatActuel = await TrackPlayer.getState();
  if (etatActuel === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
};

// Fonction pour passer à la musique suivante
export const passerALaMusiqueSuivante = async () => {
  await TrackPlayer.skipToNext();
};

// Fonction pour revenir à la musique précédente
export const revenirALaMusiquePrecedente = async () => {
  await TrackPlayer.skipToPrevious();
};

// Fonction pour activer/désactiver le mode aléatoire
export const basculerModeAleatoire = () => {
  modeAleatoireActif = !modeAleatoireActif;
  return modeAleatoireActif;
};

// Fonction pour activer/désactiver le mode répétition
export const basculerModeRepetition = () => {
  modeRepetitionActif = !modeRepetitionActif;
  return modeRepetitionActif;
};

// Fonction pour obtenir l'état du mode aléatoire
export const obtenirEtatModeAleatoire = () => modeAleatoireActif;

// Fonction pour obtenir l'état du mode répétition
export const obtenirEtatModeRepetition = () => modeRepetitionActif;

// Fonction pour partager une musique
export const partagerLaMusique = async (titre: string, artiste: string) => {
  try {
    await Share.share({
      message: `Écoute "${titre}" de ${artiste} sur Spotify Clone!`,
      title: 'Partager la musique',
    });
  } catch (erreur: any) {
    console.log('Erreur lors du partage:', erreur);
  }
};
