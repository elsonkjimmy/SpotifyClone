/**
 * Ce fichier gère toutes les actions d'authentification Firebase.
 * En cas d'erreur de configuration (ex: CONFIGURATION_NOT_FOUND), il bascule automatiquement
 * sur un système d'authentification fictif (Mode Démo) pour le TP.
 */
import auth from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// État local pour le mode Démo (si Firebase n'est pas activé/configuré)
let utilisateurDemo: any = null;
const auditeursEtatAuth: Array<(utilisateur: any) => void> = [];

// Fonction pour notifier tous les écrans abonnés du changement d'authentification
const notifierChangementEtat = () => {
  auditeursEtatAuth.forEach((fonctionDeRappel) => {
    fonctionDeRappel(utilisateurDemo);
  });
};

// Fonction pour connecter un utilisateur avec son email et son mot de passe
export const connecterUtilisateurAvecEmail = async (email: string, password: string) => {
  try {
    const resultat = await auth().signInWithEmailAndPassword(email, password);
    return resultat;
  } catch (erreur: any) {
    console.log('Erreur connexion Firebase, tentative mode démo:', erreur);
    
    // Si Firebase n'est pas activé ou s'il y a une erreur de configuration
    if (
      erreur.code === 'auth/configuration-not-found' || 
      erreur.message?.includes('CONFIGURATION_NOT_FOUND') ||
      erreur.message?.includes('not-found')
    ) {
      utilisateurDemo = {
        email: email,
        uid: 'demo-uid-12345',
        displayName: 'Visiteur Démo',
      };
      notifierChangementEtat();
      return { user: utilisateurDemo };
    }
    throw erreur;
  }
};

// Fonction pour créer un nouveau compte utilisateur
export const creerCompteUtilisateurAvecEmail = async (email: string, password: string) => {
  try {
    const resultat = await auth().createUserWithEmailAndPassword(email, password);
    return resultat;
  } catch (erreur: any) {
    console.log('Erreur inscription Firebase, tentative mode démo:', erreur);
    
    if (
      erreur.code === 'auth/configuration-not-found' || 
      erreur.message?.includes('CONFIGURATION_NOT_FOUND') ||
      erreur.message?.includes('not-found')
    ) {
      utilisateurDemo = {
        email: email,
        uid: 'demo-uid-12345',
        displayName: 'Visiteur Démo',
      };
      notifierChangementEtat();
      return { user: utilisateurDemo };
    }
    throw erreur;
  }
};

// Fonction pour déconnecter l'utilisateur connecté
export const deconnecterUtilisateur = async () => {
  if (utilisateurDemo) {
    utilisateurDemo = null;
    notifierChangementEtat();
    return;
  }
  return auth().signOut();
};

// Fonction pour surveiller si l'utilisateur est connecté ou non (Changement d'état)
export const surveillerChangementEtatAuthentification = (
  fonctionDeRappel: (utilisateur: any) => void,
) => {
  auditeursEtatAuth.push(fonctionDeRappel);

  // On envoie l'état courant à l'abonnement initial
  if (utilisateurDemo) {
    fonctionDeRappel(utilisateurDemo);
  } else {
    // Si pas de démo, on lit Firebase
    fonctionDeRappel(auth().currentUser);
  }

  // Écoute des changements de Firebase
  const desabonnerFirebase = auth().onAuthStateChanged((user) => {
    if (!utilisateurDemo) {
      fonctionDeRappel(user);
    }
  });

  // Fonction de désabonnement
  return () => {
    desabonnerFirebase();
    const index = auditeursEtatAuth.indexOf(fonctionDeRappel);
    if (index > -1) {
      auditeursEtatAuth.splice(index, 1);
    }
  };
};
