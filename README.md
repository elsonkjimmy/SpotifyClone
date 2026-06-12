# Spotify Clone — TP Mobile ICTL2

Application React Native inspirée de Spotify : catalogue musical, playlists, lecteur audio, authentification Firebase et upload admin via Cloudinary.

## Prérequis

- Node.js 18+
- Android Studio (émulateur ou appareil)
- Compte Firebase avec Auth (email/mot de passe) et Firestore activés

## Installation

```bash
npm install
npm start
# Dans un autre terminal :
npm run android
```

## Comptes

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin (upload musique) | `admin@ict.com` | (votre mot de passe Firebase) |
| Utilisateur | tout compte Firebase valide | — |

L'application fonctionne aussi en **mode démo** si Firebase n'est pas configuré.

## Fonctionnalités

- **Accueil** : sections musicales depuis Firestore
- **Recherche** : par titre, artiste ou catégorie
- **Bibliothèque** : playlists Firestore avec détail et lecture
- **Lecteur** : mini-player, plein écran, seek, shuffle, repeat, favoris
- **Compte** : connexion / inscription / déconnexion
- **Admin** : ajout MP3 + pochette via Cloudinary → Firestore

## Structure

```
src/
├── screens/      # Écrans
├── components/   # UI réutilisable
├── services/     # Firebase, lecteur, Cloudinary
├── context/      # AuthContext
├── navigation/   # Stack + Tabs
└── theme/        # Couleurs Spotify
```

## Firebase

Collections Firestore utilisées :

- `songs` — `{ title, artist, artwork, url, genre? }`
- `playlists` — `{ nom, createur, image?, songIds[], estSpeciale? }`
- `users/{uid}/likes` — favoris par utilisateur

Les données de test sont créées automatiquement au premier lancement si les collections sont vides.

## Cloudinary (admin)

Configurer un upload preset **unsigned** nommé `spotify_televersement` dans le dashboard Cloudinary, puis mettre à jour `src/services/ServiceTeleversement.ts`.

## Scripts

```bash
npm run android   # Lancer sur Android
npm run lint      # Vérifier le code
npm test          # Tests Jest
```
