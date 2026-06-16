## Rapport TP – Application Spotify Clone (React Native)

Ce document présente de façon pédagogique la structure de l’application, les principales fonctionnalités et l’emplacement des fichiers importants. Google Sign-In est considéré comme **fonctionnel** (configuré côté Firebase + clé OAuth).

---

## 1. Vue d’ensemble de l’architecture

- **Technologie**: React Native (TypeScript) avec navigation par onglets et stack (`@react-navigation`).
- **Backend**: Firebase (Auth + Firestore) + Cloudinary pour l’upload de fichiers.
- **Stockage local**: `AsyncStorage` pour les téléchargements hors‑ligne et l’historique.
- **Organisation**:
  - `App.tsx` : point d’entrée de l’application.
  - `src/navigation/AppNavigator.tsx` : navigation globale (tabs + stack).
  - `src/context/*` : contextes (`AuthContext`, `ToastContext`).
  - `src/services/*` : accès Firestore, lecteur audio, auth, offline, Cloudinary.
  - `src/screens/*` : écrans principaux (Accueil, Recherche, Bibliothèque, Compte, Lecteur, etc.).
  - `src/components/*` : composants réutilisables (mini‑lecteur, cartes, modales).

---

## 2. Point d’entrée et navigation

- **`App.tsx`**
  - Initialise Firestore (`persistence: false`) et les données de test (`initialiserDonneesDeTest`).
  - Initialise le lecteur audio (`initialiserLeLecteurAudio`).
  - Enveloppe l’app avec `AuthProvider` et `ToastProvider`.
  - Monte `NavigationContainer` et `AppNavigator`.

- **`src/navigation/AppNavigator.tsx`**
  - Définit la **navigation par onglets** :
    - `Home` → `HomeScreen` (accueil).
    - `Search` → `SearchScreen` (recherche).
    - `Library` → `LibraryScreen` (bibliothèque).
    - `Account` → `AccountScreen` (compte / paramètres).
  - Ajoute un **mini‑lecteur audio** global (`MiniLecteurAudio`) en dessous des onglets.
  - Définit la **stack** modale :
    - `Player` → `PlayerScreen` (lecteur plein écran).
    - `Queue` → `QueueScreen` (file d’attente).
    - `AddMusic` → `AddMusicScreen` (upload admin).
    - `PlaylistDetail` → `PlaylistDetailScreen`.
    - `CreatePlaylist` → `CreatePlaylistScreen`.
    - `Login` / `Register` → écrans d’auth.
  - Affiche un **SplashScreen** (`SplashScreen`) tant que `AuthContext` est en chargement.

---

## 3. Authentification et mode administrateur

- **`src/context/AuthContext.tsx`**
  - Expose `utilisateur`, `chargement`, `estAdmin`.
  - Utilise `surveillerChangementEtatAuthentification` pour écouter Firebase Auth.
  - Règle de rôle admin :
    - Constante `EMAIL_ADMIN = 'admin@ict.com'`.
    - `estAdmin` est vrai si `utilisateur.email` == `EMAIL_ADMIN`.

- **`src/services/auth.ts`**
  - Regroupe toutes les fonctions d’authentification :
    - `connecterUtilisateurAvecEmail` / `creerCompteUtilisateurAvecEmail`.
    - `connecterUtilisateurAvecGitHub` (via `react-native-app-auth`).
    - `connecterUtilisateurAvecGoogle` (via `@react-native-google-signin/google-signin` + Firebase Auth).
    - `deconnecterUtilisateur`.
    - `surveillerChangementEtatAuthentification` (abonnement global utilisé par `AuthContext`).
  - **Google Sign-In** :
    - Configure `GoogleSignin` avec `webClientId` (ID client Web Firebase).
    - Appelle `GoogleSignin.signIn()` puis génère une `credential` Firebase avec l’`idToken`.
    - En cas d’erreur de configuration ou de réseau, les erreurs sont remontées jusqu’à `LoginScreen`.

- **Écrans d’authentification**
  - `src/screens/LoginScreen.tsx`
    - Formulaire email / mot de passe (Firebase).
    - Boutons de connexion **Google** et **GitHub**.
  - `src/screens/RegisterScreen.tsx`
    - Formulaire de création de compte email / mot de passe.

- **Mode Admin**
  - L’email `admin@ict.com` doit exister dans Firebase Auth.
  - `AuthContext` calcule `estAdmin` à partir de cet email.
  - L’interface admin est visible dans :
    - `AccountScreen` : badge **Administrateur** + statistiques Firestore.
    - `LibraryScreen` : bouton **“+”** admin menant à `AddMusicScreen`.
    - `PlaylistDetailScreen` : actions de modification / suppression réservées à l’admin.

---

## 4. Données métier et Firestore

- **`src/services/firestore.ts`**
  - Fait le lien entre l’app et **Firestore**, avec un **mode démo local**.
  - Structures utilisées :
    - `Chanson` : `{ id, title, artist, artwork, url, genre?, lyrics? }`.
    - `Playlist` : `{ id, nom, createur, image?, songIds[], estSpeciale?, userId? }`.

### 4.1. Données locales (mode démo)

- Tableaux en mémoire :
  - `MUSIQUES_SECOURS` / `musiquesLocales` : musiques “fallback” utilisées si Firestore est indisponible.
  - `playlistsLocales` : playlists locales (Titres likés, Afrobeat, Concentration, etc.).
  - `favorisParUtilisateur` : cache des titres likés par utilisateur.

### 4.2. Fonctions principales Firestore

- Récupération :
  - `recupererToutesLesChansons()` : lit la collection `songs` (sinon `musiquesLocales`).
  - `recupererChansonsParIds(ids)` : filtre les chansons par identifiant.
  - `recupererToutesLesPlaylists()` : lit la collection `playlists` (sinon `playlistsLocales`).
  - `recupererPlaylistsUtilisateur(userId)` : playlists créées par un utilisateur.
  - `recupererFavorisUtilisateur(userId)` : lit `users/{uid}/likes` (ou le cache local).

- Administration / écriture :
  - `enregistrerNouvelleMusiqueDansFirestore(titre, artiste, urlAudio, urlImage)` :
    - Ajoute un document dans `songs` avec `createdAt`.
    - En cas d’erreur, ajoute la chanson en **local** via `ajouterNouvelleChansonLocale`.
  - `creerNouvellePlaylist(userId, nomPlaylist)` :
    - Crée une playlist Firestore (ou locale en mode démo).
  - `ajouterChansonAPlaylist(playlistId, chansonId)` / `retirerChansonDePlaylist(...)` :
    - Met à jour `songIds` côté Firestore (ou local).
  - `basculerFavori(userId, chanson)` :
    - Ajoute / retire un doc dans `users/{uid}/likes`.
  - `supprimerMusiqueDeFirestore(chansonId)` / `modifierMusiqueDansFirestore(...)` :
    - Suppression / édition d’une chanson côté Firestore (avec mise à jour locale).

- Initialisation des données :
  - `ajouterDesMusiquesDeTest()` + `ajouterDesPlaylistsDeTest()` :
    - Seed des collections Firestore au premier lancement.
  - `initialiserDonneesDeTest()` est appelé dans `App.tsx`.

---

## 5. Lecteur audio et historique

- **`src/services/ServiceLecteurAudio.ts`**
  - Encapsule la logique du lecteur basé sur `react-native-track-player` (initialisation, file d’attente, lecture, pause, etc.).
  - Fonction clé : `chargerEtJouerUneListeDeMusiques(liste, indexDepart, titrePlaylist)`.
  - Exporte des helpers pour le **mini‑lecteur** et le lecteur plein écran.

- **`src/services/ServiceHistorique.ts`**
  - Stocke l’historique des morceaux écoutés dans `AsyncStorage`.
  - Fonction principale : `ajouterALHistorique(chanson)` + `recupererHistorique()`.

- **Composants liés**
  - `src/components/MiniLecteurAudio.tsx` :
    - Affiché tout en bas de l’app.
    - Affiche morceau en cours + boutons play/pause/suivant.
  - `src/screens/PlayerScreen.tsx` :
    - Lecteur plein écran (pochette, barre de progression, shuffle, repeat, timer de veille).
    - Intègre le bouton de téléchargement hors‑ligne (cf. section offline).

---

## 6. Écrans principaux

- **Accueil – `src/screens/HomeScreen.tsx`**
  - Charge toutes les musiques (`recupererToutesLesChansons`).
  - Affiche :
    - Raccourcis vers des “pseudo‑playlists” par chanson.
    - Sections “Écoutés récemment”, “Fait pour vous”, “Mix personnalisés”.
  - Respecte le **mode hors‑ligne** :
    - Si `obtenirModeHorsLigne()` est vrai, ne garde que les chansons dont l’ID est marqué téléchargé (`estChansonTelechargee`).

- **Recherche – `src/screens/SearchScreen.tsx`**
  - Formulaire de recherche par titre / artiste / genre.
  - Utilise `recupererToutesLesChansons` puis filtre côté client.
  - Respecte le mode hors‑ligne en filtrant sur les titres téléchargés.

- **Bibliothèque – `src/screens/LibraryScreen.tsx`**
  - Charge toutes les playlists (`recupererToutesLesPlaylists` + adaptation pour la playlist de favoris).
  - Permet de filtrer et trier les playlists (Playlists / Albums + tri).
  - Boutons d’action :
    - Créer une playlist (`CreatePlaylistScreen`).
    - Si `estAdmin` : ouvrir l’écran **AddMusic** pour uploader de nouvelles musiques.

- **Détail de playlist – `src/screens/PlaylistDetailScreen.tsx`**
  - Affiche le contenu d’une playlist (via `recupererChansonsParIds`).
  - Permet la lecture de la playlist entière ou d’un morceau sélectionné.
  - Si admin : accès à une **modale de modification de titre / artiste**, suppression, etc.

- **Compte – `src/screens/AccountScreen.tsx`**
  - Affiche les infos de l’utilisateur connecté + boutons connexion/déconnexion.
  - Active/désactive le **mode hors‑ligne**.
  - Si admin :
    - Panel “Console Administrateur” avec statistiques Firestore (nombre de chansons, playlists, créateurs).

- **Écran d’ajout admin – `src/screens/AddMusicScreen.tsx`**
  - Accessible uniquement si :
    - Utilisateur connecté.
    - `estAdmin === true` (email `admin@ict.com`).
  - Formulaire :
    - Titre, artiste, fichier audio, pochette.
  - Workflow :
    - Upload pochette et audio vers Cloudinary (`ServiceTeleversement`).
    - Enregistrement du document dans Firestore (`enregistrerNouvelleMusiqueDansFirestore`).

---

## 7. Upload Cloudinary

- **`src/services/ServiceTeleversement.ts`**
  - `televerserVersCloudinary(cheminDuFichier, typeDeFichier)` :
    - Envoie un `FormData` vers l’API Cloudinary.
    - Utilise :
      - `NOM_DU_CLOUD` (nom du cloud).
      - `UPLOAD_PRESET` (preset unsigned `spotify_televersement`).
    - Retourne `secure_url` à stocker dans Firestore.

---

## 8. Mode hors‑ligne et téléchargements

- **`src/services/ServiceTelechargement.ts`**
  - Gère une **liste d’IDs de chansons téléchargées** en mémoire + `AsyncStorage`.
  - Au démarrage :
    - Charge `telechargements` depuis `AsyncStorage`.
  - Fonctions principales :
    - `telechargerChanson(chansonId)` :
      - Simule un download (timeout 1.5 s).
      - Ajoute l’ID dans `idsChansonsTelechargees` et persiste dans `AsyncStorage`.
    - `supprimerChansonTelechargee(chansonId)` :
      - Retire l’ID de la liste + met à jour `AsyncStorage`.
    - `estChansonTelechargee(chansonId)` :
      - Vérifie si l’ID est dans la liste locale.
    - `activerModeHorsLigne(actif)` / `obtenirModeHorsLigne()` :
      - Basculent le **mode hors‑ligne global** de l’application.
    - `recupererTousLesTelechargements()` :
      - Retourne le tableau courant des IDs téléchargés.

- **Hook et bannière**
  - `src/hooks/useOffline.ts` :
    - Hook React qui écoute `sAbonnerAuModeHorsLigne` pour savoir si l’app est en mode hors‑ligne.
  - `src/components/OfflineBanner.tsx` :
    - Affiche une bande “Mode hors‑ligne activé” en haut des écrans principaux.

- **Intégration dans les écrans**
  - `HomeScreen` :
    - Si `obtenirModeHorsLigne()` est vrai, ne garde que les chansons dont l’ID est dans `estChansonTelechargee`.
  - `SearchScreen` :
    - Filtre les résultats sur les IDs téléchargés quand le mode hors‑ligne est actif.
  - `AccountScreen` :
    - Propose un switch pour activer/désactiver le mode hors‑ligne (en appelant `activerModeHorsLigne`).

- **Bouton de téléchargement – `PlayerScreen.tsx`**
  - Utilise :
    - `telechargerChanson` / `supprimerChansonTelechargee`.
    - `estChansonTelechargee` pour colorer l’icône Download.
  - Enregistre uniquement l’**ID** de la chanson, pas le fichier audio complet (téléchargement simulé pour le TP).

---

## 9. Rôle de Google Sign-In dans le TP

- Auth Google permet à l’utilisateur de se connecter via son compte Google en plus de l’email/mot de passe.
- Le compte admin reste basé sur l’**email Firebase** `admin@ict.com`.
- La logique applicative (playlists, favoris, téléchargements) est **indépendante** du fournisseur (Google, GitHub, email).

---

## 10. Problème : téléchargements non visibles en mode hors‑ligne

### 10.1. Ce que fait le code

- Quand tu cliques sur le bouton **Download** dans `PlayerScreen` :
  - L’ID du morceau en cours (`morceauActuel.id`) est transmis à `telechargerChanson`.
  - L’ID est ajouté à `idsChansonsTelechargees` et stocké dans `AsyncStorage` (`key = 'telechargements'`).
  - La prochaine fois que l’app redessine :
    - `HomeScreen` garde uniquement les chansons dont l’ID est dans cette liste quand le mode hors‑ligne est actif.

### 10.2. Pourquoi tu ne vois rien en offline

Plusieurs causes possibles (liées à la logique actuelle) :

1. **Mode hors‑ligne pas activé** :
   - Télécharger un titre **ne suffit pas** : il faut aussi activer le mode hors‑ligne dans `AccountScreen`.
2. **IDs différents** :
   - `ServiceTelechargement` ne stocke que l’ID Firestore (ex: `abc123`).
   - `HomeScreen` se base sur la liste renvoyée par `recupererToutesLesChansons()`.
   - Si tu es totalement offline avant d’avoir chargé les chansons au moins une fois, la liste visible peut ne pas inclure ces IDs (surtout si Firestore n’a jamais renvoyé ces documents pendant cette session).
3. **Simulations TP (pas de vrai fichier offline)** :
   - Le “téléchargement” est simulé : seul l’ID est marqué comme téléchargé. Si Firestore ne répond plus et que le fallback repasse sur `musiquesLocales` (IDs `secours-*`), tes nouveaux titres n’apparaissent pas.

### 10.3. Comportement conseillé pour la démo TP

Pour que le mode offline soit cohérent pendant la soutenance/TP :

1. **Laisse Firestore accessible la première fois** :
   - Ouvre l’app en ligne → laisse `HomeScreen` charger les musiques Firestore.
   - Télécharge quelques titres via le lecteur (`PlayerScreen`).
2. **Active le mode hors‑ligne depuis l’écran Compte** :
   - `AccountScreen` → option “Mode Hors-ligne”.
3. Ensuite seulement, coupe la connexion :
   - `HomeScreen` devrait n’afficher que les titres téléchargés (ceux dont l’ID a été marqué).

Pour un vrai offline complet (sans Firestore du tout), il faudrait aller plus loin que le TP actuel :
- Persister **les métadonnées des chansons téléchargées** (titre, artiste, artwork, url) dans `AsyncStorage`.
- Charger la liste **depuis ce cache local** quand Firestore est inaccessible.
- Eventuellement stocker le fichier audio dans le stockage local de l’app (ce que le TP ne fait pas, par simplification).

---

## 11. Conclusion

L’application **Spotify Clone** propose une architecture complète typique d’un projet mobile :
- Auth multi‑providers (email, Google, GitHub) avec un rôle administrateur basé sur l’email.
- Données distantes via Firestore avec mode dégradé (fallback local).
- Lecteur audio complet inspiré de Spotify (mini‑lecteur, plein écran, historique).
- Téléchargements simulés et bascule en mode hors‑ligne.

Le TP insiste surtout sur :
- La séparation claire entre **écrans**, **services**, **contextes** et **composants**.
- L’intégration d’outils externes (Firebase, Cloudinary, TrackPlayer, Google Sign‑In).
- La gestion d’états avancés (offline, historique, favoris, rôle admin).

