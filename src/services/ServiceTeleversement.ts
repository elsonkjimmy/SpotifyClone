/**
 * Ce service gère l'envoi des fichiers (Audio et Images) vers Cloudinary.
 * Il permet d'obtenir un lien URL permanent à partir d'un fichier du téléphone.
 */

// Remplacez ces valeurs par vos identifiants Cloudinary (disponibles sur votre dashboard Cloudinary)
const NOM_DU_CLOUD = 'dtnyukyzy'; 
const UPLOAD_PRESET = 'spotify_televersement'; // Doit être configuré en "Unsigned" sur Cloudinary

export const televerserVersCloudinary = async (cheminDuFichier: string, typeDeFichier: 'image' | 'video') => {
  const urlCloudinary = `https://api.cloudinary.com/v1_1/${NOM_DU_CLOUD}/${typeDeFichier}/upload`;

  const donnees = new FormData();
  donnees.append('file', {
    uri: cheminDuFichier,
    type: typeDeFichier === 'image' ? 'image/jpeg' : 'audio/mpeg',
    name: typeDeFichier === 'image' ? 'pochette.jpg' : 'musique.mp3',
  } as any);
  donnees.append('upload_preset', UPLOAD_PRESET);

  try {
    const reponse = await fetch(urlCloudinary, {
      method: 'POST',
      body: donnees,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const resultat = await reponse.json();
    
    if (resultat.secure_url) {
      return resultat.secure_url; // C'est l'URL finale que nous enregistrerons dans Firestore
    } else {
      throw new Error('Échec du téléversement vers Cloudinary');
    }
  } catch (erreur) {
    console.error('Erreur Cloudinary:', erreur);
    throw erreur;
  }
};
