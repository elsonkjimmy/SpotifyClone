/**
 * Ce service gère toute la logique du lecteur audio (Lecture, Pause, Suivant).
 * Il utilise la bibliothèque react-native-track-player.
 */
import TrackPlayer, { Capability, Event, State } from 'react-native-track-player';

// Fonction pour configurer le lecteur au démarrage de l'application
export const initialiserLeLecteurAudio = async () => {
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
