/**
 * Composant visuel représentant une carte de musique ou d'album.
 * Affiche l'image de couverture, le titre et l'artiste.
 * Style : Glassmorphism premium avec animation de rebond au clic.
 */
import React, {useRef, useCallback} from 'react';
import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {COLORS, SPACING} from '../theme/colors';

interface ProprietesDeLaCarte {
  titre: string;
  artiste: string;
  urlImage: string;
  actionAuClic: () => void;
}

const ComposantCarteMusique = ({
  titre,
  artiste,
  urlImage,
  actionAuClic,
}: ProprietesDeLaCarte) => {
  // Réf pour l'échelle d'animation du clic
  const valeurEchelle = useRef(new Animated.Value(1)).current;

  // Déclenche l'animation d'échelle (scale) sur clic
  const gererAppui = useCallback(() => {
    Animated.sequence([
      Animated.timing(valeurEchelle, {
        toValue: 0.94,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(valeurEchelle, {
        toValue: 1.0,
        friction: 4,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();

    actionAuClic();
  }, [actionAuClic, valeurEchelle]);

  return (
    <Animated.View style={{transform: [{scale: valeurEchelle}]}}>
      <TouchableOpacity
        style={styles.conteneurDeLaCarte}
        onPress={gererAppui}
        activeOpacity={0.85}>
        <Image source={{uri: urlImage}} style={styles.imageDeCouverture} />
        <Text style={styles.texteTitre} numberOfLines={1}>
          {titre}
        </Text>
        <Text style={styles.texteArtiste} numberOfLines={1}>
          {artiste}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  conteneurDeLaCarte: {
    width: 154,
    marginRight: SPACING.m,
    marginBottom: SPACING.m,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Aspect verre givré translucide
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Bordure effet verre
    borderRadius: 14,
    padding: SPACING.s + 2,
    // Ombre délicate
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  imageDeCouverture: {
    width: '100%',
    height: 134,
    borderRadius: 10,
    backgroundColor: COLORS.cardBackground,
  },
  texteTitre: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: SPACING.s,
  },
  texteArtiste: {
    color: COLORS.lightGray,
    fontSize: 12,
    marginTop: 2,
  },
});

export default ComposantCarteMusique;
