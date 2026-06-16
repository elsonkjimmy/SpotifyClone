import React, {useState, useEffect} from 'react';
import {TouchableOpacity} from 'react-native';
import {Heart} from 'lucide-react-native';
import {COLORS} from '../theme/colors';
import {basculerFavori, estChansonFavorie} from '../services/firestore';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {Chanson} from '../types';

interface Props {
  chanson: Chanson;
  taille?: number;
}

const BoutonLike = ({chanson, taille = 24}: Props) => {
  const {utilisateur} = useAuth();
  const {showToast} = useToast();
  const [estFavori, setEstFavori] = useState(false);

  useEffect(() => {
    const verifier = async () => {
      if (utilisateur) {
        setEstFavori(await estChansonFavorie(utilisateur.uid, chanson.id));
      }
    };
    verifier();
  }, [utilisateur, chanson.id]);

  const gererLike = async () => {
    if (!utilisateur) {
      showToast('Connectez-vous pour liker');
      return;
    }

    // UI Optimiste : on change la couleur instantanément
    const nouvelEtat = !estFavori;
    setEstFavori(nouvelEtat);
    showToast(nouvelEtat ? 'Ajouté aux favoris' : 'Retiré des favoris', 'success');

    // On synchronise avec Firestore en arrière-plan
    try {
      await basculerFavori(utilisateur.uid, chanson);
    } catch (e) {
      // En cas d'erreur, on revient en arrière
      setEstFavori(!nouvelEtat);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  return (
    <TouchableOpacity onPress={gererLike}>
      <Heart
        color={estFavori ? COLORS.green : COLORS.white}
        size={taille}
        fill={estFavori ? COLORS.green : 'transparent'}
      />
    </TouchableOpacity>
  );
};

export default BoutonLike;
