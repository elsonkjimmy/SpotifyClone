import {useState, useEffect} from 'react';
import {
  obtenirModeHorsLigne,
  sAbonnerAuModeHorsLigne,
} from '../services/ServiceTelechargement';

export const useOffline = () => {
  const [estHorsLigne, setEstHorsLigne] = useState(obtenirModeHorsLigne());

  useEffect(() => {
    const desabonner = sAbonnerAuModeHorsLigne(setEstHorsLigne);
    return desabonner;
  }, []);

  return estHorsLigne;
};
