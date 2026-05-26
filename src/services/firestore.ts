/**
 * Ce fichier gère toutes les interactions avec la base de données Firestore.
 * Il intègre également un système de cache/sauvegarde locale (Mode Démo) pour le TP.
 */
import firestore from '@react-native-firebase/firestore';

// Liste locale de secours (utilisée si Firestore est indisponible/non configuré)
let musiquesLocales: any[] = [
  { 
    id: 'secours-1',
    title: 'Blinding Lights', 
    artist: 'The Weeknd', 
    artwork: 'https://picsum.photos/id/111/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  { 
    id: 'secours-2',
    title: 'Starboy', 
    artist: 'The Weeknd', 
    artwork: 'https://picsum.photos/id/122/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  { 
    id: 'secours-3',
    title: 'One Dance', 
    artist: 'Drake', 
    artwork: 'https://picsum.photos/id/133/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
];

// Fonction pour récupérer la liste de secours locale
export const recupererToutesLesChansonsLocales = () => {
  return musiquesLocales;
};

// Fonction pour ajouter une chanson dans la liste de secours locale (Mode Démo)
export const ajouterNouvelleChansonLocale = (titre: string, artiste: string, urlAudio: string, urlImage: string) => {
  const nouvelleChanson = {
    id: `local-${Date.now()}`,
    title: titre,
    artist: artiste,
    artwork: urlImage,
    url: urlAudio
  };
  musiquesLocales = [nouvelleChanson, ...musiquesLocales];
};

// Fonction pour récupérer la liste de toutes les chansons disponibles sur Firestore (avec timeout et fallback)
export const recupererToutesLesChansons = async () => {
  try {
    // On ajoute un timeout de 10 secondes pour éviter de bloquer l'app
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de connexion Firestore')), 10000)
    );
    
    const queryPromise = firestore().collection('songs').get();
    
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (erreur: any) {
    console.log('Erreur lors du chargement des musiques:', erreur);
    // On retourne un objet compatible avec le format Firestore query
    return {
      docs: musiquesLocales.map(m => ({
        id: m.id,
        data: () => m
      })),
      empty: musiquesLocales.length === 0
    };
  }
};

// Fonction pour récupérer toutes les playlists disponibles sur Firestore
export const recupererToutesLesPlaylists = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de connexion Firestore')), 10000)
    );
    
    const queryPromise = firestore().collection('playlists').get();
    
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (erreur: any) {
    console.log('Erreur lors du chargement des playlists:', erreur);
    // Retourner une collection vide
    return { docs: [], empty: true };
  }
};

// Fonction pour enregistrer une nouvelle musique dans la base de données Firestore
export const enregistrerNouvelleMusiqueDansFirestore = async (titre: string, artiste: string, urlAudio: string, urlImage: string) => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout Firestore')), 5000)
    );
    
    const addPromise = firestore().collection('songs').add({
      title: titre,
      artist: artiste,
      url: urlAudio,
      artwork: urlImage,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    
    return await Promise.race([addPromise, timeoutPromise]);
  } catch (erreur: any) {
    console.log('Impossible d\'ajouter à Firestore, ajout en local:', erreur.message);
    // Ajouter en local en cas d'erreur
    ajouterNouvelleChansonLocale(titre, artiste, urlAudio, urlImage);
    return { id: `local-${Date.now()}` };
  }
};

// Fonction pour ajouter des musiques de test dans Firestore si la base est vide
export const ajouterDesMusiquesDeTest = async () => {
  try {
    const collectionChansons = firestore().collection('songs');
    
    // Timeout pour éviter de bloquer
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout Firestore')), 5000)
    );
    
    const checkPromise = collectionChansons.get();
    const snapshot = await Promise.race([checkPromise, timeoutPromise]);

    // On n'ajoute les données que si la collection est vide
    if (snapshot.empty) {
      const musiques = [
        { 
          title: 'Blinding Lights', 
          artist: 'The Weeknd', 
          artwork: 'https://picsum.photos/id/111/300/300',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        { 
          title: 'Starboy', 
          artist: 'The Weeknd', 
          artwork: 'https://picsum.photos/id/122/300/300',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        },
        { 
          title: 'One Dance', 
          artist: 'Drake', 
          artwork: 'https://picsum.photos/id/133/300/300',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        }
      ];

      for (const musique of musiques) {
        await collectionChansons.add(musique);
      }
      console.log('Musiques de test ajoutées avec succès !');
    }
  } catch (erreur: any) {
    console.log('Mode démo activé - Firestore indisponible:', erreur.message);
  }
};
