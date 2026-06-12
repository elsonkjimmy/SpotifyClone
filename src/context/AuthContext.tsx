/**
 * Contexte d'authentification unifié (Firebase + mode démo).
 */
import React, {createContext, useContext, useEffect, useState} from 'react';
import {surveillerChangementEtatAuthentification} from '../services/auth';
import type {UtilisateurAuth} from '../types';

export const EMAIL_ADMIN = 'admin@ict.com';

export const estAdministrateur = (email?: string | null) =>
  email?.toLowerCase() === EMAIL_ADMIN;

interface AuthContextValue {
  utilisateur: UtilisateurAuth | null;
  chargement: boolean;
  estAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  utilisateur: null,
  chargement: true,
  estAdmin: false,
});

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [utilisateur, setUtilisateur] = useState<UtilisateurAuth | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const desabonner = surveillerChangementEtatAuthentification(user => {
      if (user) {
        setUtilisateur({
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
        });
      } else {
        setUtilisateur(null);
      }
      setChargement(false);
    });
    return desabonner;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        chargement,
        estAdmin: estAdministrateur(utilisateur?.email),
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
