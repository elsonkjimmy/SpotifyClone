/**
 * Ce fichier gère toute la logique d'authentification avec Firebase.
 * Chaque fonction correspond à une action précise pour l'utilisateur.
 */
import auth from '@react-native-firebase/auth';

// Fonction pour connecter un utilisateur avec son email et son mot de passe
export const connecterUtilisateurAvecEmail = (email, password) => {
  return auth().signInWithEmailAndPassword(email, password);
};

// Fonction pour créer un nouveau compte utilisateur
export const creerCompteUtilisateurAvecEmail = (email, password) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

// Fonction pour déconnecter l'utilisateur actuel
export const deconnecterUtilisateur = () => {
  return auth().signOut();
};

// Fonction pour surveiller si l'utilisateur est connecté ou non (Changement d'état)
export const surveillerChangementEtatAuthentification = (fonctionDeRappel) => {
  return auth().onAuthStateChanged(fonctionDeRappel);
};
