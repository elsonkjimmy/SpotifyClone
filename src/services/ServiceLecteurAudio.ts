/**
 * Ce service gère toute la logique du lecteur audio (Lecture, Pause, Suivant).
 * Il utilise la bibliothèque react-native-track-player.
 */
import TrackPlayer, {
  Capability,
  RepeatMode,
  State,
} from 'react-native-track-player';
import {Share} from 'react-native';
import type {Chanson} from '../types';
import {ajouterAHistorique} from './ServiceHistorique';

let estDejaInitialise = false;
let modeAleatoireActif = false;
let modeRepetition: RepeatMode = RepeatMode.Off;
let nomPlaylistCourante = 'Ma sélection';

export const definirNomPlaylistCourante = (nom: string) => {
  nomPlaylistCourante = nom;
};

export const obtenirNomPlaylistCourante = () => nomPlaylistCourante;

export const mapperChansonPourLecteur = (chanson: Chanson) => ({
  id: chanson.id,
  url: chanson.url,
  title: chanson.title,
  artist: chanson.artist,
  artwork: chanson.artwork,
  // On utilise le champ "description" du lecteur pour transporter les paroles
  description: chanson.lyrics || '',
});

const melangerTableau = <T>(tableau: T[]): T[] => {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
};

export const initialiserLeLecteurAudio = async () => {
  if (estDejaInitialise) {
    return;
  }

  try {
    await TrackPlayer.setupPlayer();

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });

    estDejaInitialise = true;
  } catch (erreur) {
    console.log("Erreur lors de l'initialisation du lecteur:", erreur);
  }
};

export const chargerEtJouerUneListeDeMusiques = async (
  listeDeMusiques: Chanson[],
  indexDeDepart = 0,
  nomPlaylist = 'Ma sélection',
) => {
  if (listeDeMusiques.length === 0) {
    return;
  }

  definirNomPlaylistCourante(nomPlaylist);

  let fileAttente = listeDeMusiques;
  if (modeAleatoireActif) {
    const morceauCourant = listeDeMusiques[indexDeDepart];
    const autres = listeDeMusiques.filter((_, i) => i !== indexDeDepart);
    fileAttente = [morceauCourant, ...melangerTableau(autres)];
    indexDeDepart = 0;
  }

  const pistes = fileAttente.map(mapperChansonPourLecteur);
  await TrackPlayer.reset();
  await TrackPlayer.add(pistes);
  await TrackPlayer.skip(indexDeDepart);
  await TrackPlayer.setRepeatMode(modeRepetition);
  await TrackPlayer.play();

  // Enregistrer la chanson jouée dans l'historique d'écoute
  ajouterAHistorique(listeDeMusiques[indexDeDepart]);
};

export const basculerLecturePause = async () => {
  const etatActuel = await TrackPlayer.getState();
  if (etatActuel === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
};

export const passerALaMusiqueSuivante = async () => {
  await TrackPlayer.skipToNext();
};

export const revenirALaMusiquePrecedente = async () => {
  await TrackPlayer.skipToPrevious();
};

export const seekVersPosition = async (positionSecondes: number) => {
  await TrackPlayer.seekTo(positionSecondes);
};

export const basculerModeAleatoire = async () => {
  modeAleatoireActif = !modeAleatoireActif;
  return modeAleatoireActif;
};

export const basculerModeRepetition = async () => {
  if (modeRepetition === RepeatMode.Off) {
    modeRepetition = RepeatMode.Track;
  } else if (modeRepetition === RepeatMode.Track) {
    modeRepetition = RepeatMode.Queue;
  } else {
    modeRepetition = RepeatMode.Off;
  }
  await TrackPlayer.setRepeatMode(modeRepetition);
  return modeRepetition;
};

export const obtenirEtatModeAleatoire = () => modeAleatoireActif;

export const obtenirModeRepetition = () => modeRepetition;

export const partagerLaMusique = async (titre: string, artiste: string) => {
  try {
    await Share.share({
      message: `Écoute "${titre}" de ${artiste} sur Spotify Clone!`,
      title: 'Partager la musique',
    });
  } catch (erreur: unknown) {
    console.log('Erreur lors du partage:', erreur);
  }
};

/**
 * Ajoute une chanson juste après le morceau actuellement en lecture
 * dans la file d'attente ("Lire ensuite").
 * Utilise TrackPlayer.add(track, insertBeforeIndex) pour insérer
 * la piste à la position voulue.
 */
export const ajouterEnSuivant = async (chanson: Chanson) => {
  try {
    const pistePourLecteur = mapperChansonPourLecteur(chanson);
    const indexActif = await TrackPlayer.getActiveTrackIndex();
    const fileAttente = await TrackPlayer.getQueue();

    // Calculer l'index d'insertion : juste après le morceau en cours
    const indexInsertion = (indexActif ?? 0) + 1;

    if (indexInsertion < fileAttente.length) {
      // Insérer avant le morceau situé à indexInsertion
      await TrackPlayer.add(pistePourLecteur, indexInsertion);
    } else {
      // Ajouter à la fin si on est au dernier morceau
      await TrackPlayer.add(pistePourLecteur);
    }
  } catch (erreur) {
    console.log("Erreur lors de l'ajout en suivant:", erreur);
  }
};

let identifiantMinuteur: NodeJS.Timeout | null = null;
let tempsRestantMinuteur = 0; // en secondes
let callbackMiseAJourMinuteur: ((secondes: number) => void) | null = null;

/**
 * Démarre un minuteur de veille. Quand le temps est écoulé,
 * la lecture audio est automatiquement mise en pause.
 * @param minutes Nombre de minutes avant l'arrêt (0 pour désactiver)
 * @param auChangement Callback appelé à chaque seconde avec le temps restant
 */
export const demarrerMinuteurVeille = (
  minutes: number,
  auChangement?: (secondes: number) => void,
): void => {
  if (identifiantMinuteur) {
    clearInterval(identifiantMinuteur);
    identifiantMinuteur = null;
  }

  if (minutes === 0) {
    tempsRestantMinuteur = 0;
    if (auChangement) {
      auChangement(0);
    }
    return;
  }

  tempsRestantMinuteur = minutes * 60;
  callbackMiseAJourMinuteur = auChangement || null;

  if (callbackMiseAJourMinuteur) {
    callbackMiseAJourMinuteur(tempsRestantMinuteur);
  }

  identifiantMinuteur = setInterval(async () => {
    tempsRestantMinuteur--;

    if (callbackMiseAJourMinuteur) {
      callbackMiseAJourMinuteur(tempsRestantMinuteur);
    }

    if (tempsRestantMinuteur <= 0) {
      if (identifiantMinuteur) {
        clearInterval(identifiantMinuteur);
        identifiantMinuteur = null;
      }
      await TrackPlayer.pause();
    }
  }, 1000);
};

/**
 * Retourne le nombre de secondes restantes sur le minuteur.
 */
export const obtenirTempsRestantMinuteur = (): number => {
  return tempsRestantMinuteur;
};

/**
 * Annule le minuteur de veille en cours.
 */
export const annulerMinuteurVeille = (): void => {
  if (identifiantMinuteur) {
    clearInterval(identifiantMinuteur);
    identifiantMinuteur = null;
  }
  tempsRestantMinuteur = 0;
};
