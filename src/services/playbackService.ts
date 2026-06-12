/**
 * Service de lecture en arrière-plan pour react-native-track-player.
 * Gère les événements audio émis par le système (boutons du casque, écran de verrouillage).
 */
import TrackPlayer, {Event} from 'react-native-track-player';

export const ServiceDeLecture = async () => {
  // Événement : Clic sur Play (ex: depuis les contrôles du téléphone)
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  // Événement : Clic sur Pause
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  // Événement : Passer à la musique suivante
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  // Événement : Revenir à la musique précédente
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  // Événement : Arrêter la lecture
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.reset();
  });
};
