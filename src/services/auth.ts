import auth from '@react-native-firebase/auth';

// Modules d'authentification native chargés dynamiquement
// pour éviter les plantages si les paquets ne sont pas encore installés localement (mode hors-ligne)
let GoogleSignin: any = null;
let authorize: any = null;

const GOOGLE_WEB_CLIENT_ID = '394646013784-7dpppcaqdnmhhsmsngildjuq24atbj6f.apps.googleusercontent.com';
const GITHUB_CLIENT_ID = 'Ov23liOOpFaYkxadNnTH';
const GITHUB_CLIENT_SECRET = 'd7767daba12419dace39608ed1221c151c593344';

const estGoogleConfigure = () =>
  GOOGLE_WEB_CLIENT_ID.length > 0 &&
  !GOOGLE_WEB_CLIENT_ID.includes('-demo.apps.googleusercontent.com');

const estGitHubConfigure = () =>
  GITHUB_CLIENT_ID !== 'VOTRE_CLIENT_ID_GITHUB' &&
  GITHUB_CLIENT_SECRET !== 'VOTRE_CLIENT_SECRET_GITHUB';

const creerErreurConfiguration = (provider: 'Google' | 'GitHub') =>
  new Error(
    `${provider} n'est pas encore configuré. Installez le module natif et renseignez les vrais identifiants OAuth Firebase.`,
  );

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const appAuthModule = require('react-native-app-auth');
  authorize = appAuthModule.authorize;

  if (GoogleSignin) {
    GoogleSignin.configure({
      // ID client Web Firebase spécifique au nouveau package com.groupe4.spotifyclone
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false, 
      scopes: ['profile', 'email'],
    });
  }
} catch (erreur) {
  console.log(
    "Modules d'authentification native non installés, bascule mode Démo actif.",
  );
}

// État local pour le mode Démo (si Firebase n'est pas activé/configuré)
let utilisateurDemo: any = null;
const auditeursEtatAuth: Array<(utilisateur: any) => void> = [];

// Fonction pour notifier tous les écrans abonnés du changement d'authentification
const notifierChangementEtat = () => {
  auditeursEtatAuth.forEach(fonctionDeRappel => {
    fonctionDeRappel(utilisateurDemo);
  });
};

// Fonction pour connecter un utilisateur avec son email et son mot de passe
export const connecterUtilisateurAvecEmail = async (
  email: string,
  password: string,
) => {
  try {
    utilisateurDemo = null;
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
      return {user: utilisateurDemo};
    }
    throw erreur;
  }
};

// Fonction pour connecter un utilisateur avec GitHub (OAuth)
export const connecterUtilisateurAvecGitHub = async () => {
  try {
    utilisateurDemo = null;

    // Si le module natif est disponible, on exécute le vrai flux de production in-app
    if (authorize) {
      if (!estGitHubConfigure()) {
        throw creerErreurConfiguration('GitHub');
      }

      const configurationGitHub = {
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        redirectUrl: 'com.groupe4.spotifyclone://oauth',
        scopes: ['user:email'],
        serviceConfiguration: {
          authorizationEndpoint: 'https://github.com/login/oauth/authorize',
          tokenEndpoint: 'https://github.com/login/oauth/access_token',
        },
      };

      const resultatAuth = await authorize(configurationGitHub);
      const credential = auth.GithubAuthProvider.credential(
        resultatAuth.accessToken,
      );
      const resultat = await auth().signInWithCredential(credential);
      return resultat;
    }

    throw creerErreurConfiguration('GitHub');
  } catch (erreur: any) {
    console.log('Erreur connexion GitHub Firebase natif:', erreur);
    throw erreur;
  }
};

// Fonction pour connecter un utilisateur avec Google (OAuth)
export const connecterUtilisateurAvecGoogle = async () => {
  try {
    utilisateurDemo = null;

    // Si le module natif est disponible, on exécute le vrai flux natif Google Sign-In
    if (GoogleSignin) {
      if (!estGoogleConfigure()) {
        throw creerErreurConfiguration('Google');
      }

      await GoogleSignin.hasPlayServices();
      const {idToken} = await GoogleSignin.signIn();
      if (!idToken) {
        throw new Error('Aucun jeton Google reçu');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const resultat = await auth().signInWithCredential(googleCredential);
      return resultat;
    }

    throw creerErreurConfiguration('Google');
  } catch (erreur: any) {
    console.log('Erreur connexion Google Firebase natif:', erreur);
    throw erreur;
  }
};

// Fonction pour créer un nouveau compte utilisateur
export const creerCompteUtilisateurAvecEmail = async (
  email: string,
  password: string,
) => {
  try {
    utilisateurDemo = null;
    const resultat = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
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
      return {user: utilisateurDemo};
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
  const desabonnerFirebase = auth().onAuthStateChanged(user => {
    if (user) {
      utilisateurDemo = null;
    }
    if (!utilisateurDemo) {
      fonctionDeRappel(user ?? utilisateurDemo);
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
