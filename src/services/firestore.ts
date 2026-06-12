/**
 * Ce fichier gère toutes les interactions avec la base de données Firestore.
 * Il intègre également un système de cache/sauvegarde locale (Mode Démo) pour le TP.
 */
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import type {Chanson, Playlist} from '../types';

const DELAI_TIMEOUT_MS = 10000;

const MUSIQUES_SECOURS: Chanson[] = [
  {
    id: 'secours-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artwork: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Pop',
    lyrics:
      "Je roulais dans la nuit sans fin\nLes néons dansent sur le chemin\nTon regard brille comme un phare\nJe suis aveuglé par la lumière\n\nBlinding lights, étoiles perdues\nDans cette ville, je t'ai reconnue",
  },
  {
    id: 'secours-2',
    title: 'Starboy',
    artist: 'The Weeknd',
    artwork: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Pop',
    lyrics:
      'Étoile filante dans la nuit noire\nJe brille plus fort que le boulevard\nChaque pas résonne, chaque mot compte\nStarboy, je monte, je monte\n\nLes étoiles me connaissent par mon nom\nJe suis le roi de cette chanson',
  },
  {
    id: 'secours-3',
    title: 'One Dance',
    artist: 'Drake',
    artwork: 'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Afro',
    lyrics:
      "Une danse, c'est tout ce qu'il faut\nLe rythme nous porte vers le haut\nSous les étoiles on se retrouve\nUne danse et le monde s'ouvre\n\nBouge avec moi, oublie demain\nCette nuit nous appartient",
  },
];

let musiquesLocales: Chanson[] = [...MUSIQUES_SECOURS];

let playlistsLocales: Playlist[] = [
  {
    id: 'local-liked',
    nom: 'Titres likés',
    createur: 'Playlist • 0 titres',
    estSpeciale: true,
    songIds: [],
  },
  {
    id: 'local-1',
    nom: 'Afrobeat 2026',
    createur: 'Playlist • Spotify Clone',
    image: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a',
    songIds: ['secours-1', 'secours-3'],
  },
  {
    id: 'local-2',
    nom: 'Concentration TP',
    createur: 'Playlist • Spotify Clone',
    image: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a',
    songIds: ['secours-2', 'secours-3'],
  },
];

const favorisParUtilisateur: Record<string, string[]> = {};

const avecTimeout = <T>(
  promesse: Promise<T>,
  delai = DELAI_TIMEOUT_MS,
): Promise<T> =>
  Promise.race([
    promesse,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error('Timeout de connexion Firestore')),
        delai,
      ),
    ),
  ]);

const mapperDocumentChanson = (
  doc: FirebaseFirestoreTypes.QueryDocumentSnapshot,
): Chanson => {
  const donnees = doc.data() as Omit<Chanson, 'id'>;
  return {id: doc.id, ...donnees};
};

const mapperDocumentPlaylist = (
  doc: FirebaseFirestoreTypes.QueryDocumentSnapshot,
): Playlist => {
  const donnees = doc.data() as Omit<Playlist, 'id'>;
  return {id: doc.id, ...donnees};
};

export const recupererToutesLesChansonsLocales = (): Chanson[] =>
  musiquesLocales;

export const ajouterNouvelleChansonLocale = (
  titre: string,
  artiste: string,
  urlAudio: string,
  urlImage: string,
) => {
  const nouvelleChanson: Chanson = {
    id: `local-${Date.now()}`,
    title: titre,
    artist: artiste,
    artwork: urlImage,
    url: urlAudio,
  };
  musiquesLocales = [nouvelleChanson, ...musiquesLocales];
  return nouvelleChanson;
};

export const recupererToutesLesChansons = async (): Promise<Chanson[]> => {
  try {
    const snapshot = await avecTimeout(firestore().collection('songs').get());
    if (snapshot.empty) {
      return musiquesLocales;
    }
    return snapshot.docs.map(doc => mapperDocumentChanson(doc));
  } catch (erreur) {
    console.log('Erreur lors du chargement des musiques:', erreur);
    return musiquesLocales;
  }
};

export const recupererChansonsParIds = async (
  ids: string[],
): Promise<Chanson[]> => {
  if (ids.length === 0) {
    return [];
  }

  try {
    const toutesLesChansons = await recupererToutesLesChansons();
    const chansonsParId = new Map(toutesLesChansons.map(c => [c.id, c]));
    return ids
      .map(id => chansonsParId.get(id))
      .filter((c): c is Chanson => Boolean(c));
  } catch (erreur) {
    console.log('Erreur chargement chansons par ids:', erreur);
    const chansonsParId = new Map(musiquesLocales.map(c => [c.id, c]));
    return ids
      .map(id => chansonsParId.get(id))
      .filter((c): c is Chanson => Boolean(c));
  }
};

export const recupererToutesLesPlaylists = async (): Promise<Playlist[]> => {
  try {
    const snapshot = await avecTimeout(
      firestore().collection('playlists').get(),
    );
    if (snapshot.empty) {
      return playlistsLocales;
    }
    return snapshot.docs.map(doc => mapperDocumentPlaylist(doc));
  } catch (erreur) {
    console.log('Erreur lors du chargement des playlists:', erreur);
    return playlistsLocales;
  }
};

export const enregistrerNouvelleMusiqueDansFirestore = async (
  titre: string,
  artiste: string,
  urlAudio: string,
  urlImage: string,
) => {
  try {
    const resultat = await avecTimeout(
      firestore().collection('songs').add({
        title: titre,
        artist: artiste,
        url: urlAudio,
        artwork: urlImage,
        createdAt: firestore.FieldValue.serverTimestamp(),
      }),
      5000,
    );
    return resultat;
  } catch (erreur: unknown) {
    const message =
      erreur instanceof Error ? erreur.message : 'Erreur inconnue';
    console.log("Impossible d'ajouter à Firestore, ajout en local:", message);
    return ajouterNouvelleChansonLocale(titre, artiste, urlAudio, urlImage);
  }
};

export const ajouterDesMusiquesDeTest = async (): Promise<string[]> => {
  const idsCrees: string[] = [];

  try {
    const collectionChansons = firestore().collection('songs');
    const snapshot = await avecTimeout(collectionChansons.get(), 5000);

    if (!snapshot.empty) {
      return snapshot.docs.map(doc => doc.id);
    }

    const musiques = [
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        artwork:
          'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        genre: 'Pop',
        lyrics:
          "Je roulais dans la nuit sans fin\nLes néons dansent sur le chemin\nTon regard brille comme un phare\nJe suis aveuglé par la lumière\n\nBlinding lights, étoiles perdues\nDans cette ville, je t'ai reconnue",
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd',
        artwork:
          'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        genre: 'Pop',
        lyrics:
          'Étoile filante dans la nuit noire\nJe brille plus fort que le boulevard\nChaque pas résonne, chaque mot compte\nStarboy, je monte, je monte\n\nLes étoiles me connaissent par mon nom\nJe suis le roi de cette chanson',
      },
      {
        title: 'One Dance',
        artist: 'Drake',
        artwork:
          'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        genre: 'Afro',
        lyrics:
          "Une danse, c'est tout ce qu'il faut\nLe rythme nous porte vers le haut\nSous les étoiles on se retrouve\nUne danse et le monde s'ouvre\n\nBouge avec moi, oublie demain\nCette nuit nous appartient",
      },
    ];

    for (const musique of musiques) {
      const ref = await collectionChansons.add(musique);
      idsCrees.push(ref.id);
    }
    console.log('Musiques de test ajoutées avec succès !');
    return idsCrees;
  } catch (erreur: unknown) {
    const message =
      erreur instanceof Error ? erreur.message : 'Erreur inconnue';
    console.log('Mode démo - seed musiques local:', message);
    return musiquesLocales.map(m => m.id);
  }
};

export const ajouterDesPlaylistsDeTest = async (idsChansons: string[]) => {
  try {
    const collectionPlaylists = firestore().collection('playlists');
    const snapshot = await avecTimeout(collectionPlaylists.get(), 5000);

    if (!snapshot.empty) {
      return;
    }

    const playlists = [
      {
        nom: 'Titres likés',
        createur: 'Playlist • Favoris',
        estSpeciale: true,
        songIds: idsChansons.slice(0, 2),
      },
      {
        nom: 'Afrobeat 2026',
        createur: 'Playlist • Spotify Clone',
        image:
          'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a',
        songIds: idsChansons,
      },
      {
        nom: 'Concentration TP',
        createur: 'Playlist • Spotify Clone',
        image:
          'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a',
        songIds: idsChansons.slice(1),
      },
      {
        nom: 'Sport Matin',
        createur: 'Album • Burna Boy',
        image:
          'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5',
        songIds: [idsChansons[0], idsChansons[2]].filter(Boolean),
      },
    ];

    for (const playlist of playlists) {
      await collectionPlaylists.add(playlist);
    }
    console.log('Playlists de test ajoutées avec succès !');
  } catch (erreur: unknown) {
    const message =
      erreur instanceof Error ? erreur.message : 'Erreur inconnue';
    console.log('Mode démo - playlists locales utilisées:', message);
  }
};

export const initialiserDonneesDeTest = async () => {
  const idsChansons = await ajouterDesMusiquesDeTest();
  await ajouterDesPlaylistsDeTest(idsChansons);
};

export const recupererFavorisUtilisateur = async (
  userId: string,
): Promise<string[]> => {
  if (favorisParUtilisateur[userId]) {
    return favorisParUtilisateur[userId];
  }

  try {
    const snapshot = await avecTimeout(
      firestore().collection('users').doc(userId).collection('likes').get(),
      5000,
    );
    const ids = snapshot.docs.map(doc => doc.id);
    favorisParUtilisateur[userId] = ids;
    return ids;
  } catch {
    favorisParUtilisateur[userId] = [];
    return [];
  }
};

export const basculerFavori = async (
  userId: string,
  chanson: Chanson,
): Promise<boolean> => {
  const favorisActuels = await recupererFavorisUtilisateur(userId);
  const estDejaFavori = favorisActuels.includes(chanson.id);

  if (estDejaFavori) {
    favorisParUtilisateur[userId] = favorisActuels.filter(
      id => id !== chanson.id,
    );
  } else {
    favorisParUtilisateur[userId] = [...favorisActuels, chanson.id];
  }

  try {
    const refLike = firestore()
      .collection('users')
      .doc(userId)
      .collection('likes')
      .doc(chanson.id);
    if (estDejaFavori) {
      await refLike.delete();
    } else {
      await refLike.set({
        title: chanson.title,
        artist: chanson.artist,
        artwork: chanson.artwork,
        url: chanson.url,
      });
    }
  } catch {
    // Le cache local reste la source en mode démo
  }

  return !estDejaFavori;
};

export const estChansonFavorie = async (
  userId: string,
  chansonId: string,
): Promise<boolean> => {
  const favoris = await recupererFavorisUtilisateur(userId);
  return favoris.includes(chansonId);
};

/**
 * Crée une nouvelle playlist dans Firestore (ou en local en mode démo).
 * Le champ 'createur' reprend le format Spotify : "Playlist • email".
 */
export const creerNouvellePlaylist = async (
  userId: string,
  nomPlaylist: string,
): Promise<Playlist> => {
  const nouvellePlaylistLocale: Playlist = {
    id: `user-playlist-${Date.now()}`,
    nom: nomPlaylist,
    createur: `Playlist • ${userId}`,
    songIds: [],
    userId,
  };

  try {
    const donneesPlaylist = {
      nom: nomPlaylist,
      createur: `Playlist • ${userId}`,
      songIds: [],
      userId,
    };
    const ref = await avecTimeout(
      firestore().collection('playlists').add(donneesPlaylist),
      5000,
    );
    return {...nouvellePlaylistLocale, id: ref.id};
  } catch (erreur: unknown) {
    const message =
      erreur instanceof Error ? erreur.message : 'Erreur inconnue';
    console.log('Mode démo - playlist créée en local:', message);
    // Sauvegarde locale pour le mode démo
    playlistsLocales = [...playlistsLocales, nouvellePlaylistLocale];
    return nouvellePlaylistLocale;
  }
};

/**
 * Ajoute l'identifiant d'une chanson au tableau songIds d'une playlist.
 * Utilise arrayUnion pour éviter les doublons côté Firestore.
 */
export const ajouterChansonAPlaylist = async (
  playlistId: string,
  chansonId: string,
): Promise<void> => {
  // Mise à jour locale (pour le mode démo et la réactivité)
  playlistsLocales = playlistsLocales.map(p => {
    if (p.id === playlistId && !p.songIds.includes(chansonId)) {
      return {...p, songIds: [...p.songIds, chansonId]};
    }
    return p;
  });

  try {
    await avecTimeout(
      firestore()
        .collection('playlists')
        .doc(playlistId)
        .update({
          songIds: firestore.FieldValue.arrayUnion(chansonId),
        }),
      5000,
    );
  } catch {
    // Le cache local reste la source en mode démo
  }
};

/**
 * Retire l'identifiant d'une chanson du tableau songIds d'une playlist.
 * Utilise arrayRemove côté Firestore.
 */
export const retirerChansonDePlaylist = async (
  playlistId: string,
  chansonId: string,
): Promise<void> => {
  // Mise à jour locale (pour le mode démo et la réactivité)
  playlistsLocales = playlistsLocales.map(p => {
    if (p.id === playlistId) {
      return {...p, songIds: p.songIds.filter(id => id !== chansonId)};
    }
    return p;
  });

  try {
    await avecTimeout(
      firestore()
        .collection('playlists')
        .doc(playlistId)
        .update({
          songIds: firestore.FieldValue.arrayRemove(chansonId),
        }),
      5000,
    );
  } catch {
    // Le cache local reste la source en mode démo
  }
};

/**
 * Récupère uniquement les playlists créées par un utilisateur donné.
 * Filtre par le champ userId, avec fallback sur les données locales.
 */
export const recupererPlaylistsUtilisateur = async (
  userId: string,
): Promise<Playlist[]> => {
  try {
    const snapshot = await avecTimeout(
      firestore().collection('playlists').where('userId', '==', userId).get(),
      5000,
    );
    if (snapshot.empty) {
      return playlistsLocales.filter(p => p.userId === userId);
    }
    return snapshot.docs.map(doc => mapperDocumentPlaylist(doc));
  } catch (erreur) {
    console.log('Erreur récupération playlists utilisateur:', erreur);
    return playlistsLocales.filter(p => p.userId === userId);
  }
};

/**
 * Supprime une musique de Firestore (ou en local en mode démo).
 */
export const supprimerMusiqueDeFirestore = async (
  chansonId: string,
): Promise<void> => {
  // Mise à jour locale pour le mode démo
  musiquesLocales = musiquesLocales.filter(m => m.id !== chansonId);

  try {
    await avecTimeout(
      firestore().collection('songs').doc(chansonId).delete(),
      5000,
    );
  } catch (erreur) {
    console.log('Mode démo - musique supprimée en local:', erreur);
  }
};

/**
 * Modifie le titre et l'artiste d'une musique sur Firestore (ou en local en mode démo).
 */
export const modifierMusiqueDansFirestore = async (
  chansonId: string,
  nouveauTitre: string,
  nouvelArtiste: string,
): Promise<void> => {
  // Mise à jour locale pour le mode démo
  musiquesLocales = musiquesLocales.map(m =>
    m.id === chansonId ? {...m, title: nouveauTitre, artist: nouvelArtiste} : m,
  );

  try {
    await avecTimeout(
      firestore().collection('songs').doc(chansonId).update({
        title: nouveauTitre,
        artist: nouvelArtiste,
      }),
      5000,
    );
  } catch (erreur) {
    console.log('Mode démo - musique modifiée en local:', erreur);
  }
};
