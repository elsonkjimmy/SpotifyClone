/**
 * Types partagés pour le catalogue musical et l'authentification.
 */

export interface Chanson {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  genre?: string;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  nom: string;
  createur: string;
  image?: string;
  songIds: string[];
  estSpeciale?: boolean;
  userId?: string;
}

export interface UtilisateurAuth {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
