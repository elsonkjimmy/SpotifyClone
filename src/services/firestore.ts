/**
 * Ce fichier gère toutes les interactions avec la base de données Firestore.
 * C'est ici qu'on récupère les données des musiques et des playlists.
 */
import firestore from '@react-native-firebase/firestore';

// Fonction pour récupérer la liste de toutes les chansons disponibles
export const recupererToutesLesChansons = () => {
  return firestore().collection('songs').get();
};

// Fonction pour récupérer toutes les playlists disponibles
export const recupererToutesLesPlaylists = () => {
  return firestore().collection('playlists').get();
};

// Fonction pour enregistrer une nouvelle musique dans la base de données Firestore
export const enregistrerNouvelleMusiqueDansFirestore = async (titre: string, artiste: string, urlAudio: string, urlImage: string) => {
  return firestore().collection('songs').add({
    title: titre,
    artist: artiste,
    url: urlAudio,
    artwork: urlImage,
    createdAt: firestore.FieldValue.serverTimestamp(), // Pour trier par date d'ajout
  });
};

// Fonction pour ajouter des musiques de test dans Firestore si la base est vide
export const ajouterDesMusiquesDeTest = async () => {
  const collectionChansons = firestore().collection('songs');
  const snapshot = await collectionChansons.get();

  // On n'ajoute les données que si la collection est vide
  if (snapshot.empty) {
    const musiques = [
      { 
        title: 'Blinding Lights', 
        artist: 'The Weeknd', 
        artwork: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      { 
        title: 'Starboy', 
        artist: 'The Weeknd', 
        artwork: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      },
      { 
        title: 'One Dance', 
        artist: 'Drake', 
        artwork: 'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      }
    ];

    for (const musique of musiques) {
      await collectionChansons.add(musique);
    }
    console.log('Musiques de test ajoutées avec succès !');
  }
};
